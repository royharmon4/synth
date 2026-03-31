export type TrackId = 'lead' | 'bass' | 'chords' | 'drums'
export type GridResolution = '1/4' | '1/8' | '1/16' | '1/32'
export type Waveform = 'sine' | 'triangle' | 'square' | 'sawtooth'

export interface NoteEvent {
  id: string
  pitch: number
  startStep: number
  lengthSteps: number
  velocity: number
}

export interface DrumStep {
  active: boolean
  velocity: number
}

export interface DrumPadState {
  id: string
  name: string
  tune: number
  decay: number
  volume: number
  pan: number
  steps: DrumStep[]
}

export interface SynthPatch {
  waveform: Waveform
  attack: number
  decay: number
  sustain: number
  release: number
  filterCutoff: number
  resonance: number
  glide: number
  volume: number
  pan: number
}

export interface DrumRackPatch {
  pads: DrumPadState[]
}

export interface TrackMix {
  mute: boolean
  solo: boolean
  volume: number
  pan: number
}

export interface MelodicTrack {
  id: Extract<TrackId, 'lead' | 'bass' | 'chords'>
  name: string
  type: 'mono' | 'poly'
  notes: NoteEvent[]
  patch: SynthPatch
  mix: TrackMix
}

export interface DrumTrack {
  id: 'drums'
  name: string
  type: 'drums'
  patch: DrumRackPatch
  mix: TrackMix
}

export interface ProjectState {
  bpm: number
  bars: number
  resolution: GridResolution
  selectedTrackId: TrackId
  playing: boolean
  audioReady: boolean
  lead: MelodicTrack
  bass: MelodicTrack
  chords: MelodicTrack
  drums: DrumTrack
}
