import { create } from "zustand";
import type { ChatEvent, ChatFuente, OrigenRespuesta } from "@/lib/chat-stream";
import { leerStreamNdjson } from "@/lib/ndjson-reader";
import { useChatHistoryStore } from "./chatHistoryStore";
import { detectarIntencionRecordatorio } from "@/lib/reminder-intent";
import {
  construirMensajeBloqueoComparador,
  detectarIntencionComparador,
} from "@/lib/comparison-intent";
import { reminderService } from "@/services/ReminderService";
import { subscriptionService } from "@/services/SubscriptionService";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: OrigenRespuesta | null;
  phase?: OrigenRespuesta | null;
  citations?: ChatFuente[];
  knowledge?: boolean;
};

type AIStore = {
  messages: Message[];
  isGenerating: boolean;
  hasSubmitted: boolean;
  generateResponse: (prompt: string) => Promise<void>;
  prompt: string;
  setPrompt: (prompt: string) => void;
  resetChat: () => void;
  setLoadedConversation: (messages: Message[]) => void;
};

const aplicarEvento = (messages: Message[], evento: ChatEvent): Message[] => {
  const index = messages.length - 1;
  const actual = messages[index];

  if (!actual || actual.role !== "assistant") return messages;

  const copia = [...messages];

  switch (evento.type) {
    case "status":
      copia[index] = { ...actual, phase: evento.phase };
      break;
    case "source":
      copia[index] = { ...actual, source: evento.source, phase: evento.source };
      break;
    case "delta":
      copia[index] = { ...actual, content: actual.content + evento.text };
      break;
    case "citations":
      copia[index] = { ...actual, citations: evento.items };
      break;
    case "knowledge":
      copia[index] = { ...actual, knowledge: evento.guardado };
      break;
    case "error": {
      const sep = actual.content ? "\n\n" : "";
      copia[index] = {
        ...actual,
        content: `${actual.content}${sep}${evento.message}`,
        phase: null,
      };
      break;
    }
    case "done":
      copia[index] = { ...actual, phase: null };
      break;
  }

  return copia;
};

export const useAIStore = create<AIStore>((set, get) => ({
  messages: [],
  isGenerating: false,
  hasSubmitted: false,
  prompt: "",
  setPrompt: (prompt) => set({ prompt }),
  resetChat: () =>
    set({
      messages: [],
      isGenerating: false,
      hasSubmitted: false,
      prompt: "",
    }),
  setLoadedConversation: (messages) =>
    set({
      messages,
      isGenerating: false,
      hasSubmitted: messages.length > 0,
      prompt: "",
    }),
  generateResponse: async (prompt) => {
    set({
      isGenerating: true,
      hasSubmitted: true,
    });

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
    };

    const messagesWithUser = [...get().messages, userMessage];

    set({
      messages: messagesWithUser,
    });

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      source: null,
      phase: null,
      citations: [],
    };

    set((state) => ({
      messages: [...state.messages, assistantMessage],
    }));

    const finalizar = () => set({ isGenerating: false });

    const intencionRecordatorio = detectarIntencionRecordatorio(prompt, get().messages);
    if (intencionRecordatorio.esRecordatorio) {
      set((state) => ({
        messages: aplicarEvento(state.messages, { type: "source", source: "rag" }),
      }));

      try {
        const resultado = await reminderService.procesarSolicitudEnChat(
          intencionRecordatorio.consultaBeca
        );

        set((state) => {
          const idx = state.messages.length - 1;
          const copia = [...state.messages];
          copia[idx] = {
            ...copia[idx],
            content: resultado.mensaje,
            phase: null,
            source: "rag",
          };
          return { messages: copia };
        });

        useChatHistoryStore.getState().persistTurn(prompt, resultado.mensaje);
      } catch (err: any) {
        set((state) => ({
          messages: aplicarEvento(state.messages, {
            type: "error",
            message: `No se pudo procesar la solicitud de recordatorio: ${err.message}`,
          }),
        }));
      } finally {
        finalizar();
      }
      return;
    }

    const intencionComparador = detectarIntencionComparador(prompt);
    let messagesParaServidor = messagesWithUser.map(({ role, content }) => ({
      role,
      content,
    }));

    if (intencionComparador.esComparacion) {
      try {
        const estadoSub = await subscriptionService.obtenerEstadoSuscripcion();
        const estaAutenticado = estadoSub.estado !== "sin_sesion";

        if (!estadoSub.esPremium) {
          const msgBloqueo = construirMensajeBloqueoComparador(estaAutenticado);

          set((state) => {
            const idx = state.messages.length - 1;
            const copia = [...state.messages];
            copia[idx] = {
              ...copia[idx],
              content: msgBloqueo,
              phase: null,
              source: "rag",
            };
            return { messages: copia };
          });

          if (estaAutenticado) {
            useChatHistoryStore.getState().persistTurn(prompt, msgBloqueo);
          }

          finalizar();
          return;
        }

        messagesParaServidor = [
          ...messagesParaServidor.slice(0, -1),
          { role: "user", content: intencionComparador.promptEnriquecido },
        ];
      } catch (err) {
        console.error("Error verificando suscripción para comparador:", err);
      }
    }

    let response: Response;

    try {
      response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesParaServidor,
        }),
      });
    } catch {
      set((state) => ({
        messages: aplicarEvento(state.messages, {
          type: "error",
          message: "No se pudo conectar con el servidor.",
        }),
      }));
      finalizar();
      return;
    }

    if (!response.ok || !response.body) {
      set((state) => ({
        messages: aplicarEvento(state.messages, {
          type: "error",
          message: `El servidor respondió con un error (${response.status}).`,
        }),
      }));
      finalizar();
      return;
    }

    try {
      await leerStreamNdjson(response, (evento) => {
        set((state) => ({
          messages: aplicarEvento(state.messages, evento),
        }));
      });

      const msgsActuales = get().messages;
      const ultimoAsistente = msgsActuales[msgsActuales.length - 1];
      if (ultimoAsistente && ultimoAsistente.role === "assistant" && ultimoAsistente.content.trim()) {
        useChatHistoryStore.getState().persistTurn(prompt, ultimoAsistente.content);
      }
    } catch (err) {
      console.error("Error leyendo stream ndjson:", err);
    } finally {
      finalizar();
    }
  },
}));
