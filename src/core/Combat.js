// =============================================================================
// Combat.js — Resolução de acertos: espada do jogador vs inimigos/projéteis,
// contato inimigo vs jogador e o "stomp" (pular em cima de inimigos pisáveis).
// =============================================================================

import { aabb } from './Physics.js';
import { attackHitbox } from '../entities/PlayerAttack.js';
import { ATTACK_DAMAGE } from '../data/constants.js';

export class Combat {
  constructor(game) {
    this.game = game;
  }

  /** Espada do jogador acerta inimigos e rebate projéteis. */
  resolvePlayerAttack(player) {
    const game = this.game;
    if (!player.attacking) return;
    const hb = attackHitbox(player);

    for (const e of game.enemies) {
      if (e.dead || player.attackHitSet.has(e)) continue;
      if (aabb(hb, e.rect)) {
        player.attackHitSet.add(e);
        e.takeHit(ATTACK_DAMAGE, game, player.cx);
        game.registerComboHit();
      }
    }

    for (const pr of game.projectiles) {
      if (pr.from !== 'enemy' || pr.dead || player.attackHitSet.has(pr)) continue;
      if (aabb(hb, pr.rect)) {
        player.attackHitSet.add(pr);
        pr.dead = true;
        game.stats.score += 25;
        game.fx.sparkMetal(pr.cx, pr.cy, player.facing);
        game.audio.play('clang');
      }
    }
  }

  /** Contato corpo a corpo inimigo x jogador (com stomp). */
  enemyContact(e) {
    const game = this.game;
    const player = game.player;
    if (e.dead || player.dead || player.invulnerable) return;
    if (!aabb(player.rect, e.rect)) return;

    const stomp = player.vy > 60 && (player.y + player.h) < e.cy + 4 && e.def.stompable;
    if (stomp) {
      e.takeHit(99, game, player.cx, true);
      player.vy = -250;                       // quica
      game.audio.play('stomp');
      game.fx.burst(e.cx, e.cy, '#ffffff', 6, 90, 0.4, 300, 1);
      game.registerComboHit();
      return;
    }
    // dano normal + knockback
    if (player.damage(e.def.damage, game)) {
      player.vx = (player.cx < e.cx ? -1 : 1) * 170;
      player.vy = -170;
    }
  }

  /** Projétil inimigo x jogador. */
  projectileContact(pr) {
    const game = this.game;
    const player = game.player;
    if (pr.dead || pr.from !== 'enemy' || player.dead || player.invulnerable) return;
    if (aabb(player.rect, pr.rect)) {
      if (pr.kind === 'bomb') { pr.explode(game); return; }
      if (player.damage(pr.damage, game)) {
        pr.dead = true;
        player.vy = -150;
      }
    }
  }
}
