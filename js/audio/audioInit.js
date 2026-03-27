export async function initAudioOnce(button, onReady) {
  let started = false;
  const start = async () => {
    if (started) return;
    await Tone.start();
    started = true;
    button.textContent = "Audio Ready";
    button.disabled = true;
    onReady?.();
  };

  button.addEventListener("click", start, { passive: true });
  document.addEventListener("touchend", () => {
    if (!started) {
      Tone.start().then(() => {
        started = true;
        button.textContent = "Audio Ready";
        button.disabled = true;
        onReady?.();
      }).catch(() => {});
    }
  }, { once: true, passive: true });

  return () => started;
}
