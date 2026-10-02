// =============================================================================
// EnemyDog.js — Cão samurai: patrulha, detecta o jogador e telegrafa o corte
// erguendo a espada por 0.4s antes de golpear.
// =============================================================================

import { Enemy } from './Enemy.js';

export class EnemyDog extends Enemy {
  think(dt, game) {
    const { dx } = this.distToPlayer(game);
    switch (this.state) {
      case 'patrol': {
        this.vx = this.dir * this.def.speed;
        this.patrolTurn(game);
        this.facing = this.dir;
        this.setAnim('walk', dt);
        if (this.playerNear(game, this.def.sightRange)) {
          this.facing = dx > 0 ? 1 : -1;
          this.setState('detect');
        }
        break;
      }
      case 'detect': {
        this.vx *= 0.8;
        this.facing = dx > 0 ? 1 : -1;
        this.setAnim('idle', dt);
        if (Math.abs(dx) < this.def.attackRange && !game.player.dead) {
          this.setState('telegraph');
        } else if (!this.playerNear(game, this.def.sightRange * 1.3)) {
          this.setState('patrol');
        }
        break;
      }
      case 'telegraph': {
        this.vx = 0;
        this.setAnim('attack', dt);
        this.frame = 0; // espada erguida
        if (this.stateT >= this.def.telegraph) this.setState('attack');
        break;
      }
      case 'attack': {
        this.vx = this.facing * this.def.speed * 2.4;
        this.setAnim('attack', dt);
        this.frame = 1; // corte
        if (this.stateT >= this.def.attackTime) {
          this.setState('recover');
          game.fx.sparkMetal(this.cx + this.facing * 10, this.cy, this.facing);
        }
        break;
      }
      case 'recover': {
        this.vx *= 0.7;
        this.setAnim('idle', dt);
        if (this.stateT >= this.def.recover) this.setState('patrol');
        break;
      }
    }
    this.gravity(dt);
    this.physics.move(this, dt);
  }
}
