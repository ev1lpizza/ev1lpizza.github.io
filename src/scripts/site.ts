// Runs on every page. Only an easter egg: the Konami code swaps the palette for this tab.
import { toast } from './core';

function toggleEvil() {
  const on = document.documentElement.classList.toggle('evil');
  try {
    sessionStorage.setItem('ev1l:evil', on ? '1' : '0');
  } catch {}
  window.dispatchEvent(new Event('ev1l:theme'));
  toast(on ? 'Evil mode' : 'Back to normal');
}

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
let pos = 0;
window.addEventListener('keydown', (e) => {
  if (/input|textarea|select/i.test((document.activeElement as HTMLElement)?.tagName ?? '')) return;
  const k = e.key.toLowerCase();
  pos = k === KONAMI[pos] ? pos + 1 : k === KONAMI[0] ? 1 : 0;
  if (pos === KONAMI.length) {
    pos = 0;
    toggleEvil();
  }
});
