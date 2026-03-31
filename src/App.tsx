import { useEffect, useMemo, useState } from 'react'
import { audioEngine } from './audio/AudioEngine'
import { DrumGrid } from './components/DrumGrid'
import { DrumPads } from './components/DrumPads'
import { PianoKeyboard } from './components/PianoKeyboard'
import { PianoRoll } from './components/PianoRoll'
import { SoundEditor } from './components/SoundEditor'
import { TrackList } from './components/TrackList'
import { TransportControls } from './components/TransportControls'
import { useProjectState } from './state/useProject'
import type { DrumPadState } from './types/music'

export default function App() {
  const state = useProjectState()
  const [heldChord, setHeldChord] = useState<number[]>([])

  useEffect(() => {
    audioEngine.applyState(state.project)
  }, [state.project])

  useEffect(() => {
    audioEngine.setTickHandler(state.setPlayheadStep)
  }, [state.setPlayheadStep])

  const selected = state.selectedTrack
  const isDrums = selected.id === 'drums'

  const onStartAudio = async () => {
    await audioEngine.startAudio()
    state.setAudioReady(true)
    audioEngine.applyState(state.project)
  }

  const onPlay = () => { audioEngine.play(); state.setPlaying(true) }
  const onPause = () => { audioEngine.pause(); state.setPlaying(false) }
  const onStop = () => { audioEngine.stop(); state.setPlaying(false) }

  const noteEditor = useMemo(() => {
    if (selected.id === 'drums') {
      return <DrumGrid pads={selected.patch.pads} bars={state.project.bars} resolution={state.project.resolution} playheadStep={state.playheadStep} onToggleStep={state.toggleDrumStep} />
    }
    return <PianoRoll notes={selected.notes} bars={state.project.bars} resolution={state.project.resolution} playheadStep={state.playheadStep} onUpsertNote={(n) => state.upsertNote(selected.id, n)} onDeleteNote={(id) => state.deleteNote(selected.id, id)} />
  }, [selected, state])

  const playable = isDrums ? (
    <DrumPads pads={state.project.drums.patch.pads} onTrigger={(pad: DrumPadState) => audioEngine.previewDrum(pad)} />
  ) : (
    <PianoKeyboard
      chordMode={selected.id === 'chords'}
      onNoteDown={(midi) => {
        if (selected.id === 'chords' && heldChord.length > 0) {
          audioEngine.previewChord([...heldChord, midi])
        } else {
          audioEngine.previewNote(selected.id, midi)
        }
      }}
    />
  )

  return (
    <div className="h-screen overflow-hidden bg-slate-950 p-3 text-slate-100">
      <div className="grid h-full grid-cols-[280px_1fr_320px] gap-3 grid-rows-[1fr_170px]">
        <aside className="row-span-2 space-y-3 overflow-auto">
          <TransportControls
            audioReady={state.project.audioReady}
            playing={state.project.playing}
            bpm={state.project.bpm}
            bars={state.project.bars}
            resolution={state.project.resolution}
            onStartAudio={onStartAudio}
            onPlay={onPlay}
            onPause={onPause}
            onStop={onStop}
            onBpmChange={state.setBpm}
            onBarsChange={state.setBars}
            onResolutionChange={state.setResolution}
          />
          <TrackList project={state.project} selectedTrackId={state.project.selectedTrackId} onSelect={state.setSelectedTrack} onMix={state.updateTrackMix} />
        </aside>

        <main className="rounded-lg border border-slate-700 bg-slate-950 p-2">
          <div className="mb-2 text-sm font-semibold text-cyan-300">Editing: {selected.name}</div>
          {noteEditor}
        </main>

        <aside className="rounded-lg border border-slate-700 bg-slate-900 p-3 overflow-auto">
          <SoundEditor
            track={selected}
            onSynthChange={state.updateSynthPatch}
            onDrumPadChange={(padId, key, value) => state.updateDrumPad(padId, key, value)}
          />
        </aside>

        <section className="col-start-2 col-end-4 rounded-lg border border-slate-700 bg-slate-900 p-3">
          <div className="mb-2 text-xs text-slate-300">Playable interface ({selected.name})</div>
          {playable}
        </section>
      </div>
    </div>
  )
}
