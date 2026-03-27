export function createSequencerEngine({ pattern, instruments, transport, onPlayhead }) {
  function runStep(stepIndex, time) {
    const length = pattern.meta.length;
    const i = stepIndex % length;

    instruments.bass.triggerStep(pattern.bass[i], time);
    instruments.lead.triggerStep(pattern.lead[i], time);
    instruments.keys.triggerStep(pattern.keys[i], time);
    instruments.drums.triggerStep(pattern.drums[i], time);

    onPlayhead?.(i);
  }

  const t = transport(runStep);

  return {
    play: t.play,
    stop: t.stop,
    pause: t.pause,
    setTempo: t.setTempo,
    setSwing: t.setSwing,
    setLength(nextLength) {
      pattern.meta.length = nextLength;
      t.setLength(nextLength);
    },
  };
}
