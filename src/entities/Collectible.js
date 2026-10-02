// =============================================================================
// Collectible.js — Moeda (pontos/vidas), peixe (cura) e coração (+1 vida).
// Flutuam com bob e somem ao serem coletados.
// =============================================================================

import { Entity } from './Entity.js';
import { COINS_PER_LIFE, MAX_LIVES } from '../data/constants.js';

export class Collectible extends Entity {
  constructor(kind, x, y) {
    super(x, y, 12, 12);
    this.kind = kind;
    this.baseY = y;
    this.phase = Math.random() * 6;
  }

  update(dt, game) {
    super.update(dt, game);
    this.y = this.baseY + Math.sin(this.time * 3 + this.phase) * 2;

    const p = game.player;
    if (!p.dead && this.overlaps(p)) this.collect(game);
  }

  collect(game) {
    this.dead = true;
    const s = game.stats;
    if (this.kind === 'coin') {
      s.coins++;
      s.score += 10;
      game.audio.play('coin');
      game.fx.burst(this.cx, this.cy, '#ffcf4d', 6, 70, 0.4, 100, 1);
      // +1 coração a cada 100 moedas
      if (s.coins % COINS_PER_LIFE === 0 && game.player.hp < MAX_LIVES) {
        game.player.hp++;
        game.fx.dmgNumber(game.player.cx, game.player.y - 8, '+1', '#ff8fa3');
        game.audio.play('heart');
      }
    } else if (this.kind === 'fish') {
      if (game.player.hp < MAX_LIVES) {
        game.player.hp++;
        game.fx.dmgNumber(this.cx, this.y - 6, '+1', '#ff8fa3');
      } else {
        s.score += 200;
      }
      game.audio.play('fish');
      game.fx.burst(this.cx, this.cy, '#7fe3d4', 8, 80, 0.5, 100, 1);
    } else if (this.kind === 'heart') {
      if (game.player.hp < MAX_LIVES) game.player.hp++;
      s.score += 100;
      game.audio.play('heart');
      game.fx.burst(this.cx, this.cy, '#ff8fa3', 8, 80, 0.5, 100, 1);
    }
  }

  draw(ctx, game) {
    const { get } = game.sprites;
    const frame = Math.floor(this.time / 0.12) % 4;
    const sprite = get(this.kind, 'idle', frame);
    this.drawSprite(ctx, sprite);
  }
}
