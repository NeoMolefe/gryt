import { useEffect, useRef } from 'react'

interface TimerRingProps {
  remainingSeconds: number
  totalSeconds: number
  label: string
  color: string
  children?: React.ReactNode
}

const SIZE = 240
const STROKE = 14
const RADIUS = (SIZE - STROKE) / 2

export function TimerRing({ remainingSeconds, totalSeconds, label, color, children }: TimerRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, SIZE, SIZE)

    const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds)) : 1

    ctx.lineWidth = STROKE
    ctx.lineCap = 'round'

    ctx.beginPath()
    ctx.arc(SIZE / 2, SIZE / 2, RADIUS, 0, Math.PI * 2)
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim() || '#2A2A2A'
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(SIZE / 2, SIZE / 2, RADIUS, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
    ctx.strokeStyle = color
    ctx.stroke()
  }, [remainingSeconds, totalSeconds, color])

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <canvas ref={canvasRef} style={{ width: SIZE, height: SIZE }} />
      <div className="absolute flex flex-col items-center">
        {children ?? (
          <>
            <span className="text-4xl font-bold text-text-primary">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
            <span className="mt-1 text-sm font-semibold uppercase tracking-wide text-text-secondary">{label}</span>
          </>
        )}
      </div>
    </div>
  )
}
