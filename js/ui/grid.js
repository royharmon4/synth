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
      btn.textContent = step.on ? step.note.replace(/\d/, "") : "·";
    }

    if (playheadStep === i) btn.classList.add("playhead");

    btn.addEventListener("click", () => onToggleStep(i));
    btn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      onSelectStep(i);
    });
    btn.addEventListener("touchstart", () => onSelectStep(i), { passive: true });
    grid.appendChild(btn);
  }

  container.appendChild(grid);
}
