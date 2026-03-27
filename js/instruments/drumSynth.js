import { DRUM_VOICES } from "../sequencer/patternState.js";

export function createDrumSynth(output) {
  const volumes = { kick: 0.9, snare: 0.7, clap: 0.55, ch: 0.45, oh: 0.5, tom: 0.5, rim: 0.45 };
  const decays = { kick: 0.42, snare: 0.2, clap: 0.18, ch: 0.06, oh: 0.18, tom: 0.28, rim: 0.08 };
  const state = { accent: 0.2, volumes, decays, mute: {}, solo: {} };

  const noise = new Tone.Noise("white").start();

  function hitKick(time, velocity) {
    const osc = new Tone.Oscillator({ type: "sine", frequency: 130 }).start(time);
    const amp = new Tone.Gain(0).connect(output);
    osc.connect(amp);
    osc.frequency.exponentialRampToValueAtTime(42, time + decays.kick);
    amp.gain.setValueAtTime(volumes.kick * velocity, time);
    amp.gain.exponentialRampToValueAtTime(0.001, time + decays.kick);
    osc.stop(time + decays.kick + 0.02);
  }

  function hitNoise(time, voice, hp = 1400, lp = 9000) {
    const hpFilter = new Tone.Filter({ type: "highpass", frequency: hp });
    const lpFilter = new Tone.Filter({ type: "lowpass", frequency: lp });
    const gain = new Tone.Gain(0).connect(output);
    noise.connect(hpFilter);
    hpFilter.connect(lpFilter);
    lpFilter.connect(gain);
    gain.gain.setValueAtTime(volumes[voice], time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decays[voice]);
    setTimeout(() => {
      noise.disconnect(hpFilter);
      hpFilter.dispose();
      lpFilter.dispose();
      gain.dispose();
    }, 400);
  }

  function hitTom(time, velocity) {
    const osc = new Tone.Oscillator({ type: "triangle", frequency: 190 }).start(time);
    const gain = new Tone.Gain(0).connect(output);
    osc.connect(gain);
    osc.frequency.exponentialRampToValueAtTime(95, time + decays.tom);
    gain.gain.setValueAtTime(volumes.tom * velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decays.tom);
    osc.stop(time + decays.tom + 0.04);
  }

  function hitRim(time) {
    const osc = new Tone.Oscillator({ type: "square", frequency: 880 }).start(time);
    const gain = new Tone.Gain(0).connect(output);
    osc.connect(gain);
    gain.gain.setValueAtTime(volumes.rim, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decays.rim);
    osc.stop(time + decays.rim + 0.02);
  }

  const voiceFn = {
    kick: (t, v) => hitKick(t, v),
    snare: (t) => hitNoise(t, "snare", 1300, 6500),
    clap: (t) => hitNoise(t, "clap", 1600, 9500),
    ch: (t) => hitNoise(t, "ch", 4500, 12000),
    oh: (t) => hitNoise(t, "oh", 4500, 14000),
    tom: (t, v) => hitTom(t, v),
    rim: (t) => hitRim(t),
  };

  function triggerVoice(voice, time, velocity = 0.8) {
    const anySolo = DRUM_VOICES.some((v) => state.solo[v]);
    if (state.mute[voice]) return;
    if (anySolo && !state.solo[voice]) return;
    const accentBoost = velocity + state.accent * velocity;
    voiceFn[voice]?.(time, Math.min(1, accentBoost));
  }

  return {
    noteOn(voice, time, velocity) { triggerVoice(voice, time, velocity); },
    noteOff() {},
    triggerStep(step, time) {
      DRUM_VOICES.forEach((voice) => {
        if (step.hits[voice]) triggerVoice(voice, time, step.accent ? 1 : 0.8);
      });
    },
    setParam(name, value) {
      if (name === "accent") state.accent = value;
      if (name === "mute" && value && typeof value === "object") {
        state.mute = { ...value };
        return;
      }
      if (name === "solo" && value && typeof value === "object") {
        state.solo = { ...value };
        return;
      }
      const [group, voice] = name.split(".");
      if (group === "volume") volumes[voice] = value;
      if (group === "decay") decays[voice] = value;
      if (group === "mute") state.mute[voice] = value;
      if (group === "solo") state.solo[voice] = value;
    },
    getState: () => ({ ...state, volumes: { ...volumes }, decays: { ...decays } }),
  };
}
