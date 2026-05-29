export type MaxxTierId =
  | 'deload'
  | 'volume'
  | 'hypertrophy'
  | 'strength'
  | 'peaking'
  | 'sendmode'
  | 'gigamaxx'
  | 'injury'

export type MaxxTier = { id: MaxxTierId; min: number; max: number; label: string; vibe: string }

export const MAXX_TIERS: MaxxTier[] = [
  { id: 'deload', min: 0, max: 20, label: 'deload', vibe: 'apologetic' },
  { id: 'volume', min: 20, max: 40, label: 'Volume', vibe: 'calm' },
  { id: 'hypertrophy', min: 40, max: 60, label: 'Hypertrophy', vibe: 'normal' },
  { id: 'strength', min: 60, max: 75, label: 'Strength', vibe: 'bolder' },
  { id: 'peaking', min: 75, max: 90, label: 'Peaking', vibe: 'heavier, redder' },
  { id: 'sendmode', min: 90, max: 100, label: 'SENDMODE', vibe: 'condensed' },
  { id: 'gigamaxx', min: 100, max: 105, label: 'GIGAMAXX', vibe: 'display font, 3x' },
  { id: 'injury', min: 105, max: 110, label: 'INJURY ZONE', vibe: 'red pulse, shake' },
]

export function tierFor(upper: number): MaxxTier {
  for (let i = MAXX_TIERS.length - 1; i >= 0; i--) {
    if (upper >= MAXX_TIERS[i].min) return MAXX_TIERS[i]
  }
  return MAXX_TIERS[0]
}

/** Linear interpolation between anchor points. `anchors` must be sorted by x ascending. */
export function lerpAtAnchors(x: number, anchors: ReadonlyArray<[number, number]>): number {
  if (anchors.length === 0) return 0
  if (x <= anchors[0][0]) return anchors[0][1]
  if (x >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1]
  for (let i = 0; i < anchors.length - 1; i++) {
    const [x0, y0] = anchors[i]
    const [x1, y1] = anchors[i + 1]
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0)
      return y0 + (y1 - y0) * t
    }
  }
  return anchors[anchors.length - 1][1]
}

/** Lerp HSL `[h, s, l]` triple across anchors. */
export function lerpHslAtAnchors(
  x: number,
  anchors: ReadonlyArray<[number, [number, number, number]]>,
): [number, number, number] {
  const h = lerpAtAnchors(
    x,
    anchors.map(([k, [hh]]) => [k, hh] as [number, number]),
  )
  const s = lerpAtAnchors(
    x,
    anchors.map(([k, [, ss]]) => [k, ss] as [number, number]),
  )
  const l = lerpAtAnchors(
    x,
    anchors.map(([k, [, , ll]]) => [k, ll] as [number, number]),
  )
  return [h, s, l]
}
