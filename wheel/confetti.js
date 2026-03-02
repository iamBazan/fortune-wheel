/**
 * Thin wrapper around canvas-confetti CDN build.
 */

export function fireMainPrizeConfetti() {
  if (typeof confetti !== "function") return;

  const defaults = {
    spread: 85,
    ticks: 220,
    gravity: 0.9,
    colors: ["#C9A24D", "#263DC0", "#F76666", "#ffffff"],
  };

  confetti({ ...defaults, particleCount: 180, origin: { y: 0.55 } });
  setTimeout(() => confetti({ ...defaults, particleCount: 120, origin: { x: 0.2, y: 0.6 } }), 200);
  setTimeout(() => confetti({ ...defaults, particleCount: 120, origin: { x: 0.8, y: 0.6 } }), 350);
}
