import { create } from "zustand";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AIStore = {
  messages: Message[];
  isGenerating: boolean;
  hasSubmitted: boolean;
  generateResponse: (prompt: string) => Promise<void>;
  prompt: string,
  setPrompt: (prompt: string) => void,
  resetChat: () => void
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

    const messagesWithUser = [
      ...get().messages,
      userMessage,
    ];

    set({
      messages: messagesWithUser,
    });

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messagesWithUser,
      }),
    });

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };

    set((state) => ({
      messages: [
        ...state.messages,
        assistantMessage,
      ],
    }));

    const reader = response.body?.getReader();

    if (!reader) {
      set({ isGenerating: false });
      return;
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);

      set((state) => {
        const messages = [...state.messages];

        const lastMessage = messages[messages.length - 1];

        messages[messages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + chunk,
        };

        return {
          messages,
        };
      });
    }

    set({
      isGenerating: false,
    });
  },
  set
}));
