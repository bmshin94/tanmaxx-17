import { useEffect } from 'react'
import { maxxStore, hydrateMaxxStore } from '#/state/maxx-store'
import { lerpAtAnchors, lerpHslAtAnchors, tierFor } from '#/components/Maxx/maxx-tiers'

const ACCENT_ANCHORS: ReadonlyArray<[number, [number, number, number]]> = [
  [0, [200, 80, 55]],
  [75, [0, 95, 50]],
  [100, [300, 100, 60]],
]

const FONT_SCALE_ANCHORS: ReadonlyArray<[number, number]> = [
  [0, 1],
  [100, 1.4],
  [110, 2.2],
]

const TRACKING_ANCHORS: ReadonlyArray<[number, number]> = [
  [0, 0],
  [60, -0.02],
  [100, 0.08],
]

const WEIGHT_ANCHORS: ReadonlyArray<[number, number]> = [
  [0, 400],
  [110, 900],
]

const SHAKE_ANCHORS: ReadonlyArray<[number, number]> = [
  [0, 0],
  [100, 0],
  [110, 3],
]

const ITALIC_ANCHORS: ReadonlyArray<[number, number]> = [
  [0, 0],
  [105, 0],
  [110, -8],
]

function applyStyles(upper: number, lower: number) {
  const root = document.documentElement
  const [h, s, l] = lerpHslAtAnchors(upper, ACCENT_ANCHORS)
  root.style.setProperty('--maxx-accent', `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`)
  root.style.setProperty('--maxx-font-scale', lerpAtAnchors(upper, FONT_SCALE_ANCHORS).toFixed(3))
  root.style.setProperty('--maxx-tracking', `${lerpAtAnchors(upper, TRACKING_ANCHORS).toFixed(3)}em`)
  root.style.setProperty('--maxx-weight', `${Math.round(lerpAtAnchors(upper, WEIGHT_ANCHORS))}`)
  root.style.setProperty('--maxx-shake', `${lerpAtAnchors(upper, SHAKE_ANCHORS).toFixed(2)}px`)
  root.style.setProperty('--maxx-italic', `${lerpAtAnchors(upper, ITALIC_ANCHORS).toFixed(2)}deg`)
  // Glow blooms past 90; stroke kicks in past 100.
  root.style.setProperty(
    '--maxx-glow',
    upper >= 90
      ? `0 0 ${Math.min(40, (upper - 90) * 2.5).toFixed(0)}px var(--maxx-accent)`
      : '0 0 0 transparent',
  )
  root.style.setProperty(
    '--maxx-stroke',
    upper >= 100 ? `${Math.min(2, (upper - 100) * 0.4).toFixed(2)}px var(--maxx-accent)` : '0px transparent',
  )
  root.style.setProperty('--maxx-intensity-lo', String(Math.round(lower)))
  root.style.setProperty('--maxx-intensity-hi', String(Math.round(upper)))
  root.dataset.maxxTier = tierFor(upper).id
}

export function useMaxxStyle() {
  useEffect(() => {
    hydrateMaxxStore()
    const { lower, upper } = maxxStore.state
    applyStyles(upper, lower)
    const sub = maxxStore.subscribe(() => {
      const s = maxxStore.state
      applyStyles(s.upper, s.lower)
    })
    return () => sub.unsubscribe()
  }, [])
}
