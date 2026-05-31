import { useEffect, useRef, useState } from 'react'
import { useRanger, type Ranger } from '@tanstack/react-ranger'
import { useSelector } from '@tanstack/react-store'
import { maxxStore, setMaxx } from '#/state/maxx-store'
import { tierFor } from '#/components/Maxx/maxx-tiers'

const MIN = 0
const MAX = 110

export function MaxxSlider() {
  const persisted = useSelector(maxxStore, (s) => s)
  const [values, setValues] = useState<number[]>([persisted.lower, persisted.upper])
  const trackRef = useRef<HTMLDivElement>(null)
  const [, force] = useState(0)

  // Keep local state in sync with persisted state (e.g. after hydration).
  useEffect(() => {
    setValues([persisted.lower, persisted.upper])
  }, [persisted.lower, persisted.upper])

  const ranger = useRanger<HTMLDivElement>({
    getRangerElement: () => trackRef.current,
    values,
    min: MIN,
    max: MAX,
    stepSize: 1,
    onDrag: (instance: Ranger<HTMLDivElement>) => {
      setValues([...instance.sortedValues])
      force((n) => n + 1)
    },
    onChange: (instance: Ranger<HTMLDivElement>) => {
      const sorted = instance.sortedValues
      setMaxx({ lower: sorted[0], upper: sorted[1] })
    },
  })

  const tier = tierFor(values[1] ?? persisted.upper)

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col text-right">
        <span className="text-[10px] uppercase tracking-wider opacity-60">the maxx</span>
        <span className="font-mono text-[11px]" style={{ color: 'var(--maxx-accent)' }}>
          {Math.round(values[0])}–{Math.round(values[1])} · {tier.label}
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative h-2 w-44 rounded-full bg-white/10"
        style={{ touchAction: 'none' }}
      >
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${ranger.getPercentageForValue(values[0])}%`,
            width: `${ranger.getPercentageForValue(values[1]) - ranger.getPercentageForValue(values[0])}%`,
            background: 'var(--maxx-accent)',
          }}
        />
        {ranger
          .handles()
          .map(({ value, onKeyDownHandler, onMouseDownHandler, onTouchStart, isActive }, i) => (
            <button
              key={i}
              type="button"
              role="slider"
              aria-valuemin={MIN}
              aria-valuemax={MAX}
              aria-valuenow={value}
              onKeyDown={onKeyDownHandler}
              onMouseDown={onMouseDownHandler}
              onTouchStart={onTouchStart}
              className="absolute top-1/2 h-4 w-4 rounded-full border border-white/70 outline-none ring-0 transition-transform"
              style={{
                left: `${ranger.getPercentageForValue(value)}%`,
                background: 'var(--maxx-accent)',
                transform: `translate(-50%, -50%) scale(${isActive ? 1.2 : 1})`,
              }}
            />
          ))}
      </div>
    </div>
  )
}
