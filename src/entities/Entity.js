// =============================================================================
// Entity.js — Classe base de tudo que vive no mundo (jogador, inimigos, itens).
// =============================================================================

import { aabb } from '../core/Physics.js';

export class Entity {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.dead = false;
    this.facing = 1;
    this.time = 0;
    this.onGround = false;
    this.flashTimer = 0;      // flash branco ao ser atingido
  }

  get rect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  overlaps(other) {
    return aabb(this.rect, other.rect);
  }

  /** Distância horizontal até outro corpo. */
  dxTo(other) { return other.cx - this.cx; }
  dyTo(other) { return other.cy - this.cy; }

  /** Aplica flash branco (desenhado via Entity.drawSprite). */
  flash() {
    this.flashTimer = 0.1;
  }

  update(dt, game) {
    this.time += dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;
  }

  draw(ctx, game) { }

  /**
   * Helper comum: desenha um sprite centralizado nos pés, com flip pelo
   * `facing` e flash branco quando recém-atingido.
   */
  drawSprite(ctx, sprite, offsetX = 0, offsetY = 0) {
    ctx.save();
    const cx = Math.round(this.x + this.w / 2);
    const fy = Math.round(this.y + this.h);
    ctx.translate(cx, fy);
    ctx.scale(this.facing, 1);
    ctx.drawImage(sprite, -Math.round(sprite.width / 2) + offsetX, -sprite.height + offsetY);
    if (this.flashTimer > 0) {
      ctx.globalAlpha = 0.7;
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(sprite, -Math.round(sprite.width / 2) + offsetX, -sprite.height + offsetY);
    }
    ctx.restore();
  }
}
