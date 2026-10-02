// =============================================================================
// pxutil.js — Primitivas de desenho em pixel art (tudo com fillRect).
// Usadas pelos módulos draw*.js para montar sprites pixel a pixel.
// =============================================================================

import { CHAR_MAP } from './Palette.js';

/** Retângulo de pixels alinhado à grade. */
export function px(ctx, x, y, w, h, color) {
  if (!color || w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Linha de pixels (Bresenham) com espessura em blocos. */
export function pxLine(ctx, x0, y0, x1, y1, color, thick = 1) {
  let x = Math.round(x0);
  let y = Math.round(y0);
  const dx = Math.abs(Math.round(x1) - x);
  const dy = -Math.abs(Math.round(y1) - y);
  const sx = x < x1 ? 1 : -1;
  const sy = y < y1 ? 1 : -1;
  let err = dx + dy;
  for (let guard = 0; guard < 200; guard++) {
    px(ctx, x, y, thick, thick, color);
    if (x === Math.round(x1) && y === Math.round(y1)) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

/** Triângulo preenchido (scanline) — usado em orelhas, chapéus e dentes. */
export function pxTri(ctx, ax, ay, bx, by, cx, cy, color) {
  const minY = Math.round(Math.min(ay, by, cy));
  const maxY = Math.round(Math.max(ay, by, cy));
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    const pts = [[ax, ay, bx, by], [bx, by, cx, cy], [cx, cy, ax, ay]];
    for (const [x1, y1, x2, y2] of pts) {
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
    if (xs.length >= 2) {
      const x0 = Math.round(Math.min(...xs));
      const x1 = Math.round(Math.max(...xs));
      px(ctx, x0, y, Math.max(1, x1 - x0), 1, color);
    }
  }
}

/** Disco preenchido aproximado (bom para olhos, focinhos e explosões). */
export function pxCircle(ctx, cx, cy, r, color) {
  const rr = r * r;
  for (let y = -Math.ceil(r); y <= Math.ceil(r); y++) {
    for (let x = -Math.ceil(r); x <= Math.ceil(r); x++) {
      if (x * x + y * y <= rr) px(ctx, cx + x, cy + y, 1, 1, color);
    }
  }
}

/** Arco pontilhado — rastro de espada, garras e efeitos circulares. */
export function pxArc(ctx, cx, cy, r, a0, a1, color, thick = 1, step = 0.18) {
  const dir = a1 > a0 ? 1 : -1;
  for (let a = a0; dir > 0 ? a <= a1 : a >= a1; a += step * dir) {
    px(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, thick, thick, color);
  }
}

/** Desenha um mapa de pixels ("strings") usando a tabela CHAR_MAP. */
export function pxMap(ctx, rows, ox = 0, oy = 0, map = CHAR_MAP) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const color = map[row[x]];
      if (color) px(ctx, ox + x, oy + y, 1, 1, color);
    }
  }
}

/** Contorno escuro em volta de um bloco (deixa o sprite legível no cenário). */
export function pxOutline(ctx, x, y, w, h, color) {
  px(ctx, x - 1, y, w + 2, 1, color);
  px(ctx, x - 1, y + h, w + 2, 1, color);
  px(ctx, x - 1, y, 1, h, color);
  px(ctx, x + w, y, 1, h, color);
}
