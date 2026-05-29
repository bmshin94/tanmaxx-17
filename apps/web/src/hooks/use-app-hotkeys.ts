import { useHotkey, useHotkeySequence } from '@tanstack/react-hotkeys'

export type HotkeyHandlers = Partial<{
  'log-set': () => void
  'weight-up': () => void
  'weight-down': () => void
  'reps-up': () => void
  'reps-down': () => void
  'rest': () => void
  'skip': () => void
  'prev-exercise': () => void
  'next-exercise': () => void
  'nav-dashboard': () => void
  'nav-history': () => void
  'nav-session': () => void
  'toggle-overlay': () => void
}>

const noop = () => {}

export function useAppHotkeys(handlers: HotkeyHandlers) {
  // Session-scope bindings. Space stays enabled inside inputs so the form can submit.
  useHotkey('Space', handlers['log-set'] ?? noop, { enabled: !!handlers['log-set'] })
  useHotkey('ArrowUp', (e) => { e.preventDefault(); handlers['weight-up']?.() }, {
    enabled: !!handlers['weight-up'],
  })
  useHotkey('ArrowDown', (e) => { e.preventDefault(); handlers['weight-down']?.() }, {
    enabled: !!handlers['weight-down'],
  })
  useHotkey('ArrowRight', (e) => { e.preventDefault(); handlers['reps-up']?.() }, {
    enabled: !!handlers['reps-up'],
  })
  useHotkey('ArrowLeft', (e) => { e.preventDefault(); handlers['reps-down']?.() }, {
    enabled: !!handlers['reps-down'],
  })
  useHotkey('R', handlers['rest'] ?? noop, { enabled: !!handlers['rest'] })
  useHotkey('S', handlers['skip'] ?? noop, { enabled: !!handlers['skip'] })
  useHotkey('[', handlers['prev-exercise'] ?? noop, { enabled: !!handlers['prev-exercise'] })
  useHotkey(']', handlers['next-exercise'] ?? noop, { enabled: !!handlers['next-exercise'] })

  // Global vim-style sequences.
  useHotkeySequence(['G', 'G'], handlers['nav-dashboard'] ?? noop, {
    enabled: !!handlers['nav-dashboard'],
  })
  useHotkeySequence(['G', 'H'], handlers['nav-history'] ?? noop, {
    enabled: !!handlers['nav-history'],
  })
  useHotkeySequence(['G', 'S'], handlers['nav-session'] ?? noop, {
    enabled: !!handlers['nav-session'],
  })

  // ? overlay — Shift combinations with punctuation aren't first-class hotkey strings
  // (layout dependent), so use the structured form.
  useHotkey({ key: '/', shift: true }, handlers['toggle-overlay'] ?? noop, {
    enabled: !!handlers['toggle-overlay'],
  })
}
