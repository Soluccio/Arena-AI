// =============================================================================
// drawCritters.js — Rato ninja, Rato bombardeiro e Sapo saltitante (16x16).
// =============================================================================

import { PAL } from './Palette.js';
import { px, pxLine, pxCircle } from './pxutil.js';

const D = { bob: 0, tail: 0, legF: 0, legB: 0, eyes: 'open', arm: 0, crouch: 0, bomb: false };
const P = (o) => ({ ...D, ...o });

const RAT_POSES = {
  idle: [P({}), P({ bob: 1, tail: 1.2 })],
  run: [
    P({ legF: 2, legB: -2, tail: 0.3 }),
    P({ legF: 0, legB: 0, tail: 1.3 }),
    P({ legF: -2, legB: 2, tail: 2.3 }),
    P({ legF: 0, legB: 0, tail: 3.3 }),
  ],
  throw: [P({ arm: 1 }), P({ arm: 2 })],
  hurt: [P({ eyes: 'x' })],
};

const BOMBER_POSES = {
  idle: [P({ bomb: true }), P({ bomb: true, bob: 1, tail: 1.2 })],
  run: [
    P({ bomb: true, legF: 2, legB: -2, tail: 0.3 }),
    P({ bomb: true, legF: 0, legB: 0, tail: 1.3 }),
    P({ bomb: true, legF: -2, legB: 2, tail: 2.3 }),
    P({ bomb: true, legF: 0, legB: 0, tail: 3.3 }),
  ],
  throw: [P({ bomb: true, arm: 1 }), P({ bomb: true, arm: 2 })],
  hurt: [P({ bomb: true, eyes: 'x' })],
};

const FROG_POSES = {
  idle: [P({ crouch: 1 }), P({ crouch: 0 })],
  jump: [P({ crouch: 2 }), P({ crouch: -1 })],
  hurt: [P({ eyes: 'x' })],
};

/** Corpo base do rato (preto azulado, faixa ninja vermelha). */
function ratBody(ctx, o) {
  const by = 7 + o.bob;
  // cauda longa
  for (let i = 0; i < 5; i++) {
    px(ctx, 3 - i, 11 + Math.sin(o.tail + i * 0.7) * 1.6, 1, 1, PAL.ratLight);
  }
  // patas
  px(ctx, 5 + o.legB, 12, 2, 3 - Math.max(0, -o.legB), PAL.rat);
  px(ctx, 9 + o.legF, 12, 2, 3 - Math.max(0, -o.legF), PAL.rat);
  px(ctx, 5 + o.legB, 14, 3, 1, PAL.ratLight);
  px(ctx, 9 + o.legF, 14, 3, 1, PAL.ratLight);
  // torso
  px(ctx, 4, by + 1, 8, 5, PAL.rat);
  px(ctx, 4, by + 1, 8, 1, PAL.ratLight);
  // cabeça pontuda
  px(ctx, 10, by, 4, 5, PAL.rat);
  px(ctx, 13, by + 2, 2, 2, PAL.ratLight);
  px(ctx, 14, by + 3, 1, 1, PAL.pink);
  // orelha
  pxCircle(ctx, 11, by, 1.6, PAL.ratLight);
  px(ctx, 11, by, 1, 1, PAL.pink);
  // olho
  if (o.eyes === 'x') {
    px(ctx, 12, by + 1, 1, 1, PAL.black);
    px(ctx, 13, by + 2, 1, 1, PAL.black);
    px(ctx, 12, by + 2, 1, 1, PAL.black);
  } else {
    px(ctx, 12, by + 1, 2, 2, PAL.eye);
    px(ctx, 13, by + 1, 1, 1, PAL.black);
  }
  // faixa ninja vermelha
  px(ctx, 10, by + 1, 4, 1, PAL.red);
  px(ctx, 8, by + 1, 2, 1, PAL.redDark);
  // braço que arremessa
  if (o.arm) {
    pxLine(ctx, 11, by + 2, 11 + o.arm * 2, by + 1 - o.arm, PAL.ratLight, 1);
  }
}

export function drawRatFrame(ctx, anim, frame) {
  const list = RAT_POSES[anim] || RAT_POSES.idle;
  const o = list[frame % list.length];
  ratBody(ctx, o);
  if (o.arm === 1) px(ctx, 14, 5, 3, 3, PAL.steel); // shuriken na mão
}

export function drawBomberFrame(ctx, anim, frame) {
  const list = BOMBER_POSES[anim] || BOMBER_POSES.idle;
  const o = list[frame % list.length];
  ratBody(ctx, o);
  // mochila de bombas
  px(ctx, 2, 6 + o.bob, 4, 5, PAL.dogDark);
  px(ctx, 3, 7 + o.bob, 2, 2, PAL.storm);
  px(ctx, 3, 5 + o.bob, 1, 2, PAL.bolt);
  if (o.arm === 1) {
    pxCircle(ctx, 13, 6, 2, PAL.black);
    px(ctx, 13, 3, 1, 2, PAL.wood);
    px(ctx, 14, 2, 1, 1, PAL.bolt);
  }
}

export function drawFrogFrame(ctx, anim, frame) {
  const list = FROG_POSES[anim] || FROG_POSES.idle;
  const o = list[frame % list.length];
  const c = o.crouch;
  const by = 6 + Math.max(0, c);
  // pernas traseiras dobradas
  px(ctx, 2, by + 4, 3, 5 - Math.max(0, c), PAL.bambooDk);
  px(ctx, 2, 14, 4, 1, PAL.bambooDk);
  // corpo
  px(ctx, 4, by, 8, 9 - Math.max(0, c), PAL.bamboo);
  px(ctx, 4, by, 8, 1, PAL.bambooDk);
  px(ctx, 6, by + 5, 5, 3 - Math.max(0, c), '#c8e6c9');
  // cabeça / olhos esbugalhados
  px(ctx, 9, by - 1, 5, 4, PAL.bamboo);
  pxCircle(ctx, 10, by - 1, 1.6, PAL.eye);
  pxCircle(ctx, 13, by - 1, 1.6, PAL.eye);
  if (o.eyes === 'x') {
    px(ctx, 10, by - 2, 1, 1, PAL.black);
    px(ctx, 13, by - 2, 1, 1, PAL.black);
  } else {
    px(ctx, 10, by - 1, 1, 1, PAL.black);
    px(ctx, 13, by - 1, 1, 1, PAL.black);
  }
  px(ctx, 12, by + 2, 2, 1, PAL.bambooDk);       // boca
  // perna dianteira
  px(ctx, 10 + (c < 0 ? 2 : 0), 13, 3, 2, PAL.bambooDk);
}
