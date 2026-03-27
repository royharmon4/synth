export function createEffects() {
  const chorus = new Tone.Chorus({ frequency: 1.8, delayTime: 2.2, depth: 0.45, wet: 0.25 }).start();
  const delay = new Tone.PingPongDelay({ delayTime: "8n", feedback: 0.2, wet: 0.15 });
  const reverb = new Tone.Reverb({ decay: 1.8, wet: 0.2, preDelay: 0.01 });
  return { chorus, delay, reverb };
}
