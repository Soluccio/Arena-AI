// =============================================================================
// Platform.js — Plataforma que cai: treme quando pisada, despenca e volta
// depois de alguns segundos.
// =============================================================================

import { Entity } from './Entity.js';
import { theme } from '../sprites/Palette.js';

export class Platform extends Entity {
  constructor(x, y, themeName) {
    super(x, y, 32, 6);
    this.solid = true;
    this.themeName = themeName;
    this.state = 'idle';
    this.stateT = 0;
    this.homeX = x;
    this.homeY = y;
  }

  update(dt, game) {
    super.update(dt, game);
    this.stateT += dt;

    if (this.state === 'idle') {
      const p = game.player;
      const standing = p.onGround && p.y + p.h >= this.y - 1 && p.y + p.h <= this.y + 4 &&
        p.x + p.w > this.x && p.x < this.x + this.w;
      if (standing) { this.state = 'shake'; this.stateT = 0; }
    } else if (this.state === 'shake') {
      if (this.stateT > 0.45) { this.state = 'fall'; this.solid = false; this.vy = 0; }
    } else if (this.state === 'fall') {
      this.vy += 700 * dt;
      this.y += this.vy * dt;
      if (Math.random() < 0.3) game.fx.dust(this.cx, this.y, 1, 0);
      if (this.y > game.level.pixelH + 40) { this.state = 'gone'; this.stateT = 0; }
    } else if (this.state === 'gone') {
      if (this.stateT > 2.6) {
        this.state = 'idle';
        this.x = this.homeX;
        this.y = this.homeY;
        this.solid = true;
      }
    }
  }

  draw(ctx, game) {
    if (this.state === 'gone') return;
    const t = theme(this.themeName);
    const jx = this.state === 'shake' ? Math.round(Math.sin(this.time * 60) * 1) : 0;
    ctx.fillStyle = t.tile;
    ctx.fillRect(Math.round(this.x + jx), Math.round(this.y), this.w, 4);
    ctx.fillStyle = t.accent;
    ctx.fillRect(Math.round(this.x + jx), Math.round(this.y), this.w, 1);
    ctx.fillStyle = t.tileDark;
    ctx.fillRect(Math.round(this.x + jx), Math.round(this.y) + 4, this.w, 2);
  }
}
