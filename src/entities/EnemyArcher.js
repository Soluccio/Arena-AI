// =============================================================================
// EnemyArcher.js — Cão arqueiro (fase 2): mantém distância e atira flechas
// em arco quando o jogador entra no alcance.
// =============================================================================

import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';

export class EnemyArcher extends Enemy {
  think(dt, game) {
    const { dx, dy } = this.distToPlayer(game);
    this.cool -= dt;

    // posicionamento: recua se perto, aproxima se longe
    const adx = Math.abs(dx);
    if (this.playerNear(game, this.def.sightRange)) {
      if (adx < 55) this.dir = dx > 0 ? -1 : 1;       // foge
      else if (adx > this.def.preferredRange) this.dir = dx > 0 ? 1 : -1;
      else this.dir = 0;
      this.facing = dx > 0 ? 1 : -1;

      // atira flecha em arco
      if (this.cool <= 0 && adx < this.def.sightRange && Math.abs(dy) < 70) {
        this.cool = this.def.shootCooldown;
        this.setState('shoot');
        const p = game.addProjectile(new Projectile('arrow', this.cx + this.facing * 8, this.cy - 4,
          this.facing * 130, -120, { from: 'enemy' }));
        if (p) game.audio.play('arrow');
      }
    } else {
      this.dir = this.dir || 1;
      this.patrolTurn(game);
      this.facing = this.dir;
    }

    this.vx = this.dir * this.def.speed;
    this.setAnim(this.state === 'shoot' ? 'shoot' : (this.dir ? 'walk' : 'idle'), dt);
    if (this.state === 'shoot' && this.stateT > 0.36) this.setState('idle');

    this.gravity(dt);
    this.physics.move(this, dt);
  }
}
