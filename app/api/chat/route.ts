import { chatService } from "@/services/ChatService";
import type { ChatMessage } from "@/lib/chat-stream";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let messages: ChatMessage[] = [];

  try {
    const body = await req.json();
    if (Array.isArray(body?.messages)) {
      messages = body.messages;
    }
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const stream = chatService.responder(messages);

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
