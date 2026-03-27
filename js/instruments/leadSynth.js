export function createLeadSynth(output) {
  const vibrato = new Tone.LFO({ frequency: 5.5, min: -9, max: 9 }).start();
  const filter = new Tone.Filter({ type: "lowpass", frequency: 1600, Q: 0.7 });
  const synth = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.6, release: 0.25 },
    filterEnvelope: { attack: 0.01, decay: 0.25, sustain: 0.3, release: 0.3, baseFrequency: 280, octaves: 3 },
    portamento: 0.04,
  });

  synth.disconnect();
  synth.chain(filter, output);
  vibrato.connect(synth.oscillator.detune);

  const state = {
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
  };

  function updateWaveform() {
    synth.oscillator.type = state.waveformBlend > 0.5 ? "sawtooth" : "square";
  }

  return {
    noteOn(note, time, velocity = 0.8) {
      synth.triggerAttackRelease(note, "16n", time, velocity);
    },
    noteOff(note, time) {
      synth.triggerRelease(time);
    },
    triggerStep(step, time) {
      if (!step.on) return;
      this.noteOn(step.note, time, step.accent ? 1 : step.velocity);
    },
    setParam(name, value) {
      state[name] = value;
      if (name === "waveformBlend") updateWaveform();
      if (name === "cutoff") filter.frequency.value = value;
      if (name === "resonance") filter.Q.value = value;
      if (["attack", "decay", "sustain", "release"].includes(name)) {
        synth.envelope[name] = value;
      }
      if (name === "glide") synth.portamento = value;
      if (name === "vibratoDepth") {
        vibrato.min = -value;
        vibrato.max = value;
      }
      if (name === "vibratoRate") vibrato.frequency.value = value;
    },
    getState: () => ({ ...state }),
  };
}
