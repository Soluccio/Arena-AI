// =============================================================================
// drawCat.js — Sprites do Belisco (gato ninja), canvas base 24x24.
// Todas as 8 animações saem de UM único desenhador paramétrico: cada frame é
// só um conjunto de offsets (patas, cauda, orelhas, squash). Isso garante
// consistência visual e código curto.
// =============================================================================

import { PAL } from './Palette.js';
import { px, pxLine, pxArc } from './pxutil.js';

// -----------------------------------------------------------------------------
// Poses: cada entrada descreve UM frame. Os campos ausentes vêm de DEFAULTS.
// -----------------------------------------------------------------------------
const DEFAULTS = {
  bob: 0,          // deslocamento vertical do corpo (respiração)
  headDrop: 0,     // cabeça mais alta/baixa
  tail: 0,         // fase da cauda (radianos)
  ear: 0,          // twitch da orelha (-1 = pra trás)
  legF: [0, 0],    // pata dianteira [dx, dy] (dy negativo = levantada)
  legB: [0, 0],    // pata traseira
  lean: 0,         // inclinação do corpo pra frente
  crouch: 0,       // agachamento (reduz altura)
  stretch: 0,      // 1 = alongado vertical, 2 = esticado horizontal (dash)
  eyes: 'open',    // open | blink | shut | x
  sword: 'back',   // back | up | mid | down
  trail: 0,        // intensidade do rastro branco da espada
  speedLines: 0,   // linhas de velocidade do dash
  pawUp: 0,        // patas dianteiras erguidas
  flat: 0,         // deitado (morte)
  wisp: 0,         // alminha subindo (morte)
};

const P = (o) => ({ ...DEFAULTS, ...o });

const POSES = {
  // idle: 4 frames — respiração + cauda balançando + orelha twitching
  idle: [
    P({ tail: 0.0 }),
    P({ bob: 1, tail: 1.4 }),
    P({ bob: 1, tail: 2.8, ear: 1 }),
    P({ tail: 4.2, eyes: 'blink' }),
  ],
  // run: 6 frames — patas alternando e corpo inclinado pra frente
  run: [
    P({ legF: [2, -2], legB: [-2, 0], bob: 1, lean: 1, tail: 0.4 }),
    P({ legF: [1, -1], legB: [-1, -1], lean: 1, tail: 1.4 }),
    P({ legF: [-1, -2], legB: [1, -2], lean: 1, tail: 2.4 }),
    P({ legF: [-2, 0], legB: [2, -2], bob: 1, lean: 1, tail: 3.4 }),
    P({ legF: [-1, -1], legB: [1, -1], lean: 1, tail: 4.4 }),
    P({ legF: [1, -2], legB: [-1, -2], lean: 1, tail: 5.4 }),
  ],
  // jump: 2 frames — subida (esticado) e descida (patas abertas)
  jump: [
    P({ stretch: 1, legF: [2, -3], legB: [-2, -3], headDrop: -1, ear: -1, tail: 5.0 }),
    P({ legF: [3, 1], legB: [-3, 1], ear: -1, tail: 1.0, eyes: 'open' }),
  ],
  // wallCling: 2 frames — garras cravadas na parede
  wallCling: [
    P({ legF: [4, -1], legB: [3, 0], pawUp: 1, tail: 0.4, eyes: 'open' }),
    P({ legF: [4, 0], legB: [3, -1], bob: 1, pawUp: 1, tail: 0.9 }),
  ],
  // attack: 3 frames — giro de espada com rastro branco
  attack: [
    P({ sword: 'up', legF: [1, 0], legB: [-1, 0], ear: -1 }),
    P({ sword: 'mid', trail: 1, lean: 1 }),
    P({ sword: 'down', trail: 2, lean: 1, crouch: 1 }),
  ],
  // dash: 2 frames — corpo esticado + linhas de velocidade
  dash: [
    P({ stretch: 2, legF: [3, -2], legB: [-3, -2], ear: -1, tail: 0.2, speedLines: 1 }),
    P({ stretch: 2, legF: [2, -1], legB: [-2, -1], bob: 1, ear: -1, tail: 0.8, speedLines: 2 }),
  ],
  // hurt: 2 frames — recuo com olhos fechados
  hurt: [
    P({ eyes: 'shut', lean: -1, legF: [2, -2], legB: [-2, -2], headDrop: -1, pawUp: 1, tail: 2.0 }),
    P({ eyes: 'shut', lean: -2, legF: [3, -1], legB: [-3, 0], pawUp: 1, tail: 3.0 }),
  ],
  // death: 4 frames — gato gira e cai
  death: [
    P({ eyes: 'x', legF: [3, -3], legB: [-3, -3], headDrop: -1, pawUp: 1, tail: 1.0 }),
    P({ eyes: 'x', legF: [2, -4], legB: [-2, -4], headDrop: 1, pawUp: 1, crouch: 1, tail: 4.5 }),
    P({ eyes: 'x', crouch: 3, legF: [1, 1], legB: [-1, 1], tail: 2.2 }),
    P({ eyes: 'x', flat: 1, crouch: 4, legF: [2, 2], legB: [-2, 2], tail: 0.0, wisp: 1 }),
  ],
};

