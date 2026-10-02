// =============================================================================
// tests/shim.mjs — Ambiente DOM mínimo para rodar o Game em Node (sem browser).
// =============================================================================

import { SoftCanvas } from '../tools/softcanvas.mjs';

function setGlobal(name, value) {
  try {
    globalThis[name] = value;
  } catch {
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  }
}

export function installShim() {
  setGlobal('window', {
    addEventListener() {},
    innerWidth: 960,
    innerHeight: 540,
    AudioContext: undefined,
  });
  setGlobal('navigator', { maxTouchPoints: 0, getGamepads: () => [] });
  setGlobal('localStorage', {
    _m: new Map(),
    getItem(k) { return this._m.has(k) ? this._m.get(k) : null; },
    setItem(k, v) { this._m.set(k, String(v)); },
    removeItem(k) { this._m.delete(k); },
  });
  globalThis.document = {
    createElement(tag) {
      if (tag === 'canvas') { const c = new SoftCanvas(); c.style = {}; return c; }
      return { style: {}, classList: { add() {} }, addEventListener() {}, appendChild() {}, setAttribute() {}, textContent: '' };
    },
    getElementById() { const c = new SoftCanvas(); c.style = {}; return c; },
    body: { appendChild() {} },
    addEventListener() {},
  };
}

export function makeCanvas(w, h) {
  const c = new SoftCanvas();
  c.width = w;
  c.height = h;
  c.style = {};
  return c;
}
