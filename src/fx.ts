// Tiny sound/wake helpers for the turn timer. The AudioContext is created
// lazily on a user gesture (the Start button), which is what browsers want.

let ctx: AudioContext | null = null

export function primeAudio(): void {
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch {
    // no audio — the vibration + red timer still land
  }
}

export function beep(times = 3): void {
  primeAudio()
  if (!ctx) return
  const t0 = ctx.currentTime
  for (let i = 0; i < times; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.12, t0 + i * 0.22)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.22 + 0.18)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0 + i * 0.22)
    osc.stop(t0 + i * 0.22 + 0.2)
  }
}

export function buzz(pattern: number | number[] = 250): void {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // unsupported — fine
  }
}

let wakeLock: WakeLockSentinel | null = null

export async function keepAwake(on: boolean): Promise<void> {
  try {
    if (on) {
      wakeLock = (await navigator.wakeLock?.request('screen')) ?? null
    } else {
      await wakeLock?.release()
      wakeLock = null
    }
  } catch {
    // wake lock is a nicety, never a blocker
  }
}
