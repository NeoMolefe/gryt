import { PHASE_LABELS } from '@/lib/dashboard/phaseStyles'
import type { Phase } from '@/types/plan.types'

export interface ShareCardInput {
  firstName: string
  sessionName: string
  phase: Phase
  setsCompleted: number
  totalSets: number
  pbCount: number
  streak: number
}

const PHASE_COLORS: Record<Phase, string> = {
  foundation: '#3B82F6',
  build: '#F59E0B',
  peak: '#EF4444',
  deload: '#22C55E',
}

export function renderShareCard(input: ShareCardInput): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350

  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0A0A0A'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#FF5C1A'
  ctx.font = 'bold 64px sans-serif'
  ctx.fillText('GRYT', 60, 120)

  ctx.fillStyle = PHASE_COLORS[input.phase]
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText(PHASE_LABELS[input.phase].toUpperCase(), 60, 200)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 72px sans-serif'
  wrapText(ctx, input.sessionName, 60, 320, 960, 80)

  ctx.fillStyle = '#888888'
  ctx.font = '40px sans-serif'
  ctx.fillText(`${input.firstName}'s session`, 60, 420)

  const stats = [
    [`${input.setsCompleted}/${input.totalSets}`, 'Sets completed'],
    [`${input.pbCount}`, 'Personal bests'],
    [`${input.streak}`, 'Day streak'],
  ]

  let y = 580
  for (const [value, label] of stats) {
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 80px sans-serif'
    ctx.fillText(value!, 60, y)

    ctx.fillStyle = '#888888'
    ctx.font = '36px sans-serif'
    ctx.fillText(label!, 60, y + 50)

    y += 160
  }

  ctx.fillStyle = '#FF5C1A'
  ctx.font = 'bold 48px sans-serif'
  ctx.fillText('BREAK. BUILD. BECOME.', 60, canvas.height - 80)

  return canvas
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
  const words = text.split(' ')
  let line = ''
  let lineY = y

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, lineY)
      line = word
      lineY += lineHeight
    } else {
      line = testLine
    }
  }

  ctx.fillText(line, x, lineY)
}

export async function shareWorkoutCard(input: ShareCardInput): Promise<void> {
  const canvas = renderShareCard(input)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))

  if (blob && navigator.canShare?.({ files: [new File([blob], 'gryt-session.png', { type: 'image/png' })] })) {
    const file = new File([blob], 'gryt-session.png', { type: 'image/png' })
    await navigator.share({
      files: [file],
      title: 'GRYT',
      text: `${input.sessionName} — ${input.setsCompleted}/${input.totalSets} sets. BREAK. BUILD. BECOME.`,
    })
    return
  }

  const text = `GRYT — ${input.sessionName}\n${input.setsCompleted}/${input.totalSets} sets completed\n${input.pbCount} PBs · ${input.streak} day streak\nBREAK. BUILD. BECOME.`

  if (navigator.share) {
    await navigator.share({ title: 'GRYT', text })
    return
  }

  await navigator.clipboard.writeText(text)
}
