// =============================================================================
// drawBoss.js — Mini-boss (rato gigante mecânico, 40x40) e o Shogun Poodle
// (48x48, o limite máximo de resolução base do projeto).
// =============================================================================

import { PAL } from './Palette.js';
import { px, pxLine, pxCircle, pxTri, pxArc } from './pxutil.js';

// =============================================================================
// MINI-BOSS — rato gigante mecânico
// =============================================================================
const MINI = {
  idle: [0, 1, 2, 1],
  charge: [0, 1],
  shoot: [0, 1],
  stagger: [0, 1],
};

function miniBody(ctx, frame, mode) {
  const bob = frame % 2;
  const hurt = mode === 'stagger';
  const lean = mode === 'charge' ? 2 : 0;

  // esteiras / rodinhas
  for (let i = 0; i < 5; i++) {
    px(ctx, 4 + i * 7, 33, 6, 5, PAL.storm);
    px(ctx, 5 + i * 7 + ((frame + i) % 2), 34, 3, 3, PAL.ratLight);
  }
  px(ctx, 3, 32, 34, 2, PAL.steelDk);

  // chassi
  px(ctx, 5 + lean, 16 + bob, 30, 17, PAL.rat);
  px(ctx, 5 + lean, 16 + bob, 30, 2, PAL.ratLight);
  px(ctx, 8 + lean, 24 + bob, 10, 6, PAL.storm);       // painel
  px(ctx, 9 + lean, 25 + bob, 2, 2, PAL.bolt);         // luzes
  px(ctx, 12 + lean, 25 + bob, 2, 2, hurt ? PAL.red : PAL.cyan);
  px(ctx, 15 + lean, 25 + bob, 2, 2, PAL.red);

  // cabeça metálica
  const hx = 24 + lean;
  px(ctx, hx, 8 + bob, 14, 12, PAL.ratLight);
  px(ctx, hx, 8 + bob, 14, 2, PAL.steel);
  px(ctx, hx + 10, 13 + bob, 6, 5, PAL.steel);         // focinho
  px(ctx, hx + 15, 14 + bob, 2, 2, PAL.red);           // nariz
  // orelhas de metal
  pxCircle(ctx, hx + 3, 7 + bob, 3, PAL.steelDk);
  pxCircle(ctx, hx + 3, 7 + bob, 1.5, PAL.storm);
  pxCircle(ctx, hx + 10, 6 + bob, 3, PAL.steelDk);

  // olho ciclópeo
  if (hurt) {
    px(ctx, hx + 5, 12 + bob, 4, 1, PAL.red);
    px(ctx, hx + 5, 14 + bob, 4, 1, PAL.red);
  } else {
    pxCircle(ctx, hx + 6, 13 + bob, 3, mode === 'charge' ? PAL.red : PAL.bolt);
    px(ctx, hx + 6, 13 + bob, 1, 1, PAL.white);
  }

  // canhão no ombro (padrão de tiro)
  px(ctx, 6 + lean, 10 + bob, 8, 6, PAL.steelDk);
  px(ctx, 12 + lean, 11 + bob, 5, 4, PAL.storm);
  if (mode === 'shoot' && frame % 2 === 1) {
    pxCircle(ctx, 19 + lean, 13 + bob, 2.5, PAL.bolt);
  }

  // parafusos
  px(ctx, 7 + lean, 18 + bob, 1, 1, PAL.steel);
  px(ctx, 32 + lean, 18 + bob, 1, 1, PAL.steel);
  px(ctx, 7 + lean, 30 + bob, 1, 1, PAL.steel);
}

export function drawMiniFrame(ctx, anim, frame) {
  const list = MINI[anim] || MINI.idle;
  miniBody(ctx, list[frame % list.length], anim);
}

// =============================================================================
// BOSS — Shogun Poodle (48x48)
// =============================================================================
function pom(ctx, cx, cy, r, color, dark) {
  pxCircle(ctx, cx, cy, r, color);
  pxCircle(ctx, cx - 1, cy - 1, r * 0.5, dark);
}

