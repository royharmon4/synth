import type { GridResolution } from '../types/music'

export const STEPS_PER_BEAT_BY_RESOLUTION: Record<GridResolution, number> = {
  '1/4': 1,
  '1/8': 2,
  '1/16': 4,
  '1/32': 8,
}

export const TOTAL_32N_PER_BAR = 32

export function getTotalSteps(bars: number, resolution: GridResolution): number {
  const stepsPerBeat = STEPS_PER_BEAT_BY_RESOLUTION[resolution]
  return bars * 4 * stepsPerBeat
}

export function resolutionTo32nFactor(resolution: GridResolution): number {
  return TOTAL_32N_PER_BAR / (4 * STEPS_PER_BEAT_BY_RESOLUTION[resolution])
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
