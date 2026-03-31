# Groovebox Sequencer (React + Tone.js)

A practical local-first 4-track groovebox built with **React + TypeScript + Vite + Tone.js + Tailwind CSS**.

## Features

- 4 fixed tracks: **Lead**, **Bass**, **Chords**, **Drums**
- Selected-track workflow (sound editor + playable UI + note editor always tied to active track)
- Start Audio gate before transport playback
- Global transport: play / pause / stop
- Looping with adjustable bars (1-8, default 4)
- 4/4 timeline with grid resolutions up to 1/32
- Live playhead + live editing while transport runs
- Piano roll for melodic tracks (create, move, resize, delete, velocity)
- Polyphonic chord track with overlapping notes
- Multi-lane drum grid with per-pad sound controls
- Per-track mixer controls: mute, solo, volume, pan
- Local persistence in `localStorage` + seeded demo pattern on first load

## Setup

```bash
npm install
npm run dev
```

Then open the Vite URL (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Folder structure

- `src/components` – UI components (transport, track list, editors, playable controls)
- `src/audio` – Tone.js engine (transport, instruments, playback scheduling)
- `src/state` – project model, default seeded data, localStorage persistence
- `src/types` – shared TypeScript models
- `src/utils` – grid/time helpers

## Architecture notes

- React owns app/project state (musical + patch + UI selection).
- Audio engine is intentionally separate and state-driven:
  - `applyState` pushes patch/mix/transport values into Tone nodes.
  - A single Tone transport tick (`32n`) reads current state and schedules playback events.
- Live edit timing choice:
  - Sequencer reads the latest note/step arrays every tick, so edits while running are reflected at the next relevant subdivision without restarting transport.
- Persistence choice:
  - Project state is serialized to localStorage on each update for reliable local-first behavior.

## Notes

This v1 favors reliability and clarity over DAW-level scope.
