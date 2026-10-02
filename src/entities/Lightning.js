// =============================================================================
// Lightning.js — Raio da fase 2: telegrafa no chão (marcador), depois desce uma
// coluna de energia que causa dano. Também usado pelo boss na fase 2 dele.
// =============================================================================

import { Entity } from './Entity.js';

export class Lightning extends Entity {
  constructor(x, topY, bottomY) {
    super(x - 8, topY, 16, bottomY - topY);
    this.warn = 0.7;        // tempo de aviso
    this.strike = 0.25;     // duração do golpe
    this.done = false;
  }

  update(dt, game) {
    super.update(dt, game);
    if (this.time < this.warn) return;
    if (!this.done) {
      this.done = true;
      game.audio.play('bolt');
      game.camera.shake(4, 0.2);
      game.background.triggerFlash(0.8);
      game.fx.burst(this.cx, this.y + this.h, '#ffeb3b', 10, 140, 0.4, 300, 2);
    }
    // dano durante o golpe
    if (this.time < this.warn + this.strike) {
      const p = game.player;
      if (!p.dead && !p.invulnerable &&
          p.x < this.x + this.w && p.x + p.w > this.x) {
        p.damage(1, game);
      }
    } else {
      this.dead = true;
    }
  }

  draw(ctx, game) {
    const x = Math.round(this.x);
    if (this.time < this.warn) {
      // marcador piscando no chão
      const blink = Math.floor(this.time * 12) % 2;
      ctx.fillStyle = blink ? '#ffeb3b' : 'rgba(255,235,59,0.3)';
      ctx.fillRect(x + 4, Math.round(this.y + this.h) - 3, 8, 3);
      return;
    }
    const { get } = game.sprites;
    const frame = Math.floor(this.time * 30) % 2;
    const sprite = get('bolt', 'idle', frame);
    // coluna de energia
    ctx.save();
    ctx.globalAlpha = 0.9;
    for (let y = this.y; y < this.y + this.h; y += sprite.height) {
      ctx.drawImage(sprite, x, Math.round(y));
    }
    ctx.restore();
  }
}
