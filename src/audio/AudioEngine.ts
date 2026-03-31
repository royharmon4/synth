import * as Tone from 'tone'
import type { DrumPadState, MelodicTrack, ProjectState, TrackId } from '../types/music'
import { getTotalSteps, resolutionTo32nFactor } from '../utils/grid'

const drumFrequencies: Record<string, number> = {
  kick: 45,
  snare: 180,
  ch: 9000,
  oh: 6000,
  clap: 1200,
  perc: 400,
}

function midiToNote(midi: number): string {
  return Tone.Frequency(midi, 'midi').toNote()
}

export class AudioEngine {
  private monoSynths = new Map<TrackId, { synth: Tone.MonoSynth; filter: Tone.Filter; pan: Tone.Panner; volume: Tone.Volume }>()
  private polySynth: { synth: Tone.PolySynth; filter: Tone.Filter; pan: Tone.Panner; volume: Tone.Volume } | null = null
  private drums = new Map<string, { synth: Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth; pan: Tone.Panner; volume: Tone.Volume }>()
  private currentState: ProjectState | null = null
  private started = false
  private tickEventId: number | null = null
  private onTick: ((step: number) => void) | null = null

  async startAudio(): Promise<void> {
    if (this.started) return
    await Tone.start()
    this.setupInstruments()
    this.tickEventId = Tone.Transport.scheduleRepeat((time) => this.tick(time), '32n')
    this.started = true
  }

  setTickHandler(handler: (step: number) => void): void {
    this.onTick = handler
  }

  applyState(state: ProjectState): void {
    this.currentState = state
    Tone.Transport.bpm.value = state.bpm
    Tone.Transport.loop = true
    Tone.Transport.loopStart = 0
    Tone.Transport.loopEnd = `${state.bars}m`
    if (!this.started) return
    this.applyPatches(state)
    this.applyMix(state)
  }

  play(): void { Tone.Transport.start() }
  pause(): void { Tone.Transport.pause() }
  stop(): void { Tone.Transport.stop(); this.onTick?.(0) }

  previewNote(trackId: TrackId, midi: number, duration = '8n'): void {
    if (!this.started || !this.currentState) return
    const now = Tone.now()
    if (trackId === 'chords') {
      this.polySynth?.synth.triggerAttackRelease(midiToNote(midi), duration, now, 0.9)
      return
    }
    const entry = this.monoSynths.get(trackId)
    entry?.synth.triggerAttackRelease(midiToNote(midi), duration, now, 0.9)
  }

  previewChord(midis: number[]): void {
    if (!this.started) return
    this.polySynth?.synth.triggerAttackRelease(midis.map(midiToNote), '4n', Tone.now(), 0.9)
  }

  previewDrum(pad: DrumPadState): void {
    if (!this.started) return
    this.triggerDrum(pad, Tone.now(), 1)
  }

