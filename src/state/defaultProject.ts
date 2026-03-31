import type { DrumPadState, MelodicTrack, ProjectState, SynthPatch } from '../types/music'
import { getTotalSteps } from '../utils/grid'

const defaultPatch = (volume = -8): SynthPatch => ({
  waveform: 'sawtooth',
  attack: 0.01,
  decay: 0.2,
  sustain: 0.6,
  release: 0.3,
  filterCutoff: 1600,
  resonance: 0.8,
  glide: 0.02,
  volume,
  pan: 0,
})

const defaultMix = { mute: false, solo: false, volume: 0, pan: 0 }

const makeDrumPad = (id: string, name: string): DrumPadState => ({
  id,
  name,
  tune: 0,
  decay: 0.3,
  volume: -4,
  pan: 0,
  steps: Array.from({ length: 64 }, () => ({ active: false, velocity: 0.9 })),
})

export function createDefaultProject(): ProjectState {
  const lead: MelodicTrack = {
    id: 'lead',
    name: 'Lead',
    type: 'mono',
    patch: defaultPatch(-10),
    mix: { ...defaultMix },
    notes: [
      { id: 'l1', pitch: 72, startStep: 0, lengthSteps: 2, velocity: 0.9 },
      { id: 'l2', pitch: 74, startStep: 4, lengthSteps: 2, velocity: 0.9 },
      { id: 'l3', pitch: 76, startStep: 8, lengthSteps: 4, velocity: 0.95 },
    ],
  }

  const bass: MelodicTrack = {
    id: 'bass',
    name: 'Bass',
    type: 'mono',
    patch: { ...defaultPatch(-7), waveform: 'square', filterCutoff: 700 },
    mix: { ...defaultMix },
    notes: [
      { id: 'b1', pitch: 36, startStep: 0, lengthSteps: 4, velocity: 0.9 },
      { id: 'b2', pitch: 43, startStep: 8, lengthSteps: 4, velocity: 0.85 },
      { id: 'b3', pitch: 38, startStep: 16, lengthSteps: 4, velocity: 0.9 },
    ],
  }

  const chords: MelodicTrack = {
    id: 'chords',
    name: 'Chords',
    type: 'poly',
    patch: { ...defaultPatch(-14), waveform: 'triangle', release: 0.6 },
    mix: { ...defaultMix },
    notes: [
      { id: 'c1', pitch: 60, startStep: 0, lengthSteps: 8, velocity: 0.8 },
      { id: 'c2', pitch: 64, startStep: 0, lengthSteps: 8, velocity: 0.8 },
      { id: 'c3', pitch: 67, startStep: 0, lengthSteps: 8, velocity: 0.8 },
      { id: 'c4', pitch: 62, startStep: 8, lengthSteps: 8, velocity: 0.8 },
      { id: 'c5', pitch: 65, startStep: 8, lengthSteps: 8, velocity: 0.8 },
      { id: 'c6', pitch: 69, startStep: 8, lengthSteps: 8, velocity: 0.8 },
    ],
  }

  const pads = [
    makeDrumPad('kick', 'Kick'),
    makeDrumPad('snare', 'Snare'),
    makeDrumPad('ch', 'Closed Hat'),
    makeDrumPad('oh', 'Open Hat'),
    makeDrumPad('clap', 'Clap'),
    makeDrumPad('perc', 'Perc'),
  ]

  for (let i = 0; i < getTotalSteps(4, '1/16'); i += 4) pads[2].steps[i].active = true
  for (let i = 0; i < getTotalSteps(4, '1/16'); i += 8) pads[0].steps[i].active = true
  pads[1].steps[4].active = true
  pads[1].steps[12].active = true
  pads[4].steps[12].active = true
  pads[5].steps[10].active = true

  return {
    bpm: 120,
    bars: 4,
    resolution: '1/16',
    selectedTrackId: 'lead',
    playing: false,
    audioReady: false,
    lead,
    bass,
    chords,
    drums: { id: 'drums', name: 'Drums', type: 'drums', mix: { ...defaultMix }, patch: { pads } },
  }
}
