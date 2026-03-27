export function lockTouchZoom() {
  document.querySelectorAll("button, input, select, .step").forEach((el) => {
    el.style.touchAction = "manipulation";
  });
}

export function keepTransportVisible() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  topbar.style.position = "sticky";
}
