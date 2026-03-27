import { createDefaultPattern } from "../sequencer/patternState.js";

export function buildStarterPattern() {
  const pattern = createDefaultPattern();
  pattern.meta.name = "Starter Groove";

  [0, 3, 7, 10, 12, 15].forEach((i) => {
    pattern.bass[i].on = true;
    pattern.bass[i].note = ["C2", "C2", "G2", "A2", "G2", "E2"][Math.floor(i / 3)] || "C2";
    pattern.bass[i].accent = i % 4 === 0;
  });

  [4, 12].forEach((i) => {
    pattern.lead[i].on = true;
    pattern.lead[i].note = i === 4 ? "E4" : "D4";
    pattern.lead[i].gate = 0.9;
  });

  [0, 4, 8, 12].forEach((i) => {
    pattern.keys[i].on = true;
    pattern.keys[i].note = ["C4", "A3", "F3", "G3"][i / 4];
    pattern.keys[i].gate = 0.95;
  });

  pattern.drums.forEach((s, i) => {
    s.hits.kick = i % 4 === 0;
    s.hits.snare = i % 8 === 4;
    s.hits.clap = i % 8 === 4;
    s.hits.ch = i % 2 === 0;
    s.hits.oh = i % 8 === 7;
    s.hits.rim = i % 8 === 2;
  });

  return pattern;
}
