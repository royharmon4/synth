import { DRUM_VOICES } from "../sequencer/patternState.js";

export function renderGrid({ container, pattern, activeTrack, onToggleStep, onSelectStep, playheadStep }) {
  container.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "grid";

  for (let i = 0; i < pattern.meta.length; i += 1) {
    const btn = document.createElement("button");
    btn.className = "step";

    if (activeTrack === "drums") {
      const step = pattern.drums[i];
      const hitCount = DRUM_VOICES.filter((v) => step.hits[v]).length;
      if (hitCount > 0) btn.classList.add("on");
      btn.textContent = hitCount ? String(hitCount) : "·";
      if (step.accent) btn.classList.add("accent");
    } else {
      const step = pattern[activeTrack][i];
      if (step.on) btn.classList.add("on");
      if (step.accent) btn.classList.add("accent");

      if (step.on) {
        const octaveMatch = step.note.match(/(-?\d+)$/);
        const octave = octaveMatch ? octaveMatch[1] : "";
        const noteName = step.note.replace(/-?\d+$/, "");

        btn.classList.add("step-note");

        const noteEl = document.createElement("span");
        noteEl.className = "step-note-name";
        noteEl.textContent = noteName;

        const octaveEl = document.createElement("span");
        octaveEl.className = "step-note-octave";
        octaveEl.textContent = octave;

        btn.append(noteEl, octaveEl);
      } else {
        btn.textContent = "·";
      }
    }

    if (playheadStep === i) btn.classList.add("playhead");

    btn.addEventListener("click", () => onSelectStep(i));
    btn.addEventListener("dblclick", () => onToggleStep(i));
    btn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      onSelectStep(i);
    });
    btn.addEventListener("touchstart", () => onSelectStep(i), { passive: true });
    grid.appendChild(btn);
  }

  container.appendChild(grid);
  const instructions = document.createElement("div");
  instructions.className = "grid-instructions small-note";
  instructions.textContent = "Click to select • Double-click to toggle on/off • Edit note in step editor below.";
  container.appendChild(instructions);
}