// -----------------------------------------------------------------------------
// Partes do corpo
// -----------------------------------------------------------------------------

/** Cauda: 5 segmentos numa curva senoidal. */
function drawTail(ctx, o) {
  const baseY = 17 + o.bob + o.crouch;
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const sway = Math.sin(o.tail + t * 2.4) * 2.2;
    const x = 7 - i * 1.5 + (o.lean < 0 ? 1 : 0);
    const y = baseY - i * 1.2 + sway;
    px(ctx, x, y, 2, 2, i % 2 ? PAL.fur : PAL.furDark);
  }
  px(ctx, 7 - 6, baseY - 5 + Math.sin(o.tail + 2.4) * 2.2, 2, 2, PAL.furDark);
}

/** Uma pata: coxa + pé escuro. */
function drawLeg(ctx, x, y, dx, dy, dark) {
  const c = dark ? PAL.furDark : PAL.fur;
  px(ctx, x + dx, y + dy, 3, 4 - Math.max(0, -dy), c);
  px(ctx, x + dx, y + dy + 4 - Math.max(0, -dy) - 1, 3, 1, PAL.furDark);
}

function drawBody(ctx, o) {
  const by = 13 + o.bob;
  const wide = o.stretch === 2 ? 3 : o.stretch === 1 ? -1 : 0;
  const tall = o.stretch === 1 ? 2 : o.stretch === 2 ? -1 : 0;
  const bh = Math.max(3, 7 - o.crouch + tall);
  const bx = 7 - (wide > 0 ? wide : 0);
  const bw = 11 + wide;

  px(ctx, bx, by, bw, bh, PAL.fur);            // torso
  px(ctx, bx, by, 2, bh, PAL.furDark);          // sombra das costas
  px(ctx, bx + 4, by + bh - 4, bw - 5, 4, PAL.white); // barriga branca
  px(ctx, bx + 5, by, 2, 1, PAL.furDark);       // listras de gato
  px(ctx, bx + 8, by + 1, 2, 1, PAL.furDark);
}

