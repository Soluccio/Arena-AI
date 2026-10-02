// =============================================================================
// tools/screenshot.mjs — Renderiza frames do jogo em Node e grava um PNG
// ampliado, para inspeção visual do gameplay sem navegador.
// Uso: node tools/screenshot.mjs [level] [frames] [out.png]
// =============================================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { installShim, makeCanvas } from '../tests/shim.mjs';
import { encodePng } from './png.mjs';
import { SoftCanvas } from './softcanvas.mjs';

installShim();

const { Game } = await import('../src/core/Game.js');
const { VIEW_W, VIEW_H } = await import('../src/data/constants.js');

const level = Number(process.argv[2] ?? 0);
const frames = Number(process.argv[3] ?? 90);
const outPath = process.argv[4] || `out/shot-level${level}.png`;
const SCALE = 3;

const canvas = makeCanvas(VIEW_W, VIEW_H);
const game = new Game(canvas);
game.startLevel(level);

// simula um pouco de gameplay: corre e pula
for (let i = 0; i < frames; i++) {
  game.input.held.add('right');
  if (i % 30 === 0) game.input.just.add('jump');
  game.frame(i * 16.6);
}

// amplia e grava
const src = canvas.getContext('2d').data;
const big = new SoftCanvas();
big.width = VIEW_W * SCALE;
big.height = VIEW_H * SCALE;
const bctx = big.getContext('2d');
for (let y = 0; y < VIEW_H; y++) {
  for (let x = 0; x < VIEW_W; x++) {
    const o = (y * VIEW_W + x) * 4;
    const a = src[o + 3];
    const col = a === 0 ? '#1a1a2e' : `rgb(${src[o]},${src[o + 1]},${src[o + 2]})`;
    bctx.fillStyle = col;
    bctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
  }
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, encodePng(big.width, big.height, bctx.data));
console.log(`screenshot -> ${outPath} (${big.width}x${big.height})`);
