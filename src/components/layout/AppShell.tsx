import type { ReactNode } from 'react'
import { InstallPromptSheet } from '@/components/pwa/InstallPromptSheet'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh">
      {children}
      <BottomNav />
      <InstallPromptSheet />
    </div>
  )
}
