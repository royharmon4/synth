import { initAudioOnce } from "./audio/audioInit.js";
import { createMasterBus } from "./audio/masterBus.js";
import { createTransport } from "./audio/transport.js";
import { createBassSynth } from "./instruments/bassSynth.js";
import { createLeadSynth } from "./instruments/leadSynth.js";
import { createKeysSynth } from "./instruments/keysSynth.js";
import { createDrumSynth } from "./instruments/drumSynth.js";
import { createSequencerEngine } from "./sequencer/sequencerEngine.js";
import { clearPattern, createDefaultPattern, deserializePattern, randomizePattern, serializePattern } from "./sequencer/patternState.js";
import { renderGrid } from "./ui/grid.js";
import { renderInstrumentControls, renderStepEditor } from "./ui/controls.js";
import { renderDrumPads, renderKeyboard } from "./ui/keyboard.js";
import { applyPresetToInstrument } from "./ui/presetsUI.js";
import { keepTransportVisible, lockTouchZoom } from "./ui/mobileLayout.js";
import { PRESETS } from "./data/presets.js";
import { buildStarterPattern } from "./data/defaultPatterns.js";
import { listSavedPatterns, loadPatternByName, savePattern } from "./storage/localStorage.js";

const ui = {
  startAudioBtn: document.getElementById("startAudioBtn"),
  playBtn: document.getElementById("playBtn"),
  stopBtn: document.getElementById("stopBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  tempo: document.getElementById("tempo"),
  tempoValue: document.getElementById("tempoValue"),
  swing: document.getElementById("swing"),
  swingValue: document.getElementById("swingValue"),
  clearPatternBtn: document.getElementById("clearPatternBtn"),
  randomizeBtn: document.getElementById("randomizeBtn"),
  savePatternBtn: document.getElementById("savePatternBtn"),
  loadPatternBtn: document.getElementById("loadPatternBtn"),
  exportPatternBtn: document.getElementById("exportPatternBtn"),
  importPatternInput: document.getElementById("importPatternInput"),
  patternSelect: document.getElementById("patternSelect"),
  gridContainer: document.getElementById("gridContainer"),
  stepEditor: document.getElementById("stepEditor"),
  instrumentPanel: document.getElementById("instrumentPanel"),
  keyboardContainer: document.getElementById("keyboardContainer"),
  drumPadsContainer: document.getElementById("drumPadsContainer"),
  instrumentTabs: document.getElementById("instrumentTabs"),
  stepLengthGroup: document.getElementById("stepLengthGroup"),
};

const state = {
  activeTrack: "bass",
  selectedStep: 0,
  playheadStep: -1,
  pattern: buildStarterPattern() || createDefaultPattern(),
};

const master = createMasterBus();
const instruments = {
  bass: createBassSynth(master.input),
  lead: createLeadSynth(master.input),
  keys: createKeysSynth(master.input),
  drums: createDrumSynth(master.input),
};

applyPresetToInstrument(instruments.bass, PRESETS.bass["New Wave Bass"]);
applyPresetToInstrument(instruments.lead, PRESETS.lead["City Nights Lead"]);
applyPresetToInstrument(instruments.keys, PRESETS.keys["Digital Dream Keys"]);
applyPresetToInstrument(instruments.drums, PRESETS.drums["Retro Beat Kit"]);

const engine = createSequencerEngine({
  pattern: state.pattern,
  instruments,
  transport: createTransport,
  onPlayhead(step) {
    state.playheadStep = step;
    drawGrid();
  },
});

function toggleStep(index) {
  if (state.activeTrack === "drums") {
    const step = state.pattern.drums[index];
    const firstVoice = Object.keys(step.hits).find((k) => step.hits[k]);
    if (firstVoice) {
      step.hits[firstVoice] = false;
    } else {
      step.hits.kick = true;
    }
  } else {
    const step = state.pattern[state.activeTrack][index];
    step.on = !step.on;
  }
  drawGrid();
}

function drawGrid() {
  renderGrid({
    container: ui.gridContainer,
    pattern: state.pattern,
    activeTrack: state.activeTrack,
    playheadStep: state.playheadStep,
    onToggleStep: (stepIndex) => {
      state.selectedStep = stepIndex;
      toggleStep(stepIndex);
      drawStepEditor();
    },
    onSelectStep: (stepIndex) => {
      state.selectedStep = stepIndex;
      drawStepEditor();
    },
  });
}

function drawStepEditor() {
  const step = state.pattern[state.activeTrack][state.selectedStep];
  renderStepEditor({
    container: ui.stepEditor,
    track: state.activeTrack,
    step,
    onStepChange(patch) {
      if (state.activeTrack === "drums") {
        if ("voice" in patch) step.hits[patch.voice] = patch.value;
        if ("accent" in patch) step.accent = patch.accent;
      } else {
        Object.assign(step, patch);
      }
      drawGrid();
      drawStepEditor();
    },
  });
}

function drawControls() {
  renderInstrumentControls({
    panel: ui.instrumentPanel,
    track: state.activeTrack,
    instrumentState: instruments[state.activeTrack].getState(),
    onParamChange: (name, value) => instruments[state.activeTrack].setParam(name, value),
  });
}

function drawPerformance() {
  renderKeyboard({
    container: ui.keyboardContainer,
    activeTrack: state.activeTrack,
    onNote: (note) => {
      const now = Tone.now();
      instruments[state.activeTrack].noteOn(note, now, 0.9);
    },
  });

  renderDrumPads({
    container: ui.drumPadsContainer,
    activeTrack: state.activeTrack,
    onHit: (voice) => instruments.drums.noteOn(voice, Tone.now(), 0.9),
  });
}

function redrawAll() {
  drawGrid();
  drawStepEditor();
  drawControls();
  drawPerformance();
}

function refreshPatternSelect() {
  const saved = listSavedPatterns();
  ui.patternSelect.innerHTML = saved.map((p) => `<option>${p.name}</option>`).join("");
}

ui.playBtn.addEventListener("click", () => engine.play());
ui.stopBtn.addEventListener("click", () => engine.stop());
ui.pauseBtn.addEventListener("click", () => engine.pause());

ui.tempo.addEventListener("input", (e) => {
  const tempo = Number(e.target.value);
  state.pattern.meta.tempo = tempo;
  ui.tempoValue.textContent = String(tempo);
  engine.setTempo(tempo);
});
ui.swing.addEventListener("input", (e) => {
  const swing = Number(e.target.value);
  state.pattern.meta.swing = swing;
  ui.swingValue.textContent = `${swing}%`;
  engine.setSwing(swing / 100);
});

ui.clearPatternBtn.addEventListener("click", () => {
  clearPattern(state.pattern);
  redrawAll();
});
ui.randomizeBtn.addEventListener("click", () => {
  randomizePattern(state.pattern);
  redrawAll();
});
ui.savePatternBtn.addEventListener("click", () => {
  const name = prompt("Save pattern as", state.pattern.meta.name || "Pattern");
  if (!name) return;
  state.pattern.meta.name = name;
  savePattern(name, state.pattern);
  refreshPatternSelect();
});
ui.loadPatternBtn.addEventListener("click", () => {
  const loaded = loadPatternByName(ui.patternSelect.value);
  if (loaded) {
    state.pattern = loaded;
    engine.setLength(state.pattern.meta.length || 16);
    redrawAll();
  }
});

ui.exportPatternBtn.addEventListener("click", () => {
  const blob = new Blob([serializePattern(state.pattern)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${state.pattern.meta.name || "pattern"}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

ui.importPatternInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  state.pattern = deserializePattern(text);
  engine.setLength(state.pattern.meta.length || 16);
  redrawAll();
});

ui.instrumentTabs.querySelectorAll("button[data-track]").forEach((button) => {
  button.addEventListener("click", () => {
    state.activeTrack = button.dataset.track;
    ui.instrumentTabs.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    drawControls();
    drawStepEditor();
    drawGrid();
    drawPerformance();
  });
});

ui.stepLengthGroup.querySelectorAll("button[data-length]").forEach((button) => {
  button.addEventListener("click", () => {
    const length = Number(button.dataset.length);
    state.pattern.meta.length = length;
    engine.setLength(length);
    ui.stepLengthGroup.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    drawGrid();
  });
});

initAudioOnce(ui.startAudioBtn, () => {
  engine.setTempo(state.pattern.meta.tempo);
  engine.setSwing(state.pattern.meta.swing / 100);
});

keepTransportVisible();
lockTouchZoom();
refreshPatternSelect();
redrawAll();
