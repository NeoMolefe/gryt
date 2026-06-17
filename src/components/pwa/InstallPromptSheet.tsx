import { Share, SquarePlus } from 'lucide-react'
import { BottomSheet } from '@/components/dashboard/BottomSheet'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

export function InstallPromptSheet() {
  const { platform, isVisible, dismissIos, dismissAndroid, triggerAndroidInstall } = useInstallPrompt()

  if (!platform) return null

  if (platform === 'ios') {
    return (
      <BottomSheet isOpen={isVisible} onClose={() => dismissIos(false)} title="Add GRYT to your Home Screen">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Install GRYT for quick access and a full-screen experience. Tap{' '}
            <Share size={16} className="inline-block align-text-bottom text-text-primary" /> in the Safari toolbar, then select{' '}
            <SquarePlus size={16} className="inline-block align-text-bottom text-text-primary" /> "Add to Home Screen".
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => dismissIos(false)}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-text-secondary"
            >
              Maybe later
            </button>
            <button
              type="button"
              onClick={() => dismissIos(true)}
              className="flex-1 rounded-xl bg-brand-orange py-3 text-sm font-semibold text-background"
            >
              Got it
            </button>
          </div>
        </div>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet isOpen={isVisible} onClose={dismissAndroid} title="Install GRYT">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Install GRYT on your device for quick access and a full-screen experience.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={dismissAndroid}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-text-secondary"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => void triggerAndroidInstall()}
            className="flex-1 rounded-xl bg-brand-orange py-3 text-sm font-semibold text-background"
          >
            Install
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
