export function createTransport(onStep) {
  let currentStep = 0;
  let length = 16;

  Tone.Transport.bpm.value = 112;
  Tone.Transport.swingSubdivision = "16n";

  const loop = new Tone.Loop((time) => {
    onStep(currentStep, time);
    currentStep = (currentStep + 1) % length;
  }, "16n").start(0);

  function setLength(nextLength) {
    length = nextLength;
    currentStep = currentStep % length;
  }

  function setTempo(bpm) {
    Tone.Transport.bpm.rampTo(bpm, 0.04);
  }

  function setSwing(value01) {
    Tone.Transport.swing = value01;
  }

  function play() {
    Tone.Transport.start("+0.02");
  }

  function stop() {
    currentStep = 0;
    Tone.Transport.stop();
  }

  function pause() {
    Tone.Transport.pause();
  }

  return { play, stop, pause, setTempo, setSwing, setLength, loop };
}
