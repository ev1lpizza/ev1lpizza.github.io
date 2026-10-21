// Shared client helpers: storage, sound, score, toast, calm mode.
// Everything here stays in the visitor's browser. Nothing is sent anywhere.

export const KEYS = {
  score: 'ev1l:score',
  sound: 'ev1l:sound',
  calm: 'ev1l:calm',
} as const;

export const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : (JSON.parse(v) as T);
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};

export const isCalm = () => document.documentElement.classList.contains('calm');
export const isEvil = () => document.documentElement.classList.contains('evil');
export const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

let ac: AudioContext | null = null;
export const sound = { on: store.get<boolean>(KEYS.sound, false) };

export function blip(f = 520, d = 0.07, type: OscillatorType = 'square', vol = 0.05) {
  if (!sound.on) return;
  try {
    ac ??= new AudioContext();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(f * 1.8, ac.currentTime + d);
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + d);
  } catch {}
}

/** Add points to the score shown in the header. */
export function addScore(n: number) {
  window.dispatchEvent(new CustomEvent('ev1l:score', { detail: n }));
}

let toastTimer: number | undefined;
export function toast(msg: string) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('on'), 1800);
}
