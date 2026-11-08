import { create } from "zustand";
import type { ChatEvent, ChatFuente, OrigenRespuesta } from "@/lib/chat-stream";
import { leerStreamNdjson } from "@/lib/ndjson-reader";
import { useChatHistoryStore } from "./chatHistoryStore";
import { detectarIntencionRecordatorio } from "@/lib/reminder-intent";
import { reminderService } from "@/services/ReminderService";

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

    // 1. Interceptar intención de recordatorio antes del stream de búsqueda general
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

        // Persistir en historial si está autenticado
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

    // 2. Consulta normal a /api/chat (RAG + Web)
    let response: Response;

    try {
      response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesWithUser.map(({ role, content }) => ({ role, content })),
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

      // Si el usuario está autenticado, persistir el turno en PostgreSQL
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
