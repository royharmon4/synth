import { DRUM_VOICES } from "../sequencer/patternState.js";

const NOTE_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const DISPLAY_OCTAVES = [3, 4, 5];
const KEYBOARD_KEY_CODES = [
  "KeyA", "KeyW", "KeyS", "KeyE", "KeyD", "KeyF", "KeyT", "KeyG", "KeyY", "KeyH", "KeyU", "KeyJ",
  "KeyK", "KeyO", "KeyL", "KeyP", "Semicolon", "Quote", "BracketRight", "Backslash", "Digit1", "Digit2", "Digit3", "Digit4",
  "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace", "Numpad1", "Numpad2", "Numpad3",
];

let audioContext = null;
let mainGainNode = null;
let customWaveform = null;
const oscList = {};
const activeByCode = new Map();
let keyboardBindings = null;

function ensureAudioGraph(volumeValue) {
  if (!audioContext) audioContext = new AudioContext();
  if (!mainGainNode) {
    mainGainNode = audioContext.createGain();
    mainGainNode.connect(audioContext.destination);
  }
  if (!customWaveform) {
    const sineTerms = new Float32Array([0, 0, 1, 0, 1]);
    const cosineTerms = new Float32Array(sineTerms.length);
    customWaveform = audioContext.createPeriodicWave(cosineTerms, sineTerms);
  }

  mainGainNode.gain.value = Number(volumeValue);

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function noteToFrequency(note, octave) {
  const keyNum = NOTE_ORDER.indexOf(note);
  const midi = (octave + 1) * 12 + keyNum;
  return 440 * (2 ** ((midi - 69) / 12));
}

function playTone(freq, wavePicker) {
  const osc = audioContext.createOscillator();
  osc.connect(mainGainNode);

  const type = wavePicker.value;
  if (type === "custom") {
    osc.setPeriodicWave(customWaveform);
  } else {
    osc.type = type;
  }

  osc.frequency.value = freq;
  osc.start();
  return osc;
}

function stopTone(noteId) {
  const osc = oscList[noteId];
  if (!osc) return;
  osc.stop();
  delete oscList[noteId];
}

function bindKeyboardEvents({ keys, pressKey, releaseKey }) {
  if (keyboardBindings) {
    removeEventListener("keydown", keyboardBindings.keydown);
    removeEventListener("keyup", keyboardBindings.keyup);
    keyboardBindings = null;
  }

  const keydown = (event) => {
    const idx = KEYBOARD_KEY_CODES.indexOf(event.code);
    const keyEl = idx >= 0 ? keys[idx] : null;
    if (!keyEl || event.repeat) return;
    activeByCode.set(event.code, keyEl);
    keyEl.classList.add("active");
    pressKey(keyEl);
    event.preventDefault();
  };

  const keyup = (event) => {
    const keyEl = activeByCode.get(event.code);
    if (!keyEl) return;
    keyEl.classList.remove("active");
    releaseKey(keyEl);
    activeByCode.delete(event.code);
    event.preventDefault();
  };

  addEventListener("keydown", keydown);
  addEventListener("keyup", keyup);
  keyboardBindings = { keydown, keyup };
}

export function renderKeyboard({ container, onNote, activeTrack }) {
  container.innerHTML = "";
  if (activeTrack === "drums") {
    container.style.display = "none";
    return;
  }

  const shell = document.createElement("div");
  shell.className = "video-keyboard-shell";

  const keyContainer = document.createElement("div");
  keyContainer.className = "container";
  const keyboard = document.createElement("div");
  keyboard.className = "keyboard";
  keyContainer.appendChild(keyboard);

  const settingsBar = document.createElement("div");
  settingsBar.className = "settingsBar";

  const left = document.createElement("div");
  left.className = "left";
  const volumeLabel = document.createElement("span");
  volumeLabel.textContent = "Volume: ";
  const volumeControl = document.createElement("input");
  volumeControl.type = "range";
  volumeControl.min = "0.0";
  volumeControl.max = "1.0";
  volumeControl.step = "0.01";
  volumeControl.value = "0.5";
  volumeControl.name = "volume";
  volumeControl.setAttribute("list", "volumes");

  const datalist = document.createElement("datalist");
  datalist.id = "volumes";
  datalist.innerHTML = '<option value="0.0" label="Mute"></option><option value="1.0" label="100%"></option>';
  left.append(volumeLabel, volumeControl, datalist);

  const right = document.createElement("div");
  right.className = "right";
  const waveLabel = document.createElement("span");
  waveLabel.textContent = "Current waveform: ";
  const wavePicker = document.createElement("select");
  wavePicker.name = "waveform";
  wavePicker.innerHTML = `
    <option value="sine">Sine</option>
    <option value="square" selected>Square</option>
    <option value="sawtooth">Sawtooth</option>
    <option value="triangle">Triangle</option>
    <option value="custom">Custom</option>
  `;
  right.append(waveLabel, wavePicker);

  settingsBar.append(left, right);

  const keyElements = [];
  DISPLAY_OCTAVES.forEach((octave) => {
    const octaveElem = document.createElement("div");
    octaveElem.className = "octave";

    NOTE_ORDER.forEach((note) => {
      if (note.includes("#")) return;
      const keyElement = document.createElement("div");
      const labelElement = document.createElement("div");
      const frequency = noteToFrequency(note, octave);
      const noteId = `${note}${octave}`;

      keyElement.className = "key";
      keyElement.dataset.octave = String(octave);
      keyElement.dataset.note = note;
      keyElement.dataset.frequency = String(frequency);
      keyElement.dataset.noteId = noteId;
      labelElement.append(document.createTextNode(note), document.createElement("sub"));
      labelElement.querySelector("sub").textContent = String(octave);
      keyElement.appendChild(labelElement);

      octaveElem.appendChild(keyElement);
      keyElements.push(keyElement);
    });

    keyboard.appendChild(octaveElem);
  });

  function pressKey(keyElement) {
    const { noteId, frequency } = keyElement.dataset;
    if (!noteId || oscList[noteId]) return;

    ensureAudioGraph(volumeControl.value);
    oscList[noteId] = playTone(Number(frequency), wavePicker);
    onNote?.(`${keyElement.dataset.note}${keyElement.dataset.octave}`);
    keyElement.dataset.pressed = "yes";
  }

  function releaseKey(keyElement) {
    const { noteId } = keyElement.dataset;
    if (!noteId) return;
    stopTone(noteId);
    delete keyElement.dataset.pressed;
  }

  keyElements.forEach((key) => {
    key.addEventListener("mousedown", () => pressKey(key));
    key.addEventListener("mouseup", () => releaseKey(key));
    key.addEventListener("mouseleave", () => releaseKey(key));
    key.addEventListener("touchstart", (event) => {
      event.preventDefault();
      pressKey(key);
    }, { passive: false });
    key.addEventListener("touchend", () => releaseKey(key), { passive: true });
  });

  volumeControl.addEventListener("input", () => {
    if (!mainGainNode) return;
    mainGainNode.gain.value = Number(volumeControl.value);
  });

  bindKeyboardEvents({ keys: keyElements, pressKey, releaseKey });

  shell.append(keyContainer, settingsBar);
  container.appendChild(shell);
  container.style.display = "block";
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
