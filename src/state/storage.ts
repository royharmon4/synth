import type { ProjectState } from '../types/music'

const KEY = 'groovebox-v1-project'

export function loadProject(): ProjectState | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ProjectState
  } catch {
    return null
  }
}

export function saveProject(state: ProjectState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}
