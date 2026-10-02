// =============================================================================
// builder.js — Mini-DSL para montar o tilemap em strings de forma segura
// (todas as linhas com o mesmo comprimento). Usa a mesma legenda do TileMap.
// =============================================================================

export function create(w, h) {
  return Array.from({ length: h }, () => Array(w).fill('.'));
}

export function set(b, x, y, c) {
  if (y >= 0 && y < b.length && x >= 0 && x < b[0].length) b[y][x] = c;
}

export function hline(b, x0, x1, y, c) {
  for (let x = x0; x <= x1; x++) set(b, x, y, c);
}

export function vline(b, x, y0, y1, c) {
  for (let y = y0; y <= y1; y++) set(b, x, y, c);
}

export function rect(b, x0, y0, x1, y1, c) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(b, x, y, c);
}

/** Chão sólido de `y` até o fim do mapa. */
export function floor(b, x0, x1, y) {
  rect(b, x0, y, x1, b.length - 1, '#');
}

export function spikes(b, x0, x1, y) {
  hline(b, x0, x1, y, '^');
}

export function plat(b, x0, x1, y) {
  hline(b, x0, x1, y, '=');
}

/** Arco de moedas (quicando). */
export function coinArc(b, x, y, n = 3) {
  for (let i = 0; i < n; i++) set(b, x + i, y - (i === 1 ? 1 : 0), 'o');
}

export function toRows(b) {
  return b.map((r) => r.join(''));
}
