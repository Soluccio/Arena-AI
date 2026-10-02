// =============================================================================
// SpriteFactory.js — Fábrica e cache de sprites pré-renderizados.
// Nenhum sprite é desenhado pixel a pixel em tempo real: tudo vira um canvas
// em memória UMA vez (preload) e depois só entra drawImage.
// =============================================================================

import { ANIM, animNames, animDef } from '../data/animations.js';
import { drawCatFrame } from './drawCat.js';
import { drawDogFrame, drawArcherFrame } from './drawEnemies.js';
import { drawRatFrame, drawBomberFrame, drawFrogFrame } from './drawCritters.js';
import { drawMiniFrame, drawPoodleFrame } from './drawBoss.js';
import { drawItemFrame } from './drawItems.js';
import { tileCanvas } from './drawTiles.js';

/** Resolução base de cada família de sprites (nunca acima de 48x48). */
export const SPRITE_SIZES = {
  cat:      [24, 24],
  dog:      [24, 24],
  archer:   [24, 24],
  rat:      [16, 16],
  bomber:   [16, 16],
  frog:     [16, 16],
  mini:     [40, 40],
  poodle:   [48, 48],
  fish:     [16, 16],
  coin:     [12, 12],
  heart:    [12, 12],
  shuriken: [10, 10],
  arrow:    [14, 8],
  bomb:     [10, 10],
  spark:    [12, 12],
  flag:     [16, 24],
  bolt:     [16, 48],
};

/** Despacha para a função de desenho de cada família. */
const DRAWERS = {
  cat: (ctx, anim, f) => drawCatFrame(ctx, anim, f),
  dog: (ctx, anim, f) => drawDogFrame(ctx, anim, f),
  archer: (ctx, anim, f) => drawArcherFrame(ctx, anim, f),
  rat: (ctx, anim, f) => drawRatFrame(ctx, anim, f),
  bomber: (ctx, anim, f) => drawBomberFrame(ctx, anim, f),
  frog: (ctx, anim, f) => drawFrogFrame(ctx, anim, f),
  mini: (ctx, anim, f) => drawMiniFrame(ctx, anim, f),
  poodle: (ctx, anim, f) => drawPoodleFrame(ctx, anim, f),
  fish: (ctx, anim, f) => drawItemFrame(ctx, 'fish', f),
  coin: (ctx, anim, f) => drawItemFrame(ctx, 'coin', f),
  heart: (ctx, anim, f) => drawItemFrame(ctx, 'heart', f),
  shuriken: (ctx, anim, f) => drawItemFrame(ctx, 'shuriken', f),
  arrow: (ctx, anim, f) => drawItemFrame(ctx, 'arrow', f),
  bomb: (ctx, anim, f) => drawItemFrame(ctx, 'bomb', f),
  spark: (ctx, anim, f) => drawItemFrame(ctx, 'spark', f),
  flag: (ctx, anim, f) => drawItemFrame(ctx, 'flag', f),
  bolt: (ctx, anim, f) => drawItemFrame(ctx, 'bolt', f),
};

const cache = new Map();

/** Cria um canvas offscreen com smoothing desligado (pixel art nítido). */
export function makeCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

export function sizeOf(kind) {
  return SPRITE_SIZES[kind] || [16, 16];
}

/**
 * Devolve o canvas de um frame específico (criando e cacheando se preciso).
 * Uso: get('cat', 'run', 3)
 */
export function get(kind, anim = 'idle', frame = 0) {
  const key = `${kind}.${anim}.${frame}`;
  let canvas = cache.get(key);
  if (canvas) return canvas;

  const [w, h] = sizeOf(kind);
  const made = makeCanvas(w, h);
  const draw = DRAWERS[kind];
  if (draw) draw(made.ctx, anim, frame);
  canvas = made.canvas;
  cache.set(key, canvas);
  return canvas;
}

/** Devolve o canvas de um tile do tema (também cacheado). */
export function getTile(tileId, themeName, variant = 0) {
  const key = `tile.${themeName}.${tileId}.${variant}`;
  let canvas = cache.get(key);
  if (canvas) return canvas;
  const made = makeCanvas(16, 16);
  tileCanvas(made.ctx, tileId, themeName, variant);
  canvas = made.canvas;
  cache.set(key, canvas);
  return canvas;
}

/** Gera de uma vez todos os frames de todas as animações (chamado no boot). */
export function preload() {
  for (const kind of Object.keys(ANIM)) {
    if (!DRAWERS[kind]) continue;
    for (const anim of animNames(kind)) {
      const { frames } = animDef(kind, anim);
      for (let f = 0; f < frames; f++) get(kind, anim, f);
    }
  }
  return cache.size;
}

/** Limpa o cache (útil em testes / hot reload). */
export function clearCache() {
  cache.clear();
}

export function cacheSize() {
  return cache.size;
}
