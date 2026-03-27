export function createKeysSynth(output) {
  const chorus = new Tone.Chorus({ frequency: 0.8, delayTime: 2.6, depth: 0.4, wet: 0.4 }).start();
  const synth = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 2.2,
    modulationIndex: 8,
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 0.8 },
    modulation: { type: "triangle" },
    modulationEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.6 },
    volume: -6,
  });

  synth.disconnect();
  synth.chain(chorus, output);

  const state = {
    brightness: 0.75,
    tone: 0.55,
    chorusAmount: 0.5,
    release: 0.8,
    velocitySensitivity: 0.7,
  };

  return {
    noteOn(note, time, velocity = 0.8) {
      const scaled = velocity * (0.35 + state.velocitySensitivity);
      synth.triggerAttackRelease(note, "8n", time, Math.min(1, scaled));
    },
    noteOff(note, time) {
      synth.triggerRelease(note, time);
    },
    triggerStep(step, time) {
      if (!step.on) return;
      this.noteOn(step.note, time, step.accent ? 1 : step.velocity);
    },
    setParam(name, value) {
      state[name] = value;
      if (name === "brightness") synth.modulationIndex.value = 2 + value * 14;
      if (name === "tone") synth.harmonicity.value = 1 + value * 3;
      if (name === "chorusAmount") chorus.wet.value = value;
      if (name === "release") synth.set({ envelope: { release: value } });
      if (name === "velocitySensitivity") state.velocitySensitivity = value;
    },
    getState: () => ({ ...state }),
  };
}
