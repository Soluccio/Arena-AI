// =============================================================================
// drawEnemies.js — Cão samurai e Cão arqueiro (24x24).
// Os dois compartilham o mesmo corpo canino; muda equipamento e pose.
// =============================================================================

import { PAL } from './Palette.js';
import { px, pxLine, pxTri, pxArc } from './pxutil.js';

const D = {
  bob: 0, tail: 0, legF: [0, 0], legB: [0, 0],
  eyes: 'open', sword: 'idle', bow: false, draw: 0, hurt: 0,
};
const P = (o) => ({ ...D, ...o });

const DOG_POSES = {
  idle: [P({}), P({ bob: 1, tail: 1.1 })],
  walk: [
    P({ legF: [2, -2], legB: [-2, 0], tail: 0.4 }),
    P({ legF: [0, -1], legB: [0, -1], tail: 1.4 }),
    P({ legF: [-2, 0], legB: [2, -2], tail: 2.4 }),
    P({ legF: [0, -1], legB: [0, -1], tail: 3.4 }),
  ],
  // ataque: ergue a espada (telegrafo) e corta
  attack: [P({ sword: 'raise', bob: 1 }), P({ sword: 'slash' })],
  hurt: [P({ eyes: 'x', hurt: 1 })],
};

const ARCHER_POSES = {
  idle: [P({ bow: true }), P({ bow: true, bob: 1, tail: 1.1 })],
  walk: [
    P({ bow: true, legF: [2, -2], legB: [-2, 0], tail: 0.4 }),
    P({ bow: true, legF: [0, -1], legB: [0, -1], tail: 1.4 }),
    P({ bow: true, legF: [-2, 0], legB: [2, -2], tail: 2.4 }),
    P({ bow: true, legF: [0, -1], legB: [0, -1], tail: 3.4 }),
  ],
  // atira: puxa a corda e solta
  shoot: [P({ bow: true, draw: 1 }), P({ bow: true, draw: 0, sword: 'flash' })],
  hurt: [P({ bow: true, eyes: 'x', hurt: 1 })],
};

/** Corpo canino compartilhado. */
function canine(ctx, o) {
  const by = 10 + o.bob - o.hurt;
  const lean = o.hurt ? -2 : 0;

  // cauda
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    px(ctx, 4 - i, 12 - i * 1.5 + Math.sin(o.tail + t * 2) * 1.5, 2, 2, i % 2 ? PAL.dog : PAL.dogDark);
  }

  // patas traseiras
  px(ctx, 6 + o.legB[0], 16 + o.bob + Math.max(0, o.legB[1]), 3, 6 - Math.max(0, o.legB[1]), PAL.dogDark);
  px(ctx, 14 + o.legF[0], 16 + o.bob + Math.max(0, o.legF[1]), 3, 6 - Math.max(0, o.legF[1]), PAL.dog);
  px(ctx, 6 + o.legB[0], 21, 4, 2, PAL.dogDark);
  px(ctx, 14 + o.legF[0], 21, 4, 2, PAL.dog);

  // torso
  px(ctx, 5 + lean, by, 12, 7, PAL.dog);
  px(ctx, 5 + lean, by, 12, 1, PAL.dogDark);
  px(ctx, 8 + lean, by + 4, 7, 3, '#a1887f');

  // cabeça
  const hx = 13 + lean;
  px(ctx, hx, by - 6, 8, 7, PAL.dog);
  px(ctx, hx + 6, by - 3, 4, 3, '#a1887f');        // focinho
  px(ctx, hx + 9, by - 3, 1, 1, PAL.black);        // nariz
  px(ctx, hx + 1, by - 8, 3, 3, PAL.dogDark);      // orelha caída
  px(ctx, hx + 1, by - 7, 1, 2, PAL.pink);

  // olho
  if (o.eyes === 'x') {
    px(ctx, hx + 4, by - 4, 1, 1, PAL.black);
    px(ctx, hx + 6, by - 4, 1, 1, PAL.black);
    px(ctx, hx + 5, by - 3, 1, 1, PAL.black);
    px(ctx, hx + 4, by - 2, 1, 1, PAL.black);
    px(ctx, hx + 6, by - 2, 1, 1, PAL.black);
  } else {
    px(ctx, hx + 4, by - 4, 2, 2, PAL.white);
    px(ctx, hx + 5, by - 4, 1, 2, PAL.black);
  }

  // kabuto (capacete samurai) com crista dourada
  px(ctx, hx - 1, by - 9, 10, 2, PAL.redDark);
  px(ctx, hx, by - 10, 8, 1, PAL.red);
  pxTri(ctx, hx + 3, by - 13, hx + 6, by - 13, hx + 4.5, by - 9, PAL.gold);
  px(ctx, hx - 2, by - 7, 2, 3, PAL.redDark);      // aba lateral

  // coleira
  px(ctx, hx - 1, by - 1, 9, 2, PAL.red);
  px(ctx, hx + 3, by, 2, 1, PAL.gold);
}

/** Katana do cão samurai. */
function katana(ctx, o) {
  if (o.sword === 'raise') {
    pxLine(ctx, 20, 11, 22, 1, PAL.steel, 2);
    pxLine(ctx, 19, 12, 20, 14, PAL.wood, 2);
    px(ctx, 18, 11, 3, 1, PAL.gold);
    return;
  }
  if (o.sword === 'slash') {
    pxLine(ctx, 18, 8, 23, 16, PAL.steel, 2);
    pxLine(ctx, 17, 9, 22, 17, PAL.steelDk, 1);
    pxLine(ctx, 16, 6, 18, 8, PAL.wood, 2);
    pxArc(ctx, 16, 8, 7, -1.1, 0.9, PAL.white, 2);
    return;
  }
  // guarda: espada apoiada no ombro
  pxLine(ctx, 19, 17, 23, 12, PAL.steel, 2);
  pxLine(ctx, 18, 18, 19, 19, PAL.wood, 2);
  if (o.sword === 'flash') pxArc(ctx, 20, 12, 5, -1.2, 0.6, PAL.white, 1);
}

/** Arco do arqueiro (com corda puxada no frame de tiro). */
function bow(ctx, o) {
  const pull = o.draw ? 3 : 0;
  pxLine(ctx, 20, 4, 22, 10, PAL.wood, 2);
  pxLine(ctx, 22, 10, 20, 16, PAL.wood, 2);
  pxLine(ctx, 20, 4, 20 - pull, 10, PAL.band, 1);
  pxLine(ctx, 20 - pull, 10, 20, 16, PAL.band, 1);
  if (o.draw) {
    pxLine(ctx, 14, 10, 22, 10, PAL.wood, 1);
    px(ctx, 21, 9, 2, 2, PAL.steel);
  }
}

export function drawDogFrame(ctx, anim, frame) {
  const list = DOG_POSES[anim] || DOG_POSES.idle;
  const o = list[frame % list.length];
  canine(ctx, o);
  katana(ctx, o);
}

export function drawArcherFrame(ctx, anim, frame) {
  const list = ARCHER_POSES[anim] || ARCHER_POSES.idle;
  const o = list[frame % list.length];
  canine(ctx, o);
  bow(ctx, o);
  // aljava nas costas
  px(ctx, 4, 8 + o.bob, 4, 6, PAL.wood);
  px(ctx, 5, 6 + o.bob, 1, 3, PAL.steel);
  px(ctx, 7, 7 + o.bob, 1, 3, PAL.steel);
}
