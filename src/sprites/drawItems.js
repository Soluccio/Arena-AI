// =============================================================================
// drawItems.js — Coletáveis e projéteis: peixe, moeda, coração, shuriken,
// flecha, bomba, faísca, bandeira de checkpoint e raio.
// =============================================================================

import { PAL } from './Palette.js';
import { px, pxLine, pxCircle, pxTri } from './pxutil.js';

// --- Peixe (cura) — 4 frames brilhando --------------------------------------
function fish(ctx, f) {
  const y = 5 + (f % 2);
  px(ctx, 4, y, 8, 6, PAL.cyan);            // corpo
  px(ctx, 4, y, 8, 1, PAL.white);
  pxTri(ctx, 2, y + 3, 4, y, 4, y + 6, PAL.cyan); // cauda
  px(ctx, 11, y + 1, 3, 4, PAL.cyan);       // cabeça
  px(ctx, 12, y + 2, 1, 1, PAL.black);      // olho
  px(ctx, 6, y + 3, 4, 1, PAL.white);
  // brilho pulsante
  const sparkles = [[2, 2], [12, 1], [1, 11], [13, 12]];
  for (let i = 0; i < 4; i++) {
    if ((i + f) % 3 === 0) {
      const [sx, sy] = sparkles[i];
      px(ctx, sx, sy, 1, 1, PAL.white);
      px(ctx, sx - 1, sy, 1, 1, PAL.cyan);
      px(ctx, sx + 1, sy, 1, 1, PAL.cyan);
    }
  }
}

// --- Moeda — 4 frames girando ------------------------------------------------
function coin(ctx, f) {
  const widths = [10, 6, 2, 6];
  const w = widths[f % 4];
  const x = 6 - w / 2;
  px(ctx, x, 1, w, 10, PAL.gold);
  px(ctx, x, 1, w, 1, '#ffe89a');
  px(ctx, x, 10, w, 1, '#c9971f');
  if (w > 4) {
    px(ctx, 6 - 1, 4, 2, 4, '#c9971f');     // emblema
    px(ctx, 6 - 2, 5, 4, 2, '#c9971f');
  }
}

// --- Coração — 2 frames pulsando ---------------------------------------------
function heart(ctx, f) {
  const g = f % 2;
  const y = 2 - g;
  px(ctx, 2, y + 1, 3, 3, PAL.red);
  px(ctx, 7, y + 1, 3, 3, PAL.red);
  px(ctx, 2, y + 3, 8, 3, PAL.red);
  px(ctx, 3, y + 6, 6, 1, PAL.red);
  px(ctx, 5, y + 7, 2, 1, PAL.red);
  px(ctx, 3, y + 2, 2, 1, PAL.pink);        // brilho
  px(ctx, 2, y, 3, 1, PAL.redDark);
  px(ctx, 7, y, 3, 1, PAL.redDark);
}

// --- Shuriken — 4 frames girando ---------------------------------------------
function shuriken(ctx, f) {
  const cx = 5;
  const cy = 5;
  const rot = (f % 4) * (Math.PI / 4);
  for (let i = 0; i < 4; i++) {
    const a = rot + i * (Math.PI / 2);
    pxLine(ctx, cx, cy, cx + Math.cos(a) * 4.4, cy + Math.sin(a) * 4.4, PAL.steel, 2);
    px(ctx, cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, 2, 2, PAL.steelDk);
  }
  pxCircle(ctx, cx, cy, 1.6, PAL.steelDk);
  px(ctx, cx, cy, 1, 1, PAL.black);
}

// --- Flecha ------------------------------------------------------------------
function arrow(ctx) {
  px(ctx, 2, 3, 9, 2, PAL.wood);
  pxTri(ctx, 11, 1, 14, 4, 11, 7, PAL.steel);
  px(ctx, 1, 2, 1, 2, PAL.white);
  px(ctx, 2, 1, 1, 2, PAL.white);
  px(ctx, 1, 5, 1, 2, PAL.white);
  px(ctx, 2, 5, 1, 2, PAL.white);
}

// --- Bomba — 4 frames (pavio queimando) --------------------------------------
function bomb(ctx, f) {
  pxCircle(ctx, 5, 6, 3.6, PAL.black);
  px(ctx, 3, 4, 2, 2, '#4a4a5a');
  px(ctx, 5, 1, 1, 3, PAL.wood);
  const flicker = f % 4;
  px(ctx, 5, 0, 1, 1, PAL.bolt);
  if (flicker % 2 === 0) {
    px(ctx, 4, 0, 1, 1, PAL.red);
    px(ctx, 6, 1, 1, 1, PAL.gold);
  }
}

// --- Faísca / explosão — 4 frames --------------------------------------------
function spark(ctx, f) {
  const cx = 6;
  const cy = 6;
  const r = 2 + f * 1.6;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + f * 0.4;
    const color = f < 2 ? PAL.white : f === 2 ? PAL.bolt : PAL.red;
    px(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 2, color);
  }
  if (f < 2) pxCircle(ctx, cx, cy, 2.4 - f, PAL.white);
}

// --- Bandeira de checkpoint — 2 frames ---------------------------------------
function flag(ctx, f) {
  px(ctx, 3, 2, 2, 22, PAL.wood);           // mastro
  px(ctx, 2, 23, 4, 1, PAL.stoneDk);
  px(ctx, 3, 0, 2, 2, PAL.gold);
  const wave = f % 2;
  for (let i = 0; i < 9; i++) {
    const y = 3 + i;
    const off = Math.sin(i * 0.6 + wave * 1.6) * 1.4;
    px(ctx, 5 + off, y, 9 - Math.abs(off), 1, PAL.red);
  }
  px(ctx, 8, 6, 3, 3, PAL.gold);            // símbolo
}

// --- Raio — 2 frames ---------------------------------------------------------
function bolt(ctx, f) {
  const jitter = f % 2;
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    pts.push([8 + Math.sin(i * 1.7 + jitter) * (4 - i * 0.2), i * 6]);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    pxLine(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], PAL.bolt, 2);
  }
  for (let i = 0; i < pts.length - 1; i += 2) {
    pxLine(ctx, pts[i][0] - 1, pts[i][1], pts[i + 1][0] - 1, pts[i + 1][1], PAL.white, 1);
  }
}

const DRAW = { fish, coin, heart, shuriken, arrow, bomb, spark, flag, bolt };

/** Ponto de entrada usado pelo SpriteFactory. */
export function drawItemFrame(ctx, kind, frame) {
  const fn = DRAW[kind] || fish;
  fn(ctx, frame);
}