function drawHead(ctx, o) {
  const hy = 4 + o.bob + o.headDrop;
  const hx = 9 + (o.lean > 0 ? 1 : o.lean < 0 ? -1 : 0);

  // orelhas (com twitch)
  const et = o.ear;
  px(ctx, hx, hy - 2 + (et < 0 ? 1 : 0), 3, 3, PAL.fur);
  px(ctx, hx + 1, hy - 1 + (et < 0 ? 1 : 0), 1, 1, PAL.pink);
  px(ctx, hx + 7, hy - 2 - (et > 0 ? 1 : 0), 3, 3, PAL.fur);
  px(ctx, hx + 8, hy - 1 - (et > 0 ? 1 : 0), 1, 1, PAL.pink);

  // crânio
  px(ctx, hx, hy, 11, 8, PAL.fur);
  px(ctx, hx + 1, hy - 1, 9, 1, PAL.fur);
  px(ctx, hx, hy + 1, 2, 6, PAL.furDark);       // nuca

  // faixa ninja branca na testa
  px(ctx, hx, hy + 1, 11, 2, PAL.band);
  px(ctx, hx, hy + 3, 2, 1, PAL.red);           // nó da faixa

  // olhos
  drawEyes(ctx, hx, hy + 4, o.eyes);

  // focinho
  px(ctx, hx + 7, hy + 6, 4, 2, PAL.white);
  px(ctx, hx + 10, hy + 6, 1, 1, PAL.pink);
  px(ctx, hx + 6, hy + 7, 1, 1, PAL.band);      // bigode
}

function drawEyes(ctx, x, y, state) {
  if (state === 'x') {
    for (const ex of [x + 2, x + 6]) {
      px(ctx, ex, y, 1, 1, PAL.black);
      px(ctx, ex + 2, y, 1, 1, PAL.black);
      px(ctx, ex + 1, y + 1, 1, 1, PAL.black);
      px(ctx, ex, y + 2, 1, 1, PAL.black);
      px(ctx, ex + 2, y + 2, 1, 1, PAL.black);
    }
    return;
  }
  if (state === 'open') {
    px(ctx, x + 2, y, 2, 2, PAL.eye);
    px(ctx, x + 6, y, 2, 2, PAL.eye);
    px(ctx, x + 3, y + 1, 1, 1, PAL.black);     // pupila
    px(ctx, x + 7, y + 1, 1, 1, PAL.black);
    return;
  }
  // blink / shut: risquinho
  px(ctx, x + 2, y + 1, 2, 1, PAL.black);
  px(ctx, x + 6, y + 1, 2, 1, PAL.black);
}

/** Cachecol vermelho com pontas esvoaçando. */
function drawScarf(ctx, o) {
  const y = 12 + o.bob;
  const hx = 9 + (o.lean > 0 ? 1 : o.lean < 0 ? -1 : 0);
  px(ctx, hx - 1, y, 12, 2, PAL.red);
  px(ctx, hx + 3, y, 2, 2, PAL.redDark);
  const wave = Math.sin(o.tail * 0.9) * 1.5;
  px(ctx, hx - 4, y + 1 + wave, 4, 2, PAL.red);
  px(ctx, hx - 6, y + 2 + wave, 3, 2, PAL.redDark);
}

/** Espada curta: nas costas, erguida, no meio do corte ou embaixo. */
function drawSword(ctx, o) {
  const bx = 9 + (o.lean > 0 ? 1 : 0);
  const by = 13 + o.bob;
  if (o.sword === 'back') {
    pxLine(ctx, 4, 3, 8, 11, PAL.steel, 1);
    pxLine(ctx, 3, 3, 7, 11, PAL.steelDk, 1);
    pxLine(ctx, 8, 11, 10, 13, PAL.wood, 2);
    return;
  }
  const swing = {
    up:   [[bx + 6, by - 12], [bx + 11, by - 7]],
    mid:  [[bx + 9, by - 4], [bx + 15, by - 4]],
    down: [[bx + 8, by + 1], [bx + 13, by + 6]],
  }[o.sword];
  const [[ax, ay], [cx, cy]] = swing;
  pxLine(ctx, ax, ay, cx, cy, PAL.steel, 2);
  pxLine(ctx, ax, ay + 1, cx, cy + 1, PAL.steelDk, 1);
  pxLine(ctx, bx + 6, by - 2, ax, ay, PAL.wood, 2);   // cabo
  px(ctx, bx + 5, by - 3, 3, 1, PAL.gold);            // guarda

  // rastro branco do corte
  if (o.trail >= 1) {
    pxArc(ctx, bx + 5, by - 2, 9, -1.35, 0.25, PAL.white, 2);
  }
  if (o.trail >= 2) {
    pxArc(ctx, bx + 5, by - 2, 9, 0.25, 1.0, PAL.white, 1);
    pxArc(ctx, bx + 5, by - 2, 6, -1.2, 0.6, PAL.band, 1);
  }
}

