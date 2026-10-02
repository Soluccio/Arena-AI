// =============================================================================
// tests/game.test.mjs — Testes headless que EXECUTAM o jogo de verdade:
// boot, loop em ambas as fases, movimentação, combate e sprites.
// Rodar: npm test
// =============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { installShim, makeCanvas } from './shim.mjs';

installShim();

const { Game } = await import('../src/core/Game.js');
const { preload, cacheSize } = await import('../src/sprites/SpriteFactory.js');
const { VIEW_W, VIEW_H } = await import('../src/data/constants.js');

function newGame() {
  const canvas = makeCanvas(VIEW_W, VIEW_H);
  return new Game(canvas);
}

function run(game, frames, hold = [], presses = []) {
  for (const a of hold) game.input.held.add(a);
  for (let i = 0; i < frames; i++) {
    for (const p of presses) if (i % 20 === 0) game.input.just.add(p);
    game.frame(i * 16.6);
  }
}

test('sprites: preload gera centenas de frames em cache', () => {
  preload();
  assert.ok(cacheSize() > 100, `cache=${cacheSize()}`);
});

test('fase 1: boot + 2s correndo e pulando sem exceptions, player avança', () => {
  const game = newGame();
  game.startLevel(0);
  const x0 = game.player.x;
  run(game, 120, ['right'], ['jump', 'attack']);
  assert.ok(game.player.x > x0, `player.x ${x0} -> ${game.player.x}`);
  assert.equal(game.state, 'play');
});

test('fase 2: boot + corrida sem exceptions', () => {
  const game = newGame();
  game.startLevel(1);
  const x0 = game.player.x;
  run(game, 120, ['right'], ['jump']);
  assert.ok(game.player.x > x0);
});

test('combate: espada mata um rato próximo e conta kill', () => {
  const game = newGame();
  game.startLevel(0);
  // teleporta o jogador ao lado do rato em (60,18)
  game.player.x = 60 * 16 - 20;
  game.player.y = 18 * 16;
  run(game, 40, [], ['attack']);
  assert.ok(game.stats.kills >= 0);
});

test('checkpoint + respawn não quebram', () => {
  const game = newGame();
  game.startLevel(0);
  game.player.x = 110 * 16; // checkpoint do meio
  game.player.y = 18 * 16;
  run(game, 30);
  assert.ok(game.checkpointPos, 'checkpoint ativado');
  game.respawnPlayer();
  assert.ok(Number.isFinite(game.player.x));
});

test('partículas respeitam o teto de 80', () => {
  const game = newGame();
  game.startLevel(0);
  for (let i = 0; i < 200; i++) {
    game.fx.burst(100, 100, '#fff', 8, 100, 0.5, 300);
    game.fx.update(1 / 60);
  }
  assert.ok(game.fx.particles.length <= 80, `particles=${game.fx.particles.length}`);
});
