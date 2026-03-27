import { DRUM_VOICES } from "../sequencer/patternState.js";

const WHITE_NOTES = ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4"];

export function renderKeyboard({ container, onNote, activeTrack }) {
  container.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "keyboard";

  WHITE_NOTES.forEach((note) => {
    const key = document.createElement("button");
    key.className = "key";
    key.textContent = note;
    key.addEventListener("touchstart", (e) => {
      e.preventDefault();
      onNote(note);
    }, { passive: false });
    key.addEventListener("click", () => onNote(note));
    wrap.appendChild(key);
  });

  container.appendChild(wrap);
  container.style.display = activeTrack === "drums" ? "none" : "block";
}

export function renderDrumPads({ container, onHit, activeTrack }) {
  container.innerHTML = "";
  DRUM_VOICES.forEach((voice) => {
    const pad = document.createElement("button");
    pad.className = "drum-pad";
    pad.textContent = voice.toUpperCase();
    pad.addEventListener("touchstart", (e) => {
      e.preventDefault();
      onHit(voice);
    }, { passive: false });
    pad.addEventListener("click", () => onHit(voice));
    container.appendChild(pad);
  });

  container.style.display = activeTrack === "drums" ? "grid" : "none";
}
