import type { DrumPadState } from '../types/music'
import { getTotalSteps } from '../utils/grid'

interface Props {
  pads: DrumPadState[]
  bars: number
  resolution: '1/4' | '1/8' | '1/16' | '1/32'
  playheadStep: number
  onToggleStep: (padId: string, step: number) => void
}

export function DrumGrid({ pads, bars, resolution, playheadStep, onToggleStep }: Props) {
  const totalSteps = getTotalSteps(bars, resolution)
  return (
    <div className="rounded border border-slate-700 bg-slate-900 p-2 overflow-auto">
      <div style={{ width: totalSteps * 24 + 120 }}>
        {pads.map((pad) => (
          <div key={pad.id} className="mb-1 flex items-center gap-1">
            <div className="w-24 text-xs text-slate-300">{pad.name}</div>
            {Array.from({ length: totalSteps }).map((_, step) => (
              <button key={step} className={`h-6 w-6 rounded-sm border ${step === playheadStep ? 'border-red-400' : 'border-slate-700'} ${pad.steps[step]?.active ? 'bg-orange-500' : 'bg-slate-800'}`} onClick={() => onToggleStep(pad.id, step)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
