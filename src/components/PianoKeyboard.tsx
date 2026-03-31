interface Props {
  onNoteDown: (midi: number) => void
  chordMode?: boolean
}

const keys = [60, 62, 64, 65, 67, 69, 71, 72]

export function PianoKeyboard({ onNoteDown, chordMode = false }: Props) {
  return (
    <div className="flex gap-1">
      {keys.map((midi) => (
        <button key={midi} className="h-20 w-10 rounded bg-white text-black text-xs" onMouseDown={() => onNoteDown(midi)}>
          {midi}
        </button>
      ))}
      {chordMode && <div className="ml-2 text-xs text-slate-300">Tip: Shift+click multiple keys to audition chords.</div>}
    </div>
  )
}
