import { HOTKEYS } from '#/lib/hotkey-registry'

export function HotkeyOverlay({
  open,
  onClose,
  heldKeys,
}: {
  open: boolean
  onClose: () => void
  heldKeys?: ReadonlySet<string>
}) {
  if (!open) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[min(640px,90vw)] rounded-lg border border-white/15 bg-neutral-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Hotkeys</h2>
          <button onClick={onClose} className="text-xs opacity-60 hover:opacity-100">
            esc
          </button>
        </div>

        <div className="mb-4 rounded border border-white/10 bg-black/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-widest opacity-50">currently held</div>
          <div className="mt-1 min-h-[1.5rem] font-mono text-sm tabular-nums">
            {heldKeys && heldKeys.size > 0
              ? [...heldKeys].map(formatKey).join(' + ')
              : <span className="opacity-40">— nothing —</span>}
          </div>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {HOTKEYS.map((h) => (
            <div key={h.id} className="contents">
              <dt className="font-mono">{renderCombo(h.combo)}</dt>
              <dd className="opacity-80">{h.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

function renderCombo(combo: string | string[]): string {
  if (Array.isArray(combo)) return combo.map((k) => k.toLowerCase()).join(' ')
  return combo.replace('Shift+/', '?').replace('Space', '␣').replace(/^Arrow/, '')
}

function formatKey(k: string): string {
  if (k === ' ' || k === 'Space') return '␣'
  if (k.startsWith('Arrow')) return k.slice(5).toLowerCase()
  return k.length === 1 ? k.toUpperCase() : k
}
