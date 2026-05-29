import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useStore } from '@tanstack/react-store'
import { maxxStore } from '../state/maxx-store'

export default function AgentChat() {
  const maxx = useStore(maxxStore, (s) => s)
  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          sessionId: 'seed-1',
          lower: maxx.lower,
          upper: maxx.upper,
        },
      }),
    }),
  })

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Agent</h1>
        <span className="font-mono text-xs opacity-60">
          intensity {Math.round(maxx.lower)}–{Math.round(maxx.upper)}%
        </span>
      </div>

      <div className="space-y-3 rounded border border-white/10 bg-black/20 p-3 min-h-[40vh]">
        {messages.length === 0 ? (
          <div className="text-sm opacity-50">
            Try: <em>“What are my PRs?”</em> or <em>“Build me a 4-week strength program.”</em>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-sm">
              <div className="mb-1 text-xs uppercase tracking-wide opacity-50">{m.role}</div>
              {m.parts.map((part, i) => (
                <MessagePart key={i} part={part} />
              ))}
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!input.trim()) return
          sendMessage({ text: input })
          setInput('')
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the agent…"
          disabled={status === 'streaming' || status === 'submitted'}
          className="flex-1 rounded border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/40"
        />
        <button
          type="submit"
          disabled={status === 'streaming' || status === 'submitted' || !input.trim()}
          className="rounded bg-white px-4 py-2 text-sm font-bold text-black disabled:opacity-40"
        >
          {status === 'streaming' ? '…' : 'send'}
        </button>
      </form>
    </section>
  )
}

function MessagePart({ part }: { part: { type: string } }) {
  const p = part as unknown as Record<string, unknown>
  if (part.type === 'text') {
    return <p className="whitespace-pre-wrap">{String(p.text ?? '')}</p>
  }
  if (part.type.startsWith('tool-')) {
    const toolName = part.type.replace(/^tool-/, '')
    return (
      <div className="my-2 rounded border border-white/15 bg-black/40 p-2 text-xs font-mono">
        <div className="opacity-60">tool: {toolName}</div>
        <pre className="mt-1 overflow-auto whitespace-pre-wrap break-words">
          {JSON.stringify(p, null, 2)}
        </pre>
      </div>
    )
  }
  return null
}
