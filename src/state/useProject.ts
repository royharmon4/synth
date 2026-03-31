import { useEffect, useMemo, useState } from 'react'
import { createDefaultProject } from './defaultProject'
import { loadProject, saveProject } from './storage'
import type { DrumPadState, GridResolution, NoteEvent, ProjectState, TrackId } from '../types/music'
import { clamp, getTotalSteps } from '../utils/grid'

const noteId = () => crypto.randomUUID()

export function useProjectState() {
  const [project, setProject] = useState<ProjectState>(() => loadProject() ?? createDefaultProject())
  const [playheadStep, setPlayheadStep] = useState(0)

  useEffect(() => saveProject(project), [project])

  const selectedTrack = useMemo(() => {
    return project[project.selectedTrackId]
  }, [project])

  const updateProject = (updater: (prev: ProjectState) => ProjectState) => setProject((prev) => updater(prev))

  const setSelectedTrack = (trackId: TrackId) => updateProject((p) => ({ ...p, selectedTrackId: trackId }))
  const setAudioReady = (ready: boolean) => updateProject((p) => ({ ...p, audioReady: ready }))
  const setPlaying = (playing: boolean) => updateProject((p) => ({ ...p, playing }))
  const setBpm = (bpm: number) => updateProject((p) => ({ ...p, bpm: clamp(bpm, 60, 200) }))
  const setBars = (bars: number) => updateProject((p) => ({ ...p, bars: clamp(bars, 1, 8) }))
  const setResolution = (resolution: GridResolution) => updateProject((p) => ({ ...p, resolution }))

  const updateTrackMix = (trackId: TrackId, key: 'mute' | 'solo' | 'volume' | 'pan', value: boolean | number) => {
    updateProject((p) => ({ ...p, [trackId]: { ...p[trackId], mix: { ...p[trackId].mix, [key]: value } } }))
  }

  const updateSynthPatch = (trackId: 'lead' | 'bass' | 'chords', key: string, value: number | string) => {
    updateProject((p) => ({ ...p, [trackId]: { ...p[trackId], patch: { ...p[trackId].patch, [key]: value } } }))
  }

  const upsertNote = (trackId: 'lead' | 'bass' | 'chords', note: Omit<NoteEvent, 'id'> & { id?: string }) => {
    updateProject((p) => {
      const notes = p[trackId].notes
      if (note.id) {
        return { ...p, [trackId]: { ...p[trackId], notes: notes.map((n) => (n.id === note.id ? { ...n, ...note } : n)) } }
      }
      return { ...p, [trackId]: { ...p[trackId], notes: [...notes, { ...note, id: noteId() }] } }
    })
  }

  const deleteNote = (trackId: 'lead' | 'bass' | 'chords', id: string) => {
    updateProject((p) => ({ ...p, [trackId]: { ...p[trackId], notes: p[trackId].notes.filter((n) => n.id !== id) } }))
  }

  const toggleDrumStep = (padId: string, step: number) => {
    updateProject((p) => ({
      ...p,
      drums: {
        ...p.drums,
        patch: {
          ...p.drums.patch,
          pads: p.drums.patch.pads.map((pad) =>
            pad.id === padId
              ? {
                  ...pad,
                  steps: pad.steps.map((cell, idx) => (idx === step ? { ...cell, active: !cell.active } : cell)),
                }
              : pad,
          ),
        },
      },
    }))
  }

  const updateDrumPad = (padId: string, key: keyof DrumPadState, value: number) => {
    updateProject((p) => ({
      ...p,
      drums: {
        ...p.drums,
        patch: {
          ...p.drums.patch,
          pads: p.drums.patch.pads.map((pad) => (pad.id === padId ? { ...pad, [key]: value } : pad)),
        },
      },
    }))
  }

  useEffect(() => {
    const total = getTotalSteps(project.bars, project.resolution)
    updateProject((p) => ({
      ...p,
      lead: { ...p.lead, notes: p.lead.notes.filter((n) => n.startStep < total).map((n) => ({ ...n, lengthSteps: Math.min(n.lengthSteps, total - n.startStep) })) },
      bass: { ...p.bass, notes: p.bass.notes.filter((n) => n.startStep < total).map((n) => ({ ...n, lengthSteps: Math.min(n.lengthSteps, total - n.startStep) })) },
      chords: { ...p.chords, notes: p.chords.notes.filter((n) => n.startStep < total).map((n) => ({ ...n, lengthSteps: Math.min(n.lengthSteps, total - n.startStep) })) },
      drums: { ...p.drums, patch: { ...p.drums.patch, pads: p.drums.patch.pads.map((pad) => ({ ...pad, steps: pad.steps.slice(0, total) })) } },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.bars, project.resolution])

  return {
    project,
    selectedTrack,
    playheadStep,
    setPlayheadStep,
    setSelectedTrack,
    setAudioReady,
    setPlaying,
    setBpm,
    setBars,
    setResolution,
    updateTrackMix,
    updateSynthPatch,
    upsertNote,
    deleteNote,
    toggleDrumStep,
    updateDrumPad,
  }
}
