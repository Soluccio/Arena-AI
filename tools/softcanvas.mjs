// =============================================================================
// tools/softcanvas.mjs — Contexto 2D "de software" mínimo, só para as
// ferramentas de build/teste em Node (sem navegador). Implementa o suficiente
// para os sprites: fillStyle, fillRect, clearRect, drawImage, save/restore.
// =============================================================================

class SoftCtx {
  constructor(canvas) {
    this.canvas = canvas;
    this.data = new Uint8ClampedArray(canvas.width * canvas.height * 4);
    this.fillStyle = '#000000';
    this.globalAlpha = 1;
    this.imageSmoothingEnabled = false;
    this._dx = 0;
    this._dy = 0;
    this._stack = [];
  }

  save() { this._stack.push([this._dx, this._dy, this.globalAlpha]); }
  restore() {
    const s = this._stack.pop();
    if (s) { [this._dx, this._dy, this.globalAlpha] = s; }
  }
  translate(x, y) { this._dx += x; this._dy += y; }
  scale() { /* não usado pelos sprites */ }
  beginPath() {} arc() {} fill() {} stroke() {} fillText() {} measureText() { return { width: 0 }; }

  clearRect(x, y, w, h) { this.fillRect(x, y, w, h, 'rgba(0,0,0,0)', true); }

  fillRect(x, y, w, h, force, clear) {
    const color = force || this.fillStyle;
    const rgba = parseColor(color);
    const alpha = clear ? 0 : rgba[3] * this.globalAlpha;
    const x0 = Math.round(x + this._dx);
    const y0 = Math.round(y + this._dy);
    for (let j = 0; j < Math.round(h); j++) {
      const py = y0 + j;
      if (py < 0 || py >= this.canvas.height) continue;
      for (let i = 0; i < Math.round(w); i++) {
        const px2 = x0 + i;
        if (px2 < 0 || px2 >= this.canvas.width) continue;
        const o = (py * this.canvas.width + px2) * 4;
        this.data[o] = rgba[0];
        this.data[o + 1] = rgba[1];
        this.data[o + 2] = rgba[2];
        this.data[o + 3] = alpha;
      }
    }
  }

  drawImage(img, dx, dy) {
    const src = img.getContext ? img.getContext('2d').data : img.data;
    const w = img.width;
    const h = img.height;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const so = (j * w + i) * 4;
        if (src[so + 3] === 0) continue;
        const px2 = Math.round(dx + this._dx) + i;
        const py = Math.round(dy + this._dy) + j;
        if (px2 < 0 || py < 0 || px2 >= this.canvas.width || py >= this.canvas.height) continue;
        const o = (py * this.canvas.width + px2) * 4;
        this.data[o] = src[so];
        this.data[o + 1] = src[so + 1];
        this.data[o + 2] = src[so + 2];
        this.data[o + 3] = src[so + 3];
      }
    }
  }

  getImageData(x, y, w, h) {
    return { data: this.data, width: this.canvas.width, height: this.canvas.height };
  }
}

function parseColor(color) {
  if (typeof color !== 'string') return [0, 0, 0, 255];
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const n = parseInt(hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(',').map((v) => parseFloat(v));
    return [p[0] || 0, p[1] || 0, p[2] || 0, Math.round((p[3] === undefined ? 1 : p[3]) * 255)];
  }
  return [0, 0, 0, 255];
}

export class SoftCanvas {
  constructor() { this.width = 1; this.height = 1; this._ctx = null; }
  getContext() {
    if (!this._ctx) this._ctx = new SoftCtx(this);
    return this._ctx;
  }
}

/** Instala um `document` falso com createElement('canvas'). */
export function installDomShim() {
  globalThis.document = {
    createElement(tag) {
      if (tag === 'canvas') return new SoftCanvas();
      return { style: {}, addEventListener() {}, appendChild() {} };
    },
    addEventListener() {},
    body: { appendChild() {} },
  };
  globalThis.window = globalThis;
  return globalThis.document;
}
