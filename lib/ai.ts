import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const apiKey = process.env.OPENROUTER_API_KEY;

export const openrouter = createOpenRouter({
  apiKey
})
