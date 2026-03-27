export const PRESETS = {
  bass: {
    "New Wave Bass": {
      waveform: "sawtooth",
      cutoff: 320,
      resonance: 0.8,
      envAmount: 0.5,
      decay: 0.16,
      accent: 0.2,
      glide: 0.03,
    },
  },
  lead: {
    "City Nights Lead": {
      waveformBlend: 0.65,
      cutoff: 1600,
      resonance: 0.7,
      attack: 0.02,
      decay: 0.2,
      sustain: 0.6,
      release: 0.25,
      glide: 0.04,
      vibratoDepth: 9,
      vibratoRate: 5.5,
    },
  },
  keys: {
    "Digital Dream Keys": {
      brightness: 0.75,
      tone: 0.55,
      chorusAmount: 0.5,
      release: 0.8,
      velocitySensitivity: 0.7,
    },
  },
  drums: {
    "Retro Beat Kit": {
      accent: 0.2,
      volumes: {
        kick: 0.9,
        snare: 0.7,
        clap: 0.55,
        ch: 0.45,
        oh: 0.5,
        tom: 0.5,
        rim: 0.45,
      },
      decays: {
        kick: 0.42,
        snare: 0.2,
        clap: 0.18,
        ch: 0.06,
        oh: 0.18,
        tom: 0.28,
        rim: 0.08,
      },
    },
  },
};
