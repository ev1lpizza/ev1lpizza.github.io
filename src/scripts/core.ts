// Shared client helpers. Nothing here leaves the visitor's browser.

export const isCalm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

let toastTimer: number | undefined;
export function toast(msg: string) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('on'), 1800);
}
