export function createBassSynth(output) {
  const filter = new Tone.Filter({ type: "lowpass", frequency: 320, Q: 0.8 });
  const amp = new Tone.AmplitudeEnvelope({ attack: 0.005, decay: 0.16, sustain: 0.0, release: 0.08 });
  const osc = new Tone.Oscillator({ type: "sawtooth" }).start();
  osc.chain(filter, amp, output);

  const state = { waveform: "sawtooth", cutoff: 320, resonance: 0.8, envAmount: 0.5, decay: 0.16, accent: 0.2, glide: 0.03 };
  let lastFreq = null;

  function noteOn(note, time, velocity = 0.8) {
    const freq = Tone.Frequency(note).toFrequency();
    osc.frequency.cancelAndHoldAtTime(time);
    if (lastFreq && state.glide > 0) {
      osc.frequency.setValueAtTime(lastFreq, time);
      osc.frequency.linearRampTo(freq, state.glide, time);
    } else {
      osc.frequency.setValueAtTime(freq, time);
    }
    const velocityAccent = velocity + (state.accent * velocity);
    amp.triggerAttackRelease(state.decay, time, Math.min(1, velocityAccent));
    filter.frequency.setValueAtTime(state.cutoff, time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(80, state.cutoff * (1 + state.envAmount * 2.5)), time + 0.02);
    filter.frequency.linearRampToValueAtTime(Math.max(80, state.cutoff), time + state.decay);
    lastFreq = freq;
  }

  return {
    noteOn,
    noteOff() {},
    triggerStep(step, time) {
      if (!step.on) return;
      noteOn(step.note, time, step.accent ? 1 : step.velocity);
    },
    setParam(name, value) {
      state[name] = value;
      if (name === "waveform") osc.type = value;
      if (name === "cutoff") filter.frequency.value = value;
      if (name === "resonance") filter.Q.value = value;
      if (name === "decay") amp.decay = value;
    },
    getState: () => ({ ...state }),
  };
}
