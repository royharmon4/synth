import type { DrumTrack, MelodicTrack, TrackId, Waveform } from '../types/music'

interface Props {
  track: MelodicTrack | DrumTrack
  onSynthChange: (trackId: 'lead' | 'bass' | 'chords', key: string, value: number | string) => void
  onDrumPadChange: (padId: string, key: 'volume' | 'pan' | 'tune' | 'decay', value: number) => void
}

export function SoundEditor({ track, onSynthChange, onDrumPadChange }: Props) {
  if (track.id === 'drums') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Drum Sound</h3>
        {track.patch.pads.map((pad) => (
          <div key={pad.id} className="rounded border border-slate-700 p-2">
            <div className="text-xs font-medium">{pad.name}</div>
            {(['volume', 'pan', 'tune', 'decay'] as const).map((k) => (
              <label key={k} className="mt-1 block text-[11px]">{k}
                <input
                  className="w-full"
                  type="range"
                  min={k === 'pan' ? -1 : k === 'tune' ? -12 : k === 'decay' ? 0.05 : -24}
                  max={k === 'pan' ? 1 : k === 'tune' ? 12 : k === 'decay' ? 1.2 : 6}
                  step={k === 'pan' ? 0.01 : 0.01}
                  value={pad[k]}
                  onChange={(e) => onDrumPadChange(pad.id, k, Number(e.target.value))}
                />
              </label>
            ))}
          </div>
        ))}
      </div>
    )
  }

  const t = track as MelodicTrack
  const w: Waveform[] = ['sine', 'triangle', 'square', 'sawtooth']
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{track.name} Patch</h3>
      <label className="block text-xs">Waveform
        <select className="mt-1 w-full rounded bg-slate-800 p-1" value={t.patch.waveform} onChange={(e) => onSynthChange(t.id, 'waveform', e.target.value)}>
          {w.map((wave) => <option key={wave}>{wave}</option>)}
        </select>
      </label>
      {['attack', 'decay', 'sustain', 'release', 'filterCutoff', 'resonance', 'glide', 'volume', 'pan'].map((k) => (
        <label key={k} className="block text-xs">{k}
          <input
            className="w-full"
            type="range"
            min={k === 'pan' ? -1 : k === 'volume' ? -24 : 0}
            max={k === 'filterCutoff' ? 8000 : k === 'resonance' ? 15 : k === 'sustain' ? 1 : k === 'pan' ? 1 : 2}
            step={k === 'filterCutoff' ? 1 : 0.01}
            value={t.patch[k as keyof typeof t.patch] as number}
            onChange={(e) => onSynthChange(t.id, k, Number(e.target.value))}
          />
        </label>
      ))}
    </div>
  )
}

export function trackTitle(trackId: TrackId): string {
  return trackId.charAt(0).toUpperCase() + trackId.slice(1)
}
