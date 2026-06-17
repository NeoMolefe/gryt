import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
}

const COLORS = ['#FF5C1A', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#FFFFFF']

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 16 - 4,
      size: Math.random() * 6 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
    }))

    let frame: number
    let elapsed = 0

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      elapsed += 1

      for (const particle of particles) {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.4
        particle.rotation += particle.rotationSpeed

        ctx!.save()
        ctx!.translate(particle.x, particle.y)
        ctx!.rotate(particle.rotation)
        ctx!.fillStyle = particle.color
        ctx!.globalAlpha = Math.max(0, 1 - elapsed / 90)
        ctx!.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
        ctx!.restore()
      }

      if (elapsed < 90) {
        frame = requestAnimationFrame(draw)
      }
    }

    draw()

    return () => cancelAnimationFrame(frame)
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[60]" />
}
