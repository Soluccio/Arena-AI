// =============================================================================
// Door.js — Porta de saída com sino. Tocar nela encerra a fase (com transição).
// =============================================================================

import { Entity } from './Entity.js';
import { PAL } from '../sprites/Palette.js';

export class Door extends Entity {
  constructor(x, y) {
    super(x, y, 24, 32);
    this.opening = false;
  }

  update(dt, game) {
    super.update(dt, game);
    if (!this.opening && !game.player.dead && this.overlaps(game.player)) {
      this.opening = true;
      game.audio.play('door');
      game.finishLevel();
    }
  }

  draw(ctx, game) {
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    // moldura de templo
    ctx.fillStyle = PAL.redDark;
    ctx.fillRect(x - 3, y - 6, 30, 4);
    ctx.fillRect(x - 2, y - 2, 3, 34);
    ctx.fillRect(x + 23, y - 2, 3, 34);
    // portal
    ctx.fillStyle = this.opening ? '#ffeb3b' : '#12101f';
    ctx.fillRect(x, y, 24, 32);
    ctx.fillStyle = PAL.red;
    ctx.fillRect(x, y, 24, 2);
    // sino de bronze pendurado
    const sway = Math.round(Math.sin(this.time * 2) * 2);
    ctx.fillStyle = PAL.gold;
    ctx.fillRect(x + 10 + sway, y + 4, 5, 5);
    ctx.fillStyle = PAL.wood;
    ctx.fillRect(x + 12 + sway, y + 2, 1, 2);
    ctx.fillStyle = '#c9971f';
    ctx.fillRect(x + 10 + sway, y + 8, 5, 1);
  }
}
