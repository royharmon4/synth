import { randomNote } from "./noteUtils.js";

const DRUM_VOICES = ["kick", "snare", "clap", "ch", "oh", "tom", "rim"];

function emptyMelodicStep() {
  return { on: false, note: "C3", velocity: 0.85, gate: 0.8, accent: false };
}

function emptyDrumStep() {
  return {
    accent: false,
    hits: Object.fromEntries(DRUM_VOICES.map((v) => [v, false])),
  };
}

function buildTrack(length, factory) {
  return Array.from({ length: 32 }, (_, i) => {
    const step = factory();
    step.on = i < length ? step.on : false;
    return step;
  });
}

export function createDefaultPattern() {
  const length = 16;
  return {
    meta: { name: "Pattern 1", length, tempo: 112, swing: 0 },
    bass: buildTrack(length, emptyMelodicStep),
    lead: buildTrack(length, emptyMelodicStep),
    keys: buildTrack(length, emptyMelodicStep),
    drums: buildTrack(length, emptyDrumStep),
  };
}

export function clearPattern(pattern) {
  ["bass", "lead", "keys"].forEach((track) => {
    pattern[track].forEach((step) => Object.assign(step, emptyMelodicStep()));
  });
  pattern.drums.forEach((step) => Object.assign(step, emptyDrumStep()));
}

export function randomizePattern(pattern) {
  ["bass", "lead", "keys"].forEach((track, idx) => {
    pattern[track].forEach((step, i) => {
      const on = Math.random() < (track === "bass" ? 0.45 : 0.22);
      step.on = on;
      step.note = on ? randomNote() : step.note;
      step.velocity = on ? 0.65 + Math.random() * 0.35 : step.velocity;
      step.accent = on && (i + idx) % 4 === 0;
      step.gate = 0.45 + Math.random() * 0.5;
    });
  });

  pattern.drums.forEach((step, i) => {
    step.hits.kick = i % 4 === 0 || Math.random() < 0.12;
    step.hits.snare = i % 8 === 4 || Math.random() < 0.1;
    step.hits.clap = i % 8 === 4 && Math.random() < 0.6;
    step.hits.ch = Math.random() < 0.48;
    step.hits.oh = i % 8 === 7 && Math.random() < 0.7;
    step.hits.tom = Math.random() < 0.08;
    step.hits.rim = i % 4 === 2 && Math.random() < 0.5;
    step.accent = i % 8 === 0;
  });
}

export function serializePattern(pattern) {
  return JSON.stringify(pattern, null, 2);
}

export function deserializePattern(json) {
  const parsed = JSON.parse(json);
  return parsed;
}

export { DRUM_VOICES };
