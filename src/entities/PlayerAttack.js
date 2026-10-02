// =============================================================================
// PlayerAttack.js — Espada curta do Belisco: hitbox em arco à frente, 3 frames,
// funciona no ar, e janela de combo. A resolução de dano fica no Combat.js;
// aqui cuidamos só do tempo e da forma do golpe.
// =============================================================================

import { ATTACK_FRAME_TIME, ATTACK_RANGE } from '../data/constants.js';

export const SWING_TOTAL = ATTACK_FRAME_TIME * 3 + 0.06;

/** Começa um novo golpe (incrementa o id para não acertar o mesmo inimigo 2x). */
export function startAttack(player, game) {
  player.attacking = true;
  player.attackT = 0;
  player.attackFrame = 0;
  player.swingId++;
  player.attackHitSet = new Set();
  game.audio.play('sword');
}

/** Avança o timer do golpe e devolve o frame atual (0..2). */
export function updateAttack(player, dt, game) {
  if (!player.attacking) return -1;
  player.attackT += dt;
  const idx = Math.min(2, Math.floor(player.attackT / ATTACK_FRAME_TIME));
  player.attackFrame = idx;
  // resolve dano nos frames 0..2 (cada inimigo uma vez por golpe)
  game.combat.resolvePlayerAttack(player);
  if (player.attackT >= SWING_TOTAL) {
    player.attacking = false;
    player.attackFrame = 0;
  }
  return idx;
}

/** Hitbox retangular à frente do jogador (lida como "arco" pelo alcance). */
export function attackHitbox(player) {
  const w = ATTACK_RANGE + 6;
  const h = 20;
  const x = player.facing === 1 ? player.x + player.w - 2 : player.x - w + 2;
  return { x, y: player.y - 4, w, h };
}
