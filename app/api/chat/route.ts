import { aiService } from "@/services/AIService";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = aiService.generateResponse(messages);

  return result.toTextStreamResponse();
}