function poodleBase(ctx, o) {
  const by = 22 + o.bob;
  // pernas com pompons
  px(ctx, 14 + o.legB, 36, 5, 9, PAL.white);
  px(ctx, 26 + o.legF, 36, 5, 9, PAL.white);
  pom(ctx, 16 + o.legB, 43, 3, PAL.white, PAL.stone);
  pom(ctx, 28 + o.legF, 43, 3, PAL.white, PAL.stone);
  // cauda pompom
  px(ctx, 9, by + 4, 4, 3, PAL.white);
  pom(ctx, 8, by + 2 + o.tailWag, 3.4, PAL.white, PAL.stone);

  // corpo
  px(ctx, 11, by, 22, 16, PAL.white);
  px(ctx, 11, by, 22, 2, PAL.stone);
  pom(ctx, 14, by + 12, 4, PAL.white, PAL.stone);
  pom(ctx, 30, by + 12, 4, PAL.white, PAL.stone);

  // armadura samurai (dou) vermelha e dourada
  px(ctx, 12, by + 2, 20, 8, PAL.red);
  px(ctx, 12, by + 2, 20, 1, PAL.gold);
  px(ctx, 12, by + 9, 20, 1, PAL.gold);
  for (let i = 0; i < 5; i++) px(ctx, 14 + i * 4, by + 4, 2, 4, PAL.redDark);
  px(ctx, 20, by + 4, 4, 4, PAL.gold);                 // mon (emblema)

  // pescoço e cabeça
  px(ctx, 28, by - 6, 8, 8, PAL.white);
  const hx = 30;
  const hy = by - 18;
  px(ctx, hx, hy, 14, 12, PAL.white);
  px(ctx, hx + 10, hy + 6, 6, 5, PAL.stone);           // focinho
  px(ctx, hx + 15, hy + 7, 2, 2, PAL.black);           // nariz
  // olhos
  if (o.eyes === 'dizzy') {
    px(ctx, hx + 4, hy + 4, 1, 1, PAL.black);
    px(ctx, hx + 6, hy + 6, 1, 1, PAL.black);
    px(ctx, hx + 6, hy + 4, 1, 1, PAL.black);
    px(ctx, hx + 4, hy + 6, 1, 1, PAL.black);
    px(ctx, hx + 10, hy + 4, 1, 1, PAL.black);
    px(ctx, hx + 12, hy + 6, 1, 1, PAL.black);
  } else {
    px(ctx, hx + 3, hy + 4, 3, 3, PAL.eye);
    px(ctx, hx + 4, hy + 5, 2, 2, PAL.black);
    px(ctx, hx + 9, hy + 4, 3, 3, PAL.eye);
    px(ctx, hx + 10, hy + 5, 2, 2, PAL.black);
  }
  // topete pompom + orelhas
  pom(ctx, hx + 6, hy - 3, 4, PAL.white, PAL.stone);
  pom(ctx, hx + 1, hy + 2, 3.2, PAL.white, PAL.stone);

  // kabuto gigante com crescente
  px(ctx, hx - 2, hy - 6, 18, 3, PAL.redDark);
  px(ctx, hx, hy - 8, 14, 2, PAL.red);
  px(ctx, hx - 3, hy - 3, 3, 6, PAL.redDark);
  pxTri(ctx, hx + 2, hy - 14, hx + 12, hy - 14, hx + 7, hy - 7, PAL.gold);
  px(ctx, hx + 6, hy - 15, 2, 2, PAL.bolt);
}

