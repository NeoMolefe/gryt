import type { HyroxSimulationStation, Phase } from '@/types/plan.types'

const STATIONS: { name: string; foundation: string; build: string; peak: string }[] = [
  { name: 'SkiErg', foundation: '500m', build: '750m', peak: '1000m' },
  { name: 'Sled Push', foundation: '15m', build: '25m', peak: '50m' },
  { name: 'Sled Pull', foundation: '15m', build: '25m', peak: '50m' },
  { name: 'Burpee Broad Jumps', foundation: '20m', build: '40m', peak: '80m' },
  { name: 'Row', foundation: '500m', build: '750m', peak: '1000m' },
  { name: 'Farmers Carry', foundation: '100m', build: '150m', peak: '200m' },
  { name: 'Sandbag Lunges', foundation: '50m', build: '75m', peak: '100m' },
  { name: 'Wall Balls', foundation: '25 reps', build: '50 reps', peak: '75 reps' },
]

export function buildHyroxSimulation(phase: Phase): HyroxSimulationStation[] {
  const includeCount = phase === 'deload' ? 4 : phase === 'foundation' ? 4 : phase === 'build' ? 6 : 8
  const runDistance = phase === 'foundation' || phase === 'deload' ? '300m' : phase === 'build' ? '500m' : '1000m'
  const distKey: 'foundation' | 'build' | 'peak' = phase === 'deload' ? 'foundation' : phase === 'peak' ? 'peak' : phase === 'build' ? 'build' : 'foundation'

  const selected = STATIONS.slice(0, includeCount)
  const result: HyroxSimulationStation[] = []
  let order = 1

  for (const station of selected) {
    result.push({ order: order++, type: 'run', name: 'Run', distance_or_reps: runDistance })
    result.push({ order: order++, type: 'station', name: station.name, distance_or_reps: station[distKey] })
  }

  return result
}
