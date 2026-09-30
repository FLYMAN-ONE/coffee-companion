let ctx: AudioContext | null = null;

/** Must be called from a user gesture (e.g. the Start button) so iPadOS allows sound. */
export function unlockAudio() {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    ctx = ctx ?? new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    // audio is optional
  }
}

export function beep(freq = 880, durationMs = 150, delayMs = 0) {
  if (!ctx) return;
  const start = ctx.currentTime + delayMs / 1000;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.35, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + durationMs / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + durationMs / 1000 + 0.05);
}

export const chimeStep = () => beep(880, 220);
export const chimeTick = () => beep(660, 90);
export const chimeDone = () => {
  beep(880, 180, 0);
  beep(880, 180, 260);
  beep(1175, 420, 520);
};
