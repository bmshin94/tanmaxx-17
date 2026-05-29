import { createAnthropic } from '@ai-sdk/anthropic'

let _provider: ReturnType<typeof createAnthropic> | undefined

export function anthropic() {
  if (!_provider) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')
    _provider = createAnthropic({ apiKey })
  }
  return _provider
}

export const MODEL_FAST = 'claude-haiku-4-5-20251001'
export const MODEL_SMART = 'claude-sonnet-4-6'
