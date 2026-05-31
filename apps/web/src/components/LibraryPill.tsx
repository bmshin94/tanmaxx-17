import { LIBRARIES, type LibId } from '#/lib/lib-registry'

type Size = 'sm' | 'md'

export function LibraryPill({ libId, size = 'md' }: { libId: LibId; size?: Size }) {
  const lib = LIBRARIES[libId]
  const padY = size === 'sm' ? 'py-[1px]' : 'py-0.5'
  const text = size === 'sm' ? 'text-[10px]' : 'text-[11px]'
  const gap = size === 'sm' ? 'gap-1' : 'gap-1.5'

  return (
    <span
      className={`inline-flex items-center ${gap} rounded-full bg-black/60 px-1.5 ${padY} font-black uppercase tracking-wide ${text} leading-none`}
      style={{ outline: `1px solid ${lib.color}40` }}
    >
      <span
        className="rounded-full px-1.5 py-[2px] leading-none"
        style={{
          background: lib.color,
          color: lib.textOnColor === 'black' ? '#000' : '#fff',
        }}
      >
        TANSTACK
      </span>
      <span style={{ color: lib.color }}>{lib.name}</span>
      {lib.status ? (
        <span
          className="rounded-full px-1.5 py-[1px] text-[9px] font-bold leading-none"
          style={{ background: lib.color, color: lib.textOnColor === 'black' ? '#000' : '#fff' }}
        >
          {lib.status.toUpperCase()}
        </span>
      ) : null}
    </span>
  )
}
