// =============================================================================
// main.js — Bootstrap: cria o canvas, o Game, cuida do scale inteiro e do loop.
// =============================================================================

import { Game } from './core/Game.js';
import { VIEW_W, VIEW_H } from './data/constants.js';
import { TouchControls } from './ui/TouchControls.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const game = new Game(canvas);

/** Escala inteira para manter o pixel art nítido em qualquer tela. */
function resize() {
  const scale = Math.max(1, Math.floor(Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H)));
  canvas.style.width = `${VIEW_W * scale}px`;
  canvas.style.height = `${VIEW_H * scale}px`;
}
window.addEventListener('resize', resize);
resize();

new TouchControls(game.input);

function loop(t) {
  game.frame(t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
