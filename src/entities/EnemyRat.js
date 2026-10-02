// =============================================================================
// EnemyRat.js — Rato ninja: corre rápido atrás do jogador e arremessa shurikens.
// =============================================================================

import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';

export class EnemyRat extends Enemy {
  think(dt, game) {
    const { dx } = this.distToPlayer(game);
    this.cool -= dt;

    if (this.playerNear(game, this.def.sightRange)) {
      this.dir = dx > 0 ? 1 : -1;
      this.facing = this.dir;
      this.vx = this.dir * this.def.speed;
      // para e atira quando em alcance
      if (Math.abs(dx) < 110 && Math.abs(dx) > 24) {
        if (this.cool <= 0) {
          this.cool = this.def.throwCooldown;
          this.setState('throw');
          this.vx = 0;
          game.addProjectile(new Projectile('shuriken', this.cx, this.cy - 2,
            this.dir * 150, 0, { from: 'enemy' }));
          game.audio.play('shuriken');
        }
      }
      this.setAnim(this.state === 'throw' ? 'throw' : 'run', dt);
      if (this.state === 'throw' && this.stateT > 0.32) this.setState('run');
    } else {
      this.vx = this.dir * this.def.speed * 0.5;
      this.patrolTurn(game);
      this.facing = this.dir;
      this.setAnim('run', dt);
    }

    this.gravity(dt);
    this.physics.move(this, dt);
  }
}
