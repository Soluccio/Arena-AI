// =============================================================================
// EnemyFrog.js — Sapo saltitante: pula entre plataformas; morre se esmagado.
// =============================================================================

import { Enemy } from './Enemy.js';

export class EnemyFrog extends Enemy {
  think(dt, game) {
    const { dx } = this.distToPlayer(game);
    this.cool -= dt;

    if (this.onGround) {
      this.vx *= 0.7;
      this.setAnim('idle', dt);
      if (this.cool <= 0) {
        this.cool = this.def.jumpCooldown;
        // pula na direção do jogador se estiver perto
        this.dir = Math.abs(dx) < 120 ? (dx > 0 ? 1 : -1) : this.dir;
        this.vx = this.dir * this.def.speed;
        this.vy = -240;
        this.facing = this.dir;
        this.setAnim('jump', dt);
      }
    } else {
      this.setAnim('jump', dt);
    }

    this.gravity(dt);
    this.physics.move(this, dt);
    // vira na parede
    if (this.wallDir !== 0) this.dir = -this.wallDir;
  }
}
