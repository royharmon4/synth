import type { DrumPadState } from '../types/music'

interface Props {
  pads: DrumPadState[]
  onTrigger: (pad: DrumPadState) => void
}

export function DrumPads({ pads, onTrigger }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {pads.map((pad) => (
        <button key={pad.id} className="rounded border border-slate-700 bg-slate-800 p-3 text-sm" onMouseDown={() => onTrigger(pad)}>
          {pad.name}
        </button>
      ))}
    </div>
  )
}
