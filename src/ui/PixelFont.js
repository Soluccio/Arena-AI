// =============================================================================
// PixelFont.js — Fonte bitmap 3x5 desenhada com fillRect (sem assets externos).
// Suporta A-Z, 0-9 e pontuação básica. Sombra escura para legibilidade.
// =============================================================================

// Cada glifo = 5 linhas de 3 bits (1 = pixel ligado).
const GLYPHS = {
  A: [2, 5, 7, 5, 5], B: [6, 5, 6, 5, 6], C: [3, 4, 4, 4, 3], D: [6, 5, 5, 5, 6],
  E: [7, 4, 6, 4, 7], F: [7, 4, 6, 4, 4], G: [3, 4, 5, 5, 3], H: [5, 5, 7, 5, 5],
  I: [7, 2, 2, 2, 7], J: [1, 1, 1, 5, 2], K: [5, 5, 6, 5, 5], L: [4, 4, 4, 4, 7],
  M: [5, 7, 5, 5, 5], N: [5, 7, 7, 7, 5], O: [2, 5, 5, 5, 2], P: [6, 5, 6, 4, 4],
  Q: [2, 5, 5, 6, 3], R: [6, 5, 6, 5, 5], S: [3, 4, 2, 1, 6], T: [7, 2, 2, 2, 2],
  U: [5, 5, 5, 5, 7], V: [5, 5, 5, 5, 2], W: [5, 5, 7, 7, 5], X: [5, 5, 2, 5, 5],
  Y: [5, 5, 2, 2, 2], Z: [7, 1, 2, 4, 7],
  0: [2, 5, 5, 5, 2], 1: [2, 6, 2, 2, 7], 2: [6, 1, 2, 4, 7], 3: [7, 1, 3, 1, 7],
  4: [5, 5, 7, 1, 1], 5: [7, 4, 6, 1, 6], 6: [7, 4, 7, 5, 7], 7: [7, 1, 1, 2, 2],
  8: [7, 5, 7, 5, 7], 9: [7, 5, 7, 1, 7],
  ' ': [0, 0, 0, 0, 0], ':': [0, 2, 0, 2, 0], '!': [2, 2, 2, 0, 2], '-': [0, 0, 7, 0, 0],
  '.': [0, 0, 0, 0, 2], '/': [1, 1, 2, 4, 4], '+': [0, 2, 7, 2, 0],
  ',': [0, 0, 0, 2, 4], '?': [6, 1, 2, 0, 2], '%': [5, 1, 2, 4, 5],
};

export class PixelFont {
  constructor() {
    this.charW = 4;   // 3 + 1 de espaçamento
    this.h = 5;
  }

  width(text, scale = 1) {
    return text.length * this.charW * scale;
  }

  /**
   * Desenha texto. `center` alinha horizontalmente no x informado.
   * Sempre com sombra de 1px para contraste no cenário.
   */
  draw(ctx, text, x, y, color = '#ffffff', scale = 1, center = false) {
    const str = String(text).toUpperCase();
    let ox = x;
    if (center) ox = x - this.width(str, scale) / 2;
    this._raw(ctx, str, Math.round(ox) + scale, Math.round(y) + scale, '#0b0b16', scale);
    this._raw(ctx, str, Math.round(ox), Math.round(y), color, scale);
  }

  _raw(ctx, str, x, y, color, scale) {
    ctx.fillStyle = color;
    let cx = x;
    for (const ch of str) {
      const g = GLYPHS[ch] || GLYPHS['?'];
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
          if (g[row] & (4 >> col)) {
            ctx.fillRect(cx + col * scale, y + row * scale, scale, scale);
          }
        }
      }
      cx += this.charW * scale;
    }
  }
}

/** Instância compartilhada (o jogo inteiro usa uma fonte só). */
export const font = new PixelFont();
