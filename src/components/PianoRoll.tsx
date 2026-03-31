import { useMemo, useState } from 'react'
import type { NoteEvent } from '../types/music'
import { clamp, getTotalSteps } from '../utils/grid'

const pitches = Array.from({ length: 36 }, (_, i) => 84 - i)

interface Props {
  notes: NoteEvent[]
  bars: number
  resolution: '1/4' | '1/8' | '1/16' | '1/32'
  playheadStep: number
  onUpsertNote: (note: Omit<NoteEvent, 'id'> & { id?: string }) => void
  onDeleteNote: (id: string) => void
}

export function PianoRoll({ notes, bars, resolution, playheadStep, onUpsertNote, onDeleteNote }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const totalSteps = getTotalSteps(bars, resolution)
  const selectedNote = notes.find((n) => n.id === selected)

  const grid = useMemo(() => {
    const rows = pitches.length
    return { rows, totalSteps }
  }, [totalSteps])

  return (
    <div className="rounded border border-slate-700 bg-slate-900 p-2">
      <div className="relative h-[420px] overflow-auto" tabIndex={0} onKeyDown={(e) => e.key === 'Delete' && selected && onDeleteNote(selected)}>
        <div className="relative" style={{ width: totalSteps * 24, height: grid.rows * 18 }}
          onDoubleClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left + e.currentTarget.scrollLeft
            const y = e.clientY - rect.top + e.currentTarget.scrollTop
            const step = clamp(Math.floor(x / 24), 0, totalSteps - 1)
            const row = clamp(Math.floor(y / 18), 0, pitches.length - 1)
            onUpsertNote({ pitch: pitches[row], startStep: step, lengthSteps: 1, velocity: 0.9 })
          }}>
          {Array.from({ length: grid.rows + 1 }).map((_, i) => <div key={`h${i}`} className="absolute left-0 right-0 border-t border-slate-800" style={{ top: i * 18 }} />)}
          {Array.from({ length: totalSteps + 1 }).map((_, i) => <div key={`v${i}`} className={`absolute top-0 bottom-0 border-l ${i % 4 === 0 ? 'border-slate-700' : 'border-slate-800'}`} style={{ left: i * 24 }} />)}
          <div className="absolute top-0 bottom-0 w-0.5 bg-red-400" style={{ left: playheadStep * 24 }} />

          {notes.map((n) => {
            const top = pitches.indexOf(n.pitch) * 18
            return (
              <div
                key={n.id}
                className={`absolute rounded border ${selected === n.id ? 'border-cyan-300 bg-cyan-500/80' : 'border-cyan-700 bg-cyan-600/70'}`}
                style={{ left: n.startStep * 24, top, width: n.lengthSteps * 24, height: 18 }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  setSelected(n.id)
                  const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
                  const startX = e.clientX
                  const startY = e.clientY
                  const mode = e.nativeEvent.offsetX > n.lengthSteps * 24 - 8 ? 'resize' : 'move'
                  const original = { ...n }
                  const onMove = (ev: MouseEvent) => {
                    const dx = Math.round((ev.clientX - startX) / 24)
                    const dy = Math.round((ev.clientY - startY) / 18)
                    if (mode === 'move') {
                      onUpsertNote({ ...original, id: n.id, startStep: clamp(original.startStep + dx, 0, totalSteps - 1), pitch: clamp(original.pitch - dy, pitches[pitches.length - 1], pitches[0]) })
                    } else {
                      onUpsertNote({ ...original, id: n.id, lengthSteps: clamp(original.lengthSteps + dx, 1, totalSteps - original.startStep) })
                    }
                  }
                  const onUp = () => {
                    window.removeEventListener('mousemove', onMove)
                    window.removeEventListener('mouseup', onUp)
                  }
                  void rect
                  window.addEventListener('mousemove', onMove)
                  window.addEventListener('mouseup', onUp)
                }}
              />
            )
          })}
        </div>
      </div>
      {selectedNote && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span>Velocity</span>
          <input type="range" min={0.1} max={1} step={0.01} value={selectedNote.velocity} onChange={(e) => onUpsertNote({ ...selectedNote, id: selectedNote.id, velocity: Number(e.target.value) })} />
          <span>{selectedNote.velocity.toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}
