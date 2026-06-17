import { create } from 'zustand'

export type ThemeMode = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

interface ThemeState {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  setMode: (mode: ThemeMode) => void
  initialise: () => void
}

const STORAGE_KEY = 'gryt_theme_mode'

function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return getSystemPreference()
  return mode
}

function applyThemeToDocument(resolved: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', resolved)
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  resolvedTheme: 'dark',

  initialise: () => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? 'system'
    const resolved = resolveTheme(stored)
    applyThemeToDocument(resolved)
    set({ mode: stored, resolvedTheme: resolved })

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', () => {
      if (get().mode === 'system') {
        const newResolved = getSystemPreference()
        applyThemeToDocument(newResolved)
        set({ resolvedTheme: newResolved })
      }
    })
  },

  setMode: (mode) => {
    localStorage.setItem(STORAGE_KEY, mode)
    const resolved = resolveTheme(mode)
    applyThemeToDocument(resolved)
    set({ mode, resolvedTheme: resolved })
  },
}))
