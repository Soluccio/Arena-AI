// =============================================================================
// BossMini.js — Mini-boss da fase 2: rato gigante mecânico com 3 padrões:
//  A) investida horizontal        B) rajada do canhão de faíscas
//  C) salto com onda de choque    + stagger entre padrões (janela de dano).
// =============================================================================

import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';

export class BossMini extends Enemy {
  constructor(kind, x, y, level) {
    super(kind, x, y, level);
    this.active = false;
    this.pattern = 0;
    this.shotsLeft = 0;
    this.shotTimer = 0;
    this.staggerHits = 0;
  }

  takeHit(dmg, game, fromX, stomp) {
    if (this.dead || !this.active) return;
    super.takeHit(dmg, game, fromX, stomp);
    if (this.dead) { game.onBossDefeated(this); return; }
    this.staggerHits++;
    if (this.staggerHits >= 5 && this.state !== 'stagger') {
      this.staggerHits = 0;
      this.setState('stagger');
    }
  }

  update(dt, game) {
    super.update(dt, game);
    if (this.dead) return;
    if (!this.active) {
      this.setAnim('idle', dt);
      if (Math.abs(game.player.cx - this.cx) < 130) {
        this.active = true;
        game.onBossActivate(this);
      }
      return;
    }

    this.stateT += dt;
    const { dx } = this.distToPlayer(game);

    switch (this.state) {
      case 'idle': {
        this.vx = Math.sign(dx) * this.def.speed * 0.4;
        this.facing = dx > 0 ? 1 : -1;
        this.setAnim('idle', dt);
        if (this.stateT > 1.0) {
          this.pattern = (this.pattern + 1) % 3;
          this.setState('telegraph');
        }
        break;
      }
      case 'telegraph': {
        this.vx = 0;
        this.facing = dx > 0 ? 1 : -1;
        this.setAnim('charge', dt);
        if (this.stateT > 0.5) {
          this.setState(['charge', 'shoot', 'slam'][this.pattern]);
          if (this.pattern === 1) { this.shotsLeft = 3; this.shotTimer = 0; }
          if (this.pattern === 2) this.vy = -420;
        }
        break;
      }
      case 'charge': {
        this.vx = this.facing * this.def.speed * 2.6;
        this.setAnim('charge', dt);
        if (Math.random() < 0.5) game.fx.ember(this.cx - this.facing * 16, this.cy);
        if (this.stateT > 0.8 || this.wallDir !== 0) this.setState('stagger');
        break;
      }
      case 'shoot': {
        this.vx = 0;
        this.setAnim('shoot', dt);
        this.shotTimer -= dt;
        if (this.shotsLeft > 0 && this.shotTimer <= 0) {
          this.shotTimer = 0.3;
          this.shotsLeft--;
          game.addProjectile(new Projectile('spark', this.cx + this.facing * 18, this.cy - 4,
            this.facing * 190, -40, { from: 'enemy' }));
          game.audio.play('shuriken');
        }
        if (this.shotsLeft <= 0 && this.stateT > 1.2) this.setState('stagger');
        break;
      }
      case 'slam': {
        this.setAnim('charge', dt);
        if (this.vy > 0 && this.onGround && this.stateT > 0.2) {
          game.camera.shake(6, 0.3);
          game.audio.play('explode');
          game.fx.burst(this.cx, this.y + this.h, '#ffeb3b', 14, 190, 0.5, 300, 2);
          const p = game.player;
          if (p.onGround && Math.abs(p.cx - this.cx) < 60) p.damage(1, game);
          this.setState('stagger');
        }
        break;
      }
      case 'stagger': {
        this.vx = 0;
        this.setAnim('stagger', dt);
        if (this.stateT > 0.8) this.setState('idle');
        break;
      }
    }

    this.gravity(dt);
    this.physics.move(this, dt);
  }
}
