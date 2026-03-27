import { createEffects } from "./effects.js";

export function createMasterBus() {
  const limiter = new Tone.Limiter(-2);
  const compressor = new Tone.Compressor({ threshold: -14, ratio: 2.2, attack: 0.01, release: 0.18 });
  const drive = new Tone.Distortion({ distortion: 0.08, wet: 0.2 });
  const effects = createEffects();

  const input = new Tone.Gain(0.9);
  input.chain(effects.chorus, effects.delay, effects.reverb, drive, compressor, limiter, Tone.Destination);

  return { input, effects, compressor, drive };
}
