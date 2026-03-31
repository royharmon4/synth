import type { ProjectState, TrackId } from '../types/music'

interface Props {
  project: ProjectState
  selectedTrackId: TrackId
  onSelect: (trackId: TrackId) => void
  onMix: (trackId: TrackId, key: 'mute' | 'solo' | 'volume' | 'pan', value: boolean | number) => void
}

const order: TrackId[] = ['lead', 'bass', 'chords', 'drums']

export function TrackList({ project, selectedTrackId, onSelect, onMix }: Props) {
  return (
    <div className="space-y-2">
      {order.map((id) => {
        const t = project[id]
        const selected = id === selectedTrackId
        return (
          <div key={id} className={`rounded border p-2 ${selected ? 'border-cyan-400 bg-slate-800' : 'border-slate-700 bg-slate-900'}`}>
            <button className="w-full text-left text-sm font-medium" onClick={() => onSelect(id)}>{t.name}</button>
            <div className="mt-2 flex gap-1 text-xs">
              <button className={`rounded px-2 ${t.mix.mute ? 'bg-red-600' : 'bg-slate-700'}`} onClick={() => onMix(id, 'mute', !t.mix.mute)}>M</button>
              <button className={`rounded px-2 ${t.mix.solo ? 'bg-amber-600' : 'bg-slate-700'}`} onClick={() => onMix(id, 'solo', !t.mix.solo)}>S</button>
            </div>
            <label className="mt-1 block text-[10px]">Vol
              <input className="w-full" type="range" min={-24} max={12} step={1} value={t.mix.volume} onChange={(e) => onMix(id, 'volume', Number(e.target.value))} />
            </label>
            <label className="mt-1 block text-[10px]">Pan
              <input className="w-full" type="range" min={-1} max={1} step={0.01} value={t.mix.pan} onChange={(e) => onMix(id, 'pan', Number(e.target.value))} />
            </label>
          </div>
        )
      })}
    </div>
  )
}