  private setupInstruments(): void {
    const createMono = () => {
      const synth = new Tone.MonoSynth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.2 } })
      const filter = new Tone.Filter(1200, 'lowpass')
      const pan = new Tone.Panner(0)
      const volume = new Tone.Volume(0)
      synth.chain(filter, volume, pan, Tone.Destination)
      return { synth, filter, pan, volume }
    }
    this.monoSynths.set('lead', createMono())
    this.monoSynths.set('bass', createMono())

    const poly = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.6 } })
    const filter = new Tone.Filter(1500, 'lowpass')
    const pan = new Tone.Panner(0)
    const volume = new Tone.Volume(0)
    poly.chain(filter, volume, pan, Tone.Destination)
    this.polySynth = { synth: poly, filter, pan, volume }

    const buildDrum = (id: string) => {
      let synth: Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth
      if (id === 'kick') synth = new Tone.MembraneSynth()
      else if (id === 'snare' || id === 'clap') synth = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } })
      else if (id === 'ch' || id === 'oh') synth = new Tone.MetalSynth({ frequency: 280, harmonicity: 5.1, modulationIndex: 32, resonance: 3000, octaves: 1.5, envelope: { attack: 0.001, decay: 0.12, release: 0.02 } })
      else synth = new Tone.MembraneSynth({ pitchDecay: 0.03, octaves: 2 })
      const pan = new Tone.Panner(0)
      const volume = new Tone.Volume(-6)
      synth.chain(volume, pan, Tone.Destination)
      this.drums.set(id, { synth, pan, volume })
    }
    ;['kick', 'snare', 'ch', 'oh', 'clap', 'perc'].forEach(buildDrum)
  }

  private applyPatches(state: ProjectState): void {
    for (const track of [state.lead, state.bass] satisfies MelodicTrack[]) {
      const node = this.monoSynths.get(track.id)
      if (!node) continue
      node.synth.set({ oscillator: { type: track.patch.waveform }, envelope: { attack: track.patch.attack, decay: track.patch.decay, sustain: track.patch.sustain, release: track.patch.release }, portamento: track.patch.glide })
      node.filter.frequency.value = track.patch.filterCutoff
      node.filter.Q.value = track.patch.resonance
      node.volume.volume.value = track.patch.volume
      node.pan.pan.value = track.patch.pan
    }
    if (this.polySynth) {
      const patch = state.chords.patch
      this.polySynth.synth.set({ oscillator: { type: patch.waveform }, envelope: { attack: patch.attack, decay: patch.decay, sustain: patch.sustain, release: patch.release } })
      this.polySynth.filter.frequency.value = patch.filterCutoff
      this.polySynth.filter.Q.value = patch.resonance
      this.polySynth.volume.volume.value = patch.volume
      this.polySynth.pan.pan.value = patch.pan
    }
    for (const pad of state.drums.patch.pads) {
      const voice = this.drums.get(pad.id)
      if (!voice) continue
      voice.volume.volume.value = pad.volume
      voice.pan.pan.value = pad.pan
    }
  }

  private applyMix(state: ProjectState): void {
    const tracks = [state.lead, state.bass, state.chords, state.drums]
    const soloed = tracks.filter((t) => t.mix.solo).map((t) => t.id)
    for (const track of tracks) {
      const mutedBySolo = soloed.length > 0 && !soloed.includes(track.id)
      const shouldMute = track.mix.mute || mutedBySolo
      if (track.id === 'chords') {
        if (this.polySynth) {
          this.polySynth.volume.mute = shouldMute
          this.polySynth.volume.volume.value = track.patch.volume + track.mix.volume
          this.polySynth.pan.pan.value = track.mix.pan
        }
      } else if (track.id === 'drums') {
        for (const pad of state.drums.patch.pads) {
          const voice = this.drums.get(pad.id)
          if (!voice) continue
          voice.volume.mute = shouldMute
        }
      } else {
        const node = this.monoSynths.get(track.id)
        if (!node) continue
        node.volume.mute = shouldMute
        node.volume.volume.value = track.patch.volume + track.mix.volume
        node.pan.pan.value = track.mix.pan
      }
    }
  }

  private tick(time: number): void {
    if (!this.currentState || !Tone.Transport.state.startsWith('started')) return
    const state = this.currentState
    const ticksPerGridStep = resolutionTo32nFactor(state.resolution)
    const totalSteps = getTotalSteps(state.bars, state.resolution)
    const raw32n = Math.floor(Tone.Transport.ticks / Tone.Ticks('32n').toTicks())
    const step = Math.floor(raw32n / ticksPerGridStep) % totalSteps
    this.onTick?.(step)

    this.playMelodicAtStep(state.lead, step, time)
    this.playMelodicAtStep(state.bass, step, time)
    this.playMelodicAtStep(state.chords, step, time)
    for (const pad of state.drums.patch.pads) {
      const cell = pad.steps[step]
      if (cell?.active) this.triggerDrum(pad, time, cell.velocity)
    }
  }

  private playMelodicAtStep(track: MelodicTrack, step: number, time: number): void {
    const notes = track.notes.filter((n) => n.startStep === step)
    if (!notes.length) return
    for (const note of notes) {
      const dur = `${Math.max(1, note.lengthSteps)} * ${this.currentState ? resolutionTo32nFactor(this.currentState.resolution) : 1} * 32n`
      const velocity = note.velocity
      if (track.id === 'chords') this.polySynth?.synth.triggerAttackRelease(midiToNote(note.pitch), Tone.Time(dur).toSeconds(), time, velocity)
      else this.monoSynths.get(track.id)?.synth.triggerAttackRelease(midiToNote(note.pitch), Tone.Time(dur).toSeconds(), time, velocity)
    }
  }

  private triggerDrum(pad: DrumPadState, time: number, velocity: number): void {
    const voice = this.drums.get(pad.id)
    if (!voice) return
    if (voice.synth instanceof Tone.MetalSynth) {
      voice.synth.frequency.value = drumFrequencies[pad.id] * Math.pow(2, pad.tune / 12)
      voice.synth.envelope.decay = pad.decay
      voice.synth.triggerAttackRelease('16n', time, velocity)
    } else if (voice.synth instanceof Tone.NoiseSynth) {
      voice.synth.envelope.decay = pad.decay
      voice.synth.triggerAttackRelease('16n', time, velocity)
    } else {
      voice.synth.pitchDecay = 0.03 + pad.decay * 0.3
      voice.synth.triggerAttackRelease(Tone.Frequency(drumFrequencies[pad.id] * Math.pow(2, pad.tune / 12), 'hz'), '16n', time, velocity)
    }
  }
}

export const audioEngine = new AudioEngine()
