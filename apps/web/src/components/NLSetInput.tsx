import { useState } from 'react'

type ParsedSet = { weight: number; reps: number; rpe: number | null }

export function NLSetInput({
  onParsed,
}: {
  onParsed: (parsed: ParsedSet) => void
}) {
  const [utterance, setUtterance] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!utterance.trim()) return
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/parse-set', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ utterance }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const parsed = (await res.json()) as ParsedSet
      onParsed(parsed)
      setUtterance('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        type="text"
        value={utterance}
        onChange={(e) => setUtterance(e.target.value)}
        placeholder='“three by five at two twenty-five”'
        className="flex-1 rounded border border-white/15 bg-black/30 px-3 py-1.5 text-sm outline-none focus:border-white/40"
      />
      <button
        type="submit"
        disabled={pending || !utterance.trim()}
        className="rounded border border-white/25 px-3 py-1.5 text-xs disabled:opacity-40"
      >
        {pending ? 'parsing…' : 'parse'}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </form>
  )
}