/** Linhas de velocidade do dash. */
function drawSpeedLines(ctx, o) {
  const n = o.speedLines;
  for (let i = 0; i < n + 1; i++) {
    const y = 8 + i * 4 + o.bob;
    px(ctx, 1, y, 4 - i % 2, 1, PAL.white);
    px(ctx, 0, y + 2, 2, 1, PAL.cyan);
  }
}

/** Alminha subindo no último frame da morte. */
function drawWisp(ctx) {
  px(ctx, 12, 1, 2, 2, PAL.white);
  px(ctx, 11, 3, 1, 1, PAL.white);
  px(ctx, 14, 3, 1, 1, PAL.white);
  px(ctx, 12, 5, 2, 1, PAL.cyan);
}

// -----------------------------------------------------------------------------
// API
// -----------------------------------------------------------------------------

/** Desenha um frame do Belisco num contexto já limpo (24x24). */
/** Pose deitada do último frame da morte (corpo estendido no chão). */
function drawFlatCat(ctx, o) {
  // corpo deitado
  px(ctx, 4, 18, 14, 4, PAL.fur);
  px(ctx, 4, 18, 14, 1, PAL.furDark);
  px(ctx, 7, 20, 8, 2, PAL.white);
  // patas esticadas
  px(ctx, 5, 22, 3, 1, PAL.furDark);
  px(ctx, 13, 22, 3, 1, PAL.furDark);
  // cauda encolhida à esquerda
  px(ctx, 1, 19, 3, 2, PAL.furDark);
  px(ctx, 0, 18, 2, 1, PAL.fur);
  // cabeça deitada à direita
  px(ctx, 15, 16, 8, 6, PAL.fur);
  px(ctx, 15, 16, 8, 2, PAL.band);          // faixa
  px(ctx, 16, 19, 1, 1, PAL.black);         // olhos em X
  px(ctx, 18, 19, 1, 1, PAL.black);
  px(ctx, 17, 20, 1, 1, PAL.black);
  px(ctx, 21, 19, 2, 1, PAL.white);         // focinho
  px(ctx, 22, 19, 1, 1, PAL.pink);
  // cachecol enrolado no pescoço
  px(ctx, 14, 20, 3, 2, PAL.red);
  if (o.wisp) drawWisp(ctx);
}

export function drawCatFrame(ctx, anim, frame) {
  const list = POSES[anim] || POSES.idle;
  const o = list[frame % list.length];

  if (o.flat) { drawFlatCat(ctx, o); return; }

  if (o.speedLines) drawSpeedLines(ctx, o);
  drawTail(ctx, o);
  drawLeg(ctx, 8, 19 + o.bob + o.crouch, o.legB[0], o.legB[1], true);
  if (o.sword === 'back') drawSword(ctx, o);
  drawBody(ctx, o);
  drawLeg(ctx, 14, 19 + o.bob + o.crouch, o.legF[0], o.legF[1], false);
  if (!o.flat) drawHead(ctx, o);
  drawScarf(ctx, o);
  if (o.flat) {
    // deitado: cabeça caída no chão
    px(ctx, 15, 18, 8, 5, PAL.fur);
    px(ctx, 15, 18, 8, 1, PAL.furDark);
    px(ctx, 17, 20, 2, 1, PAL.black);
    px(ctx, 21, 20, 1, 1, PAL.black);
  }
  if (o.sword !== 'back') drawSword(ctx, o);
  if (o.wisp) drawWisp(ctx);
}

/** Quantos frames existem para uma animação do gato. */
export function catFrameCount(anim) {
  return (POSES[anim] || POSES.idle).length;
}
