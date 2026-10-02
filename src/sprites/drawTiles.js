// =============================================================================
// drawTiles.js — Tiles do cenário (16x16), pré-renderizados por tema.
// variant: 0 = com borda superior exposta, 1 = bloco enterrado,
//          2/3 = variações de textura (musgo, rachaduras).
// =============================================================================

import { PAL, theme } from './Palette.js';
import { px, pxTri } from './pxutil.js';

function ground(ctx, t, v) {
  px(ctx, 0, 0, 16, 16, t.tileDark);
  if (v === 0) {
    px(ctx, 0, 0, 16, 4, t.tile);          // borda superior iluminada
    px(ctx, 0, 4, 16, 1, t.accentDk);
    px(ctx, 2, 0, 3, 1, t.accent);
    px(ctx, 10, 1, 4, 1, t.accent);
  } else {
    px(ctx, 0, 0, 16, 2, t.tile);
  }
  // textura de pedra/madeira
  px(ctx, 3, 7 + (v % 2), 4, 1, t.tile);
  px(ctx, 9, 11, 5, 1, t.tile);
  px(ctx, 1, 13, 3, 1, t.tile);
  if (v === 2) px(ctx, 6, 6, 2, 4, t.near);
  if (v === 3) px(ctx, 11, 8, 2, 2, t.near);
}

function platform(ctx, t, v) {
  px(ctx, 0, 0, 16, 5, t.tile);
  px(ctx, 0, 0, 16, 1, t.accent);
  px(ctx, 0, 4, 16, 1, t.tileDark);
  px(ctx, 1, 5, 2, 3, t.tileDark);          // suportes
  px(ctx, 13, 5, 2, 3, t.tileDark);
  if (v % 2) px(ctx, 7, 1, 2, 2, t.accentDk);
}

function spikes(ctx, t) {
  for (let i = 0; i < 4; i++) {
    const x = i * 4;
    pxTri(ctx, x, 15, x + 4, 15, x + 2, 5, PAL.steel);
    pxTri(ctx, x + 1, 15, x + 3, 15, x + 2, 7, PAL.white);
  }
  px(ctx, 0, 13, 16, 3, t.tileDark);
}

function bambooDecor(ctx, t, v) {
  const x = 3 + (v % 3);
  px(ctx, x, 0, 5, 16, PAL.bambooDk);
  px(ctx, x + 1, 0, 2, 16, PAL.bamboo);
  for (let y = 2 + (v % 2) * 3; y < 16; y += 6) {
    px(ctx, x, y, 5, 1, '#2f6b3a');
  }
  px(ctx, x + 5, 3, 3, 2, PAL.bamboo);      // folha
  px(ctx, x - 2, 9, 3, 2, PAL.bamboo);
}

function stoneBlock(ctx, t, v) {
  px(ctx, 0, 0, 16, 16, t.mid);
  px(ctx, 0, 0, 16, 1, t.tile);
  px(ctx, 0, 15, 16, 1, t.near);
  px(ctx, 0, 7, 16, 1, t.near);
  px(ctx, 7, 0, 1, 7, t.near);
  px(ctx, 3, 8, 1, 7, t.near);
  px(ctx, 12, 8, 1, 7, t.near);
  if (v === 2) px(ctx, 9, 3, 3, 2, t.tile);
  if (v === 3) px(ctx, 2, 11, 4, 2, t.tileDark);
}

function cloud(ctx) {
  px(ctx, 3, 6, 10, 4, '#3b4a6b');
  px(ctx, 5, 4, 7, 3, '#44557a');
  px(ctx, 1, 8, 14, 2, '#33405e');
  px(ctx, 6, 5, 3, 1, '#5a6d99');
}

function lantern(ctx, t, v) {
  px(ctx, 7, 0, 2, 3, PAL.wood);
  px(ctx, 3, 3, 10, 10, PAL.red);
  px(ctx, 3, 3, 10, 1, PAL.redDark);
  px(ctx, 3, 12, 10, 1, PAL.redDark);
  px(ctx, 5, 5, 6, 6, v % 2 ? PAL.gold : '#ff9f43');
  px(ctx, 6, 6, 4, 4, PAL.white);
  px(ctx, 6, 13, 4, 2, PAL.gold);
}

const DRAWERS = {
  1: ground,
  2: platform,
  3: spikes,
  15: bambooDecor,
  19: stoneBlock,
  21: cloud,
  22: lantern,
};

/** Desenha um tile no contexto (16x16). */
export function tileCanvas(ctx, tileId, themeName, variant = 0) {
  const t = theme(themeName);
  const fn = DRAWERS[tileId];
  if (!fn) return;
  fn(ctx, t, variant);
}

export function hasTileArt(tileId) {
  return Boolean(DRAWERS[tileId]);
}
