// Runs on every page: header score, sound and calm toggles, search palette, Konami code.
import { KEYS, blip, isCalm, sound, store, toast } from './core';

const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector(s) as T | null;

/* ---------- Score ---------- */
let score = store.get<number>(KEYS.score, 0);
const scoreEl = $('#score');
const paintScore = () => scoreEl && (scoreEl.textContent = String(score).padStart(6, '0'));
paintScore();
window.addEventListener('ev1l:score', (e) => {
  score += Number((e as CustomEvent).detail) || 0;
  store.set(KEYS.score, score);
  paintScore();
  if (!isCalm()) scoreEl?.animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'cubic-bezier(.3,1.6,.5,1)' });
});
// Games embedded from this site can report points: parent.postMessage({ type: 'ev1l:score', points: 25 }, '*')
window.addEventListener('message', (e) => {
  if (e.origin !== location.origin) return;
  const d = e.data as { type?: string; points?: number };
  if (d?.type === 'ev1l:score' && typeof d.points === 'number' && d.points > 0 && d.points < 10000) {
    window.dispatchEvent(new CustomEvent('ev1l:score', { detail: d.points }));
  }
});

/* ---------- Toggles ---------- */
const soundBtn = $('#soundBtn');
soundBtn?.setAttribute('aria-pressed', String(sound.on));
soundBtn?.addEventListener('click', () => {
  sound.on = !sound.on;
  store.set(KEYS.sound, sound.on);
  soundBtn.setAttribute('aria-pressed', String(sound.on));
  blip(660, 0.1);
  toast(sound.on ? 'SOUND ON' : 'SOUND OFF');
});

const calmBtn = $('#calmBtn');
const paintCalm = () => calmBtn?.setAttribute('aria-pressed', String(isCalm()));
paintCalm();
function toggleCalm() {
  const on = document.documentElement.classList.toggle('calm');
  store.set(KEYS.calm, on ? 1 : 0);
  paintCalm();
  window.dispatchEvent(new Event('ev1l:calm'));
  toast(on ? 'CALM MODE ON: ANIMATION PAUSED' : 'CALM MODE OFF');
}
calmBtn?.addEventListener('click', toggleCalm);

function toggleEvil() {
  const on = document.documentElement.classList.toggle('evil');
  try { sessionStorage.setItem('ev1l:evil', on ? '1' : '0'); } catch {}
  window.dispatchEvent(new Event('ev1l:theme'));
  toast(on ? 'EVIL MODE ON' : 'EVIL MODE OFF');
  blip(on ? 150 : 600, 0.25, 'sawtooth', 0.05);
}

/* ---------- Search palette ---------- */
type Item = { label: string; kind: string; href?: string; action?: string; hay: string };
const pal = $('#palette');
const input = $<HTMLInputElement>('#paletteInput');
const list = $('#paletteList');
const data: Omit<Item, 'hay'>[] = JSON.parse($('#palette-data')?.textContent || '[]');
const ACTIONS: Omit<Item, 'hay'>[] = [
  { label: 'Random game', kind: 'Action', action: 'random' },
  { label: 'Toggle sound', kind: 'Action', action: 'sound' },
  { label: 'Toggle calm mode', kind: 'Action', action: 'calm' },
  { label: 'Toggle evil mode', kind: 'Secret', action: 'evil' },
];
const all: Item[] = [...data, ...ACTIONS].map((x) => ({ ...x, hay: `${x.label} ${x.kind}`.toLowerCase() }));
let items: Item[] = [];
let sel = 0;

function render() {
  if (!input || !list) return;
  const q = input.value.trim().toLowerCase();
  items = all.filter((x) => !q || x.hay.includes(q));
  sel = Math.min(sel, Math.max(0, items.length - 1));
  list.innerHTML = items.length
    ? items.map((x, i) => `<li role="option" id="pal-${i}" aria-selected="${i === sel}" data-i="${i}"><span>${x.label}</span><small>${x.kind}</small></li>`).join('')
    : '<li class="empty">Nothing on the menu by that name.</li>';
  input.setAttribute('aria-activedescendant', items.length ? `pal-${sel}` : '');
  list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
}
let lastFocus: Element | null = null;
function openPalette() {
  if (!pal || !input) return;
  lastFocus = document.activeElement;
  pal.hidden = false;
  input.value = '';
  sel = 0;
  render();
  input.focus();
}
function closePalette() {
  if (!pal || pal.hidden) return;
  pal.hidden = true;
  (lastFocus as HTMLElement | null)?.focus?.();
}
function run(it?: Item) {
  if (!it) return;
  closePalette();
  if (it.href) return void (location.href = it.href);
  if (it.action === 'random') {
    const games = all.filter((x) => x.kind === 'Game' && x.href);
    const g = games[Math.floor(Math.random() * games.length)];
    if (g?.href) location.href = g.href;
  }
  if (it.action === 'sound') soundBtn?.click();
  if (it.action === 'calm') toggleCalm();
  if (it.action === 'evil') toggleEvil();
}
$('#paletteBtn')?.addEventListener('click', openPalette);
input?.addEventListener('input', () => { sel = 0; render(); });
list?.addEventListener('click', (e) => {
  const li = (e.target as Element).closest<HTMLElement>('[data-i]');
  if (li) run(items[Number(li.dataset.i)]);
});
pal?.addEventListener('click', (e) => { if (e.target === pal) closePalette(); });
input?.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { sel = (sel + 1) % Math.max(1, items.length); render(); e.preventDefault(); }
  if (e.key === 'ArrowUp') { sel = (sel - 1 + items.length) % Math.max(1, items.length); render(); e.preventDefault(); }
  if (e.key === 'Enter') run(items[sel]);
  if (e.key === 'Tab') e.preventDefault();
});

/* ---------- Keys ---------- */
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
let kpos = 0;
window.addEventListener('keydown', (e) => {
  const typing = /input|textarea|select/i.test((document.activeElement as HTMLElement)?.tagName ?? '');
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    pal?.hidden ? openPalette() : closePalette();
    return;
  }
  if (e.key === '/' && pal?.hidden && !typing) { e.preventDefault(); openPalette(); return; }
  if (e.key === 'Escape') closePalette();
  if (typing) return;
  const k = e.key.toLowerCase();
  kpos = k === KONAMI[kpos] ? kpos + 1 : k === KONAMI[0] ? 1 : 0;
  if (kpos === KONAMI.length) { kpos = 0; toggleEvil(); }
});
