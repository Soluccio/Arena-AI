// =============================================================================
// Checkpoint.js — Bandeira que muda de cor ao ser ativada e salva o progresso
// (via Game.saveCheckpoint). Só uma ativa por vez.
// =============================================================================

import { Entity } from './Entity.js';

export class Checkpoint extends Entity {
  constructor(x, y) {
    super(x, y, 16, 24);
    this.active = false;
  }

  update(dt, game) {
    super.update(dt, game);
    if (!this.active && !game.player.dead && this.overlaps(game.player)) {
      this.active = true;
      game.activateCheckpoint(this);
    }
  }

  draw(ctx, game) {
    const { get } = game.sprites;
    const sprite = get('flag', 'idle', this.active ? Math.floor(this.time * 4) % 2 : 0);
    ctx.save();
    if (!this.active) ctx.globalAlpha = 0.75;
    ctx.drawImage(sprite, Math.round(this.x), Math.round(this.y));
    ctx.restore();
  }
}
