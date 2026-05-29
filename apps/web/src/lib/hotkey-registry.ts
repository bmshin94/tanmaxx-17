export type HotkeyKind = 'single' | 'sequence'

export type HotkeyEntry = {
  id: string
  combo: string | string[]
  kind: HotkeyKind
  scope: 'global' | 'session'
  label: string
}

export const HOTKEYS: HotkeyEntry[] = [
  { id: 'log-set', combo: 'Space', kind: 'single', scope: 'session', label: 'Log current set' },
  { id: 'weight-up', combo: 'ArrowUp', kind: 'single', scope: 'session', label: '+5 lb' },
  { id: 'weight-down', combo: 'ArrowDown', kind: 'single', scope: 'session', label: '−5 lb' },
  { id: 'reps-up', combo: 'ArrowRight', kind: 'single', scope: 'session', label: '+1 rep' },
  { id: 'reps-down', combo: 'ArrowLeft', kind: 'single', scope: 'session', label: '−1 rep' },
  { id: 'rest', combo: 'R', kind: 'single', scope: 'session', label: 'Start rest timer' },
  { id: 'skip', combo: 'S', kind: 'single', scope: 'session', label: 'Skip set' },
  { id: 'prev-exercise', combo: '[', kind: 'single', scope: 'session', label: 'Previous exercise' },
  { id: 'next-exercise', combo: ']', kind: 'single', scope: 'session', label: 'Next exercise' },
  { id: 'nav-dashboard', combo: ['G', 'G'], kind: 'sequence', scope: 'global', label: 'Go to dashboard' },
  { id: 'nav-history', combo: ['G', 'H'], kind: 'sequence', scope: 'global', label: 'Go to history' },
  { id: 'nav-session', combo: ['G', 'S'], kind: 'sequence', scope: 'global', label: 'Go to current session' },
  { id: 'toggle-overlay', combo: 'Shift+/', kind: 'single', scope: 'global', label: 'Toggle help overlay' },
]
