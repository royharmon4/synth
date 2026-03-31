import type { GridResolution } from '../types/music'

interface Props {
  audioReady: boolean
  playing: boolean
  bpm: number
  bars: number
  resolution: GridResolution
  onStartAudio: () => void
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onBpmChange: (bpm: number) => void
  onBarsChange: (bars: number) => void
  onResolutionChange: (res: GridResolution) => void
}

export function TransportControls(props: Props) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-900 p-4">
      <h2 className="text-sm font-semibold text-slate-200">Transport</h2>
      <div className="flex flex-wrap gap-2">
        <button className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold" onClick={props.onStartAudio}>
          {props.audioReady ? 'Audio Ready' : 'Start Audio'}
        </button>
        <button className="rounded bg-slate-700 px-3 py-1 text-xs" onClick={props.onPlay}>Play</button>
        <button className="rounded bg-slate-700 px-3 py-1 text-xs" onClick={props.onPause}>Pause</button>
        <button className="rounded bg-slate-700 px-3 py-1 text-xs" onClick={props.onStop}>Stop</button>
      </div>
      <label className="block text-xs text-slate-300">BPM: {props.bpm}
        <input className="mt-1 w-full" type="range" min={60} max={200} value={props.bpm} onChange={(e) => props.onBpmChange(Number(e.target.value))} />
      </label>
      <label className="block text-xs text-slate-300">Loop Bars: {props.bars}
        <input className="mt-1 w-full" type="range" min={1} max={8} value={props.bars} onChange={(e) => props.onBarsChange(Number(e.target.value))} />
      </label>
      <label className="block text-xs text-slate-300">Grid
        <select className="mt-1 w-full rounded bg-slate-800 p-1" value={props.resolution} onChange={(e) => props.onResolutionChange(e.target.value as GridResolution)}>
          {(['1/4', '1/8', '1/16', '1/32'] as GridResolution[]).map((r) => <option key={r}>{r}</option>)}
        </select>
      </label>
      <div className="text-xs text-slate-400">State: {props.playing ? 'Playing' : 'Stopped'}</div>
    </div>
  )
}
