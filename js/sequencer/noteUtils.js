export const NOTE_POOL = ["C2", "D2", "E2", "G2", "A2", "C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4"];

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function randomNote() {
  return NOTE_POOL[Math.floor(Math.random() * NOTE_POOL.length)];
}

export function midiToNoteName(midi) {
  return Tone.Frequency(midi, "midi").toNote();
}
