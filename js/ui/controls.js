import { DRUM_VOICES } from "../sequencer/patternState.js";

function slider({ key, label, min, max, step, value }) {
  return `<label class="control">${label}: <span data-value-for="${key}">${value}</span><input data-param="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" /></label>`;
}

export function renderInstrumentControls({ panel, track, instrumentState, onParamChange }) {
  panel.innerHTML = `<h2>${track.toUpperCase()} Controls</h2>`;

  let html = "<div class='control-grid'>";
  if (track === "bass") {
    html += `<label class='control'>Waveform<select data-param='waveform'><option>sawtooth</option><option>square</option><option>triangle</option></select></label>`;
    html += slider({ key: "cutoff", label: "Cutoff", min: 80, max: 2400, step: 1, value: instrumentState.cutoff });
    html += slider({ key: "resonance", label: "Resonance", min: 0.1, max: 12, step: 0.1, value: instrumentState.resonance });
    html += slider({ key: "envAmount", label: "Env Amt", min: 0, max: 1, step: 0.01, value: instrumentState.envAmount });
    html += slider({ key: "decay", label: "Decay", min: 0.05, max: 0.7, step: 0.01, value: instrumentState.decay });
    html += slider({ key: "accent", label: "Accent", min: 0, max: 0.7, step: 0.01, value: instrumentState.accent });
    html += slider({ key: "glide", label: "Glide", min: 0, max: 0.2, step: 0.005, value: instrumentState.glide });
  } else if (track === "lead") {
    html += slider({ key: "waveformBlend", label: "Wave Blend", min: 0, max: 1, step: 0.01, value: instrumentState.waveformBlend });
    html += slider({ key: "cutoff", label: "Cutoff", min: 200, max: 7000, step: 1, value: instrumentState.cutoff });
    html += slider({ key: "resonance", label: "Resonance", min: 0.1, max: 12, step: 0.1, value: instrumentState.resonance });
    html += slider({ key: "attack", label: "Attack", min: 0.001, max: 0.5, step: 0.001, value: instrumentState.attack });
    html += slider({ key: "decay", label: "Decay", min: 0.05, max: 1.2, step: 0.01, value: instrumentState.decay });
    html += slider({ key: "sustain", label: "Sustain", min: 0, max: 1, step: 0.01, value: instrumentState.sustain });
    html += slider({ key: "release", label: "Release", min: 0.05, max: 1.2, step: 0.01, value: instrumentState.release });
    html += slider({ key: "glide", label: "Glide", min: 0, max: 0.3, step: 0.005, value: instrumentState.glide });
    html += slider({ key: "vibratoDepth", label: "Vibrato Depth", min: 0, max: 40, step: 1, value: instrumentState.vibratoDepth });
    html += slider({ key: "vibratoRate", label: "Vibrato Rate", min: 0.2, max: 9, step: 0.1, value: instrumentState.vibratoRate });
  } else if (track === "keys") {
    html += slider({ key: "brightness", label: "Brightness", min: 0, max: 1, step: 0.01, value: instrumentState.brightness });
    html += slider({ key: "tone", label: "Tone", min: 0, max: 1, step: 0.01, value: instrumentState.tone });
    html += slider({ key: "chorusAmount", label: "Chorus", min: 0, max: 1, step: 0.01, value: instrumentState.chorusAmount });
    html += slider({ key: "release", label: "Release", min: 0.1, max: 2.5, step: 0.01, value: instrumentState.release });
    html += slider({ key: "velocitySensitivity", label: "Velocity", min: 0, max: 1, step: 0.01, value: instrumentState.velocitySensitivity });
  } else {
    html += slider({ key: "accent", label: "Accent", min: 0, max: 0.8, step: 0.01, value: instrumentState.accent });
    DRUM_VOICES.forEach((v) => {
      html += slider({ key: `volume.${v}`, label: `${v} Vol`, min: 0, max: 1, step: 0.01, value: instrumentState.volumes[v] });
      html += slider({ key: `decay.${v}`, label: `${v} Decay`, min: 0.03, max: 0.8, step: 0.01, value: instrumentState.decays[v] });
    });
  }
  html += "</div>";
  panel.insertAdjacentHTML("beforeend", html);

  if (track === "bass") {
    const select = panel.querySelector("select[data-param='waveform']");
    select.value = instrumentState.waveform;
    select.addEventListener("change", () => onParamChange("waveform", select.value));
  }

  panel.querySelectorAll("input[data-param]").forEach((el) => {
    el.addEventListener("input", () => {
      const key = el.dataset.param;
      const value = Number(el.value);
      panel.querySelector(`[data-value-for='${key}']`).textContent = value.toFixed(2).replace(/\.00$/, "");
      onParamChange(key, value);
    });
  });
}

export function renderStepEditor({ container, track, step, onStepChange }) {
  if (!step) {
    container.innerHTML = "";
    return;
  }

  if (track === "drums") {
    container.innerHTML = `<h3>Step Editor (Drums)</h3><div class='segmented' id='drumStepToggles'></div><div class='small-note'>Tap voices to toggle. Accent adds punch.</div>`;
    const wrap = container.querySelector("#drumStepToggles");
    DRUM_VOICES.forEach((voice) => {
      const b = document.createElement("button");
      b.textContent = voice;
      if (step.hits[voice]) b.classList.add("active");
      b.addEventListener("click", () => onStepChange({ voice, value: !step.hits[voice] }));
      wrap.appendChild(b);
    });
    const accent = document.createElement("button");
    accent.textContent = `Accent ${step.accent ? "On" : "Off"}`;
    if (step.accent) accent.classList.add("active");
    accent.addEventListener("click", () => onStepChange({ accent: !step.accent }));
    wrap.appendChild(accent);
    return;
  }

  container.innerHTML = `
    <h3>Step Editor (${track})</h3>
    <div class='transport-row'>
      <button id='stepOnBtn' class='${step.on ? "active" : ""}'>${step.on ? "On" : "Off"}</button>
      <label>Note</label>
      <select id='stepNote'>${["C2","D2","E2","F2","G2","A2","B2","C3","D3","E3","F3","G3","A3","B3","C4","D4","E4","F4","G4","A4"].map((n) => `<option ${n===step.note?"selected":""}>${n}</option>`).join("")}</select>
      <label>Velocity</label>
      <input id='stepVel' type='range' min='0.1' max='1' step='0.01' value='${step.velocity}' />
      <label>Gate</label>
      <input id='stepGate' type='range' min='0.2' max='1.2' step='0.01' value='${step.gate}' />
      <button id='stepAccentBtn' class='${step.accent ? "active" : ""}'>Accent</button>
    </div>`;

  container.querySelector("#stepOnBtn").addEventListener("click", () => onStepChange({ on: !step.on }));
  container.querySelector("#stepNote").addEventListener("change", (e) => onStepChange({ note: e.target.value, on: true }));
  container.querySelector("#stepVel").addEventListener("input", (e) => onStepChange({ velocity: Number(e.target.value), on: true }));
  container.querySelector("#stepGate").addEventListener("input", (e) => onStepChange({ gate: Number(e.target.value), on: true }));
  container.querySelector("#stepAccentBtn").addEventListener("click", () => onStepChange({ accent: !step.accent }));
}