/** Katana gigante do shogun. */
function bigSword(ctx, o) {
  if (o.spin >= 0) {
    const a = o.spin * (Math.PI / 2) - 0.6;
    const cx = 24;
    const cy = 26;
    pxLine(ctx, cx, cy, cx + Math.cos(a) * 20, cy + Math.sin(a) * 20, PAL.steel, 3);
    pxArc(ctx, cx, cy, 20, a - 0.7, a + 0.2, PAL.white, 2);
    return;
  }
  const s = o.sword;
  if (s === 'raise') {
    pxLine(ctx, 38, 20, 46, 2, PAL.steel, 3);
    pxLine(ctx, 36, 22, 38, 24, PAL.wood, 3);
    px(ctx, 35, 19, 4, 2, PAL.gold);
    return;
  }
  if (s === 'slash1' || s === 'slash2') {
    const y = s === 'slash1' ? 16 : 26;
    pxLine(ctx, 34, y, 47, y + 6, PAL.steel, 3);
    pxLine(ctx, 32, y - 2, 34, y, PAL.wood, 3);
    pxArc(ctx, 32, y - 2, 15, -1.0, 0.9, PAL.white, 2);
    if (s === 'slash2') pxArc(ctx, 32, y - 2, 11, -0.8, 0.7, PAL.bolt, 1);
    return;
  }
  // apoiada no ombro
  pxLine(ctx, 40, 26, 46, 12, PAL.steel, 3);
  pxLine(ctx, 38, 30, 40, 26, PAL.wood, 3);
  px(ctx, 37, 25, 4, 2, PAL.gold);
}

const POODLE = {
  idle: [
    { bob: 0, tailWag: 0, sword: 'rest', eyes: 'open', spin: -1 },
    { bob: 1, tailWag: 1, sword: 'rest', eyes: 'open', spin: -1 },
    { bob: 2, tailWag: 0, sword: 'rest', eyes: 'open', spin: -1 },
    { bob: 1, tailWag: -1, sword: 'rest', eyes: 'open', spin: -1 },
  ],
  // wind-up -> ergue -> corte 1 -> corte 2
  attack: [
    { bob: 2, tailWag: 0, sword: 'rest', eyes: 'open', spin: -1, legF: -2, legB: 2 },
    { bob: 0, tailWag: 0, sword: 'raise', eyes: 'open', spin: -1 },
    { bob: 1, tailWag: 0, sword: 'slash1', eyes: 'open', spin: -1, legF: 3 },
    { bob: 2, tailWag: 0, sword: 'slash2', eyes: 'open', spin: -1, legF: 4, legB: -2 },
  ],
  stagger: [
    { bob: 2, tailWag: 0, sword: 'rest', eyes: 'dizzy', spin: -1, legF: -3, legB: 3 },
    { bob: 3, tailWag: 1, sword: 'rest', eyes: 'dizzy', spin: -1, legF: -2, legB: 2 },
  ],
  spin: [
    { bob: 1, tailWag: 0, sword: 'spin', eyes: 'open', spin: 0 },
    { bob: 1, tailWag: 0, sword: 'spin', eyes: 'open', spin: 1 },
    { bob: 1, tailWag: 0, sword: 'spin', eyes: 'open', spin: 2 },
    { bob: 1, tailWag: 0, sword: 'spin', eyes: 'open', spin: 3 },
  ],
};

export function drawPoodleFrame(ctx, anim, frame) {
  const list = POODLE[anim] || POODLE.idle;
  const o = { legF: 0, legB: 0, ...list[frame % list.length] };
  if (o.spin >= 0) {
    // giro: bola de pelo girando com a espada em volta
    pom(ctx, 24, 28, 13, PAL.white, PAL.stone);
    px(ctx, 18, 22, 12, 4, PAL.red);
    px(ctx, 20, 20, 3, 3, PAL.eye);
    px(ctx, 27, 20, 3, 3, PAL.eye);
    pxArc(ctx, 24, 28, 17, 0, Math.PI * 2, PAL.white, 1);
    bigSword(ctx, o);
    return;
  }
  poodleBase(ctx, o);
  bigSword(ctx, o);
}
