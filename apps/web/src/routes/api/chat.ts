import { createFileRoute } from '@tanstack/react-router'
import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from 'ai'
import { anthropic, MODEL_SMART } from '../../server/ai/anthropic'
import { buildAgentTools } from '../../server/ai/tools'

type ChatBody = {
  messages: UIMessage[]
  sessionId?: string
  lower?: number
  upper?: number
}

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody
        const tools = buildAgentTools({
          sessionId: body.sessionId ?? 'seed-1',
          lower: body.lower ?? 40,
          upper: body.upper ?? 60,
        })

        const result = streamText({
          model: anthropic()(MODEL_SMART),
          system:
            'You are a strength-training coach inside the TanMaxx app. Use the available tools to log sets, fetch PRs, and generate programs. Be concise and direct.',
          messages: await convertToModelMessages(body.messages),
          tools,
          stopWhen: stepCountIs(4),
        })

        return result.toUIMessageStreamResponse()
      },
    },
  },
})
