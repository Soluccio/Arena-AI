// =============================================================================
// Projectile.js — Projéteis: shuriken, flecha, bomba e raio. Cada tipo tem seu
// comportamento de voo e de impacto. Bomba explode em área.
// =============================================================================

import { Entity } from './Entity.js';
import { GRAVITY } from '../data/constants.js';

const SIZE = { shuriken: [10, 10], arrow: [14, 8], bomb: [10, 10], bolt: [16, 64], spark: [12, 12] };

export class Projectile extends Entity {
  constructor(kind, x, y, vx, vy, opts = {}) {
    const [w, h] = SIZE[kind];
    super(x - w / 2, y - h / 2, w, h);
    this.kind = kind;
    this.vx = vx;
    this.vy = vy;
    this.from = opts.from || 'enemy';
    this.damage = opts.damage || 1;
    this.life = opts.life || 4;
    this.rot = 0;
    this.stuck = false;
    this.facing = Math.sign(vx) || 1;
  }

  update(dt, game) {
    super.update(dt, game);
    if (this.stuck) { this.life -= dt; if (this.life <= 0) this.dead = true; return; }

    this.life -= dt;
    if (this.life <= 0) { this.dead = true; return; }

    if (this.kind === 'shuriken') this.rot += dt * 20;
    if (this.kind === 'arrow') this.vy += GRAVITY * 0.6 * dt;
    if (this.kind === 'bomb') this.vy += GRAVITY * 0.9 * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // colide com sólido?
    if (game.level.solidRect(this.x, this.y, this.w, this.h)) {
      if (this.kind === 'bomb') this.explode(game);
      else if (this.kind === 'arrow') { this.stuck = true; this.life = 0.6; }
      else this.dead = true;
    }
  }

  explode(game) {
    if (this.dead) return;
    this.dead = true;
    game.audio.play('explode');
    game.camera.shake(5, 0.3);
    game.fx.burst(this.cx, this.cy, '#ffeb3b', 16, 170, 0.6, 300, 2);
    game.fx.burst(this.cx, this.cy, '#c62828', 10, 120, 0.5, 300, 2);
    // dano em área no jogador
    const p = game.player;
    const r = 34;
    if (Math.hypot(p.cx - this.cx, p.cy - this.cy) < r) p.damage(this.damage, game);
  }

  draw(ctx, game) {
    const { get } = game.sprites;
    ctx.save();
    ctx.translate(Math.round(this.cx), Math.round(this.cy));
    if (this.kind === 'shuriken') ctx.rotate(this.rot);
    if (this.kind === 'arrow') {
      const a = Math.atan2(this.vy, this.vx);
      ctx.rotate(this.facing < 0 ? Math.PI - a : a);
    }
    const sprite = get(this.kind, 'idle', Math.floor(this.time * 12) % 4);
    ctx.drawImage(sprite, -Math.round(sprite.width / 2), -Math.round(sprite.height / 2));
    ctx.restore();
  }
}
