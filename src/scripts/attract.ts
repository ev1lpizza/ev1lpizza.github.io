// Animated "attract screens" for game cards and game pages.
// Add a renderer here and set `attract: <name>` in a game's Markdown to use it.
// Games without one fall back to their cover image, or to the `default` renderer.
import { cssVar, isCalm } from './core';

type Draw = (c: CanvasRenderingContext2D, t: number, w: number, h: number) => void;

const rnd = (seed: number) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

export const RENDERERS: Record<string, Draw> = {
  'dough-dodge'(c, t, w, h) {
    c.fillStyle = '#1a0a08';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,194,61,.07)';
    c.lineWidth = 1;
    for (let x = 0; x < w; x += 24) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    const r = rnd(7);
    for (let i = 0; i < 9; i++) {
      const x = r() * w, sp = 40 + r() * 70, y = ((t * sp + r() * h * 2) % (h + 60)) - 30;
      if (i % 3 === 0) {
        c.fillStyle = cssVar('--pepperoni'); c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill();
      } else {
        c.save(); c.translate(x, y); c.rotate(t * 3 + i);
        c.fillStyle = '#d9a46b'; c.fillRect(-22, -5, 44, 10);
        c.fillStyle = '#8a5a2b'; c.fillRect(-30, -3, 8, 6); c.fillRect(22, -3, 8, 6);
        c.restore();
      }
    }
    const px = w / 2 + Math.sin(t * 1.6) * w * 0.3, py = h - 34;
    c.fillStyle = cssVar('--cheese');
    c.beginPath(); c.moveTo(px - 18, py - 12); c.lineTo(px + 18, py - 12); c.lineTo(px, py + 20); c.fill();
    c.fillStyle = '#c9862b'; c.fillRect(px - 18, py - 16, 36, 5);
  },
  'oven-mind'(c, t, w, h) {
    c.fillStyle = '#140a0a';
    c.fillRect(0, 0, w, h);
    const n = 5, s = Math.min(w, h) * 0.15, ox = (w - n * s) / 2, oy = (h - n * s) / 2;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const ph = t * 1.4 + i * 0.9 + j * 1.3;
        const on = Math.sin(ph) > 0, k = Math.abs(Math.cos(ph));
        c.save(); c.translate(ox + i * s + s / 2, oy + j * s + s / 2); c.scale(1, Math.max(0.08, k));
        c.fillStyle = on ? cssVar('--cheese') : '#3a1a18';
        c.fillRect(-s / 2 + 3, -s / 2 + 3, s - 6, s - 6);
        c.restore();
      }
  },
  'neon-anchovy'(c, t, w, h) {
    c.fillStyle = 'rgba(6,10,24,.35)'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) {
      const y = h * (0.2 + i * 0.15) + Math.sin(t * 2 + i) * 14, x = ((t * 60 + i * 140) % (w + 80)) - 40;
      c.strokeStyle = `hsla(${180 + i * 30},100%,65%,.9)`; c.lineWidth = 2.5; c.beginPath();
      for (let k = 0; k < 40; k++) c.lineTo(x - k * 4, y + Math.sin(t * 6 - k * 0.3) * 6);
      c.stroke(); c.fillStyle = c.strokeStyle; c.beginPath(); c.ellipse(x + 6, y, 9, 4, 0, 0, 7); c.fill();
    }
  },
  'crust-runner'(c, t, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a0f1c'); g.addColorStop(1, '#e8432f');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,194,61,.85)'; c.beginPath(); c.arc(w * 0.72, h * 0.42, h * 0.16, 0, 7); c.fill();
    ([[0.25, '#3a1418', 0.55], [0.6, '#22090c', 0.7], [1.2, '#120405', 0.82]] as const).forEach(([sp, col, base], L) => {
      const r = rnd(3 + L); c.fillStyle = col; let x = -((t * 60 * sp) % 60);
      while (x < w + 60) { const bw = 30 + r() * 40, bh = h * (1 - base) + r() * h * 0.25; c.fillRect(x, h - bh, bw, bh); x += bw + 4; }
    });
    const jy = Math.abs(Math.sin(t * 3)) * 40; c.fillStyle = cssVar('--cheese'); c.fillRect(w * 0.25, h * 0.82 - 22 - jy, 14, 22);
  },
  default(c, t, w, h) {
    c.fillStyle = '#1a0a08'; c.fillRect(0, 0, w, h);
    const s = 28, cheese = cssVar('--cheese');
    for (let y = 0; y < h + s; y += s)
      for (let x = 0; x < w + s; x += s) {
        const v = Math.sin(x * 0.04 + t) + Math.cos(y * 0.05 - t * 0.8);
        c.globalAlpha = Math.max(0, v) * 0.35; c.fillStyle = cheese;
        c.beginPath(); c.arc(x, y, 4 + v * 2, 0, 7); c.fill();
      }
    c.globalAlpha = 1;
  },
};

type Mounted = { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; draw: Draw; t: number; active: () => boolean; visible: boolean; drawn: boolean; scale: number };
const mounted: Mounted[] = [];
let running = false;
let last = performance.now();

function size(m: Mounted) {
  const r = m.cv.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width * m.scale)), h = Math.max(1, Math.round(r.height * m.scale));
  if (m.cv.width !== w || m.cv.height !== h) { m.cv.width = w; m.cv.height = h; m.drawn = false; }
}

function loop(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  for (const m of mounted) {
    if (!m.visible || !m.cv.isConnected || m.cv.offsetParent === null) continue;
    size(m);
    const go = m.active() && !isCalm();
    if (go || !m.drawn) {
      if (go) m.t += dt;
      m.draw(m.ctx, m.t, m.cv.width, m.cv.height);
      m.drawn = true;
    }
  }
  requestAnimationFrame(loop);
}

const io = new IntersectionObserver((es) => es.forEach((e) => {
  const m = mounted.find((x) => x.cv === e.target);
  if (m) m.visible = e.isIntersecting;
}));

/** Draw an attract screen into a canvas. `active` decides when it animates (e.g. on hover). */
export function mountAttract(cv: HTMLCanvasElement, name: string, active: () => boolean, scale = 0.5) {
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const draw = RENDERERS[name] ?? RENDERERS.default;
  const m: Mounted = { cv, ctx, draw, t: name.length * 1.7, active, visible: true, drawn: false, scale };
  mounted.push(m);
  io.observe(cv);
  if (!running) { running = true; requestAnimationFrame(loop); }
}

const redraw = () => mounted.forEach((m) => (m.drawn = false));
window.addEventListener('resize', redraw);
window.addEventListener('ev1l:theme', redraw);
window.addEventListener('ev1l:calm', redraw);
