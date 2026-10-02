// =============================================================================
// HUD.js — Corações (sup. esq.), moedas/pontos (sup. dir.), barra do boss e
// indicador de cooldown do dash. Tudo em espaço de tela.
// =============================================================================

import { VIEW_W, MAX_LIVES, DASH_COOLDOWN } from '../data/constants.js';

export class HUD {
  constructor(game) {
    this.game = game;
  }

  draw(ctx) {
    const g = this.game;
    const { get } = g.sprites;

    // ---- corações ----
    for (let i = 0; i < MAX_LIVES; i++) {
      const x = 6 + i * 12;
      if (i < g.player.hp) {
        const frame = Math.floor(g.timeHud || 0) || 0;
        ctx.drawImage(get('heart', 'idle', 0), x, 6);
      } else {
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.drawImage(get('heart', 'idle', 0), x, 6);
        ctx.restore();
      }
    }

    // ---- moedas + pontos ----
    ctx.drawImage(get('coin', 'idle', Math.floor(performance.now() / 120) % 4), VIEW_W - 58, 6);
    g.font.draw(ctx, String(g.stats.coins), VIEW_W - 44, 9, '#ffcf4d', 1);
    g.font.draw(ctx, `${g.stats.score}`, VIEW_W - 8, 18, '#90a4ae', 1, true);

    // ---- cooldown do dash ----
    const ready = g.player.dashCd <= 0;
    const frac = ready ? 1 : 1 - g.player.dashCd / DASH_COOLDOWN;
    ctx.fillStyle = '#2b2b3d';
    ctx.fillRect(6, 20, 30, 3);
    ctx.fillStyle = ready ? '#7fe3d4' : '#546e7a';
    ctx.fillRect(6, 20, Math.round(30 * frac), 3);
    g.font.draw(ctx, 'DASH', 40, 19, ready ? '#7fe3d4' : '#546e7a', 1);

    // ---- barra do boss ----
    if (g.boss && !g.boss.dead) {
      const bw = 200;
      const bx = (VIEW_W - bw) / 2;
      const by = VIEW_W ? 240 : 240;
      ctx.fillStyle = '#0b0b16';
      ctx.fillRect(bx - 2, by - 2, bw + 4, 9);
      ctx.fillStyle = '#3b0d0d';
      ctx.fillRect(bx, by, bw, 5);
      ctx.fillStyle = '#c62828';
      ctx.fillRect(bx, by, Math.round(bw * Math.max(0, g.boss.hp / g.boss.def.hp)), 5);
      g.font.draw(ctx, g.boss.kind === 'poodle' ? 'SHOGUN POODLE' : 'RATO MECANICO', VIEW_W / 2, by - 12, '#ff8fa3', 1, true);
    }
  }
}
