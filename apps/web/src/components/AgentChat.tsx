import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useStore } from '@tanstack/react-store'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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

      <div className="space-y-4 rounded border border-white/10 bg-black/20 p-4 min-h-[40vh]">
        {messages.length === 0 ? (
          <div className="text-sm opacity-50">
            Try: <em>"What are my PRs?"</em> or <em>"Build me a 4-week strength program."</em>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-sm">
              <div className="mb-1 text-[10px] uppercase tracking-widest opacity-40">{m.role}</div>
              <div className="space-y-2">
                {m.parts.map((part, i) => (
                  <MessagePart key={i} part={part} />
                ))}
              </div>
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
    return (
      <div className="md-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {String(p.text ?? '')}
        </ReactMarkdown>
      </div>
    )
  }

  if (part.type.startsWith('tool-')) {
    const toolName = part.type.replace(/^tool-/, '')
    const state = String(p.state ?? '')
    const running = state === 'input-streaming' || state === 'input-available'
    const errored = state === 'output-error'
    const workflow = extractWorkflow(p.output)
    return (
      <div className="space-y-1">
        <ToolPill toolName={toolName} running={running} errored={errored} />
        {workflow ? <WorkflowStepList workflow={workflow} /> : null}
      </div>
    )
  }

  return null
}

function ToolPill({
  toolName,
  running,
  errored,
}: {
  toolName: string
  running: boolean
  errored: boolean
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[11px] ${
        errored
          ? 'border-rose-400/40 bg-rose-400/10 text-rose-200'
          : running
            ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
            : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
      }`}
    >
      <span aria-hidden className="text-[10px] opacity-70">
        {errored ? '✕' : running ? '◐' : '✓'}
      </span>
      <span className="opacity-70">{running ? 'calling' : errored ? 'failed' : 'called'}</span>
      <span className="font-semibold">{toolName}</span>
    </div>
  )
}

type WorkflowStep = { stepId: string; status: 'finished' | 'failed'; durationMs?: number; error?: string }
type WorkflowReport = { id: string; steps: WorkflowStep[] }

function extractWorkflow(output: unknown): WorkflowReport | null {
  if (!output || typeof output !== 'object') return null
  const wf = (output as Record<string, unknown>).workflow
  if (!wf || typeof wf !== 'object') return null
  const w = wf as Record<string, unknown>
  if (typeof w.id !== 'string' || !Array.isArray(w.steps)) return null
  return { id: w.id, steps: w.steps as WorkflowStep[] }
}

function WorkflowStepList({ workflow }: { workflow: WorkflowReport }) {
  return (
    <div className="ml-3 rounded-md border border-white/10 bg-black/30 p-2">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-widest opacity-60">
        <span>workflow</span>
        <span className="font-mono opacity-80">{workflow.id}</span>
        <span className="opacity-40">·</span>
        <span>{workflow.steps.length} steps</span>
      </div>
      <ol className="space-y-1">
        {workflow.steps.map((s, i) => (
          <li key={`${s.stepId}-${i}`}>
            <WorkflowStepPill step={s} />
          </li>
        ))}
      </ol>
    </div>
  )
}

function WorkflowStepPill({ step }: { step: WorkflowStep }) {
  const failed = step.status === 'failed'
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-2 py-0.5 font-mono text-[10px] ${
        failed
          ? 'border-rose-400/40 bg-rose-400/10 text-rose-200'
          : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
      }`}
      title={step.error}
    >
      <span aria-hidden className="text-[9px] opacity-70">{failed ? '✕' : '✓'}</span>
      <span className="font-semibold">{step.stepId}</span>
      {typeof step.durationMs === 'number' ? (
        <span className="opacity-60">{step.durationMs}ms</span>
      ) : null}
    </div>
  )
}
