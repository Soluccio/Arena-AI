// =============================================================================
// EnemyBomber.js — Rato bombardeiro (fase 2): voa sobre o jogador e solta
// bombas que explodem em área.
// =============================================================================

import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';

export class EnemyBomber extends Enemy {
  constructor(kind, x, y, level) {
    super(kind, x, y, level);
    this.baseY = y;
    this.t = Math.random() * 6;
  }

  think(dt, game) {
    const { dx } = this.distToPlayer(game);
    this.cool -= dt;
    this.t += dt;

    // paira com bob senoidal e persegue horizontalmente
    const targetX = Math.abs(dx) < this.def.sightRange ? game.player.cx : this.cx + this.dir * 20;
    this.vx += Math.sign(targetX - this.cx) * 120 * dt;
    this.vx = Math.max(-this.def.speed, Math.min(this.def.speed, this.vx));
    this.facing = dx > 0 ? 1 : -1;

    const hover = this.baseY + Math.sin(this.t * 3) * 8;
    this.vy = (hover - this.y) * 4;

    // solta bomba quando alinhado por cima
    if (this.cool <= 0 && Math.abs(dx) < 18 && this.y < game.player.y - 10) {
      this.cool = this.def.throwCooldown;
      this.setState('throw');
      game.addProjectile(new Projectile('bomb', this.cx, this.y + this.h, 0, 20, { from: 'enemy' }));
      game.audio.play('shuriken');
    }

    this.setAnim(this.state === 'throw' ? 'throw' : (Math.abs(this.vx) > 8 ? 'run' : 'idle'), dt);
    if (this.state === 'throw' && this.stateT > 0.36) this.setState('idle');

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
}
