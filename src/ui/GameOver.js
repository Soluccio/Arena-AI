// =============================================================================
// GameOver.js — Mostra inimigos abatidos e moedas, com "Tentar de Novo".
// =============================================================================

import { VIEW_W, VIEW_H } from '../data/constants.js';

export class GameOver {
  constructor(game) {
    this.game = game;
    this.index = 0;
  }

  update(dt) {
    const inp = this.game.input;
    if (inp.pressed('up') || inp.pressed('down')) { this.index = (this.index + 1) % 2; this.game.audio.play('uiMove'); }
    if (inp.pressed('confirm')) {
      this.game.audio.play('uiSelect');
      if (this.index === 0) this.game.startLevel(this.game.levelIndex);
      else this.game.state = 'menu';
    }
  }

  draw(ctx) {
    const g = this.game;
    ctx.fillStyle = 'rgba(20,8,14,0.88)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    g.font.draw(ctx, 'FIM DE JOGO', VIEW_W / 2, 80, '#c62828', 2, true);
    g.font.draw(ctx, `INIMIGOS ABATIDOS ${g.stats.kills}`, VIEW_W / 2, 120, '#e8e8f0', 1, true);
    g.font.draw(ctx, `MOEDAS ${g.stats.coins}   PONTOS ${g.stats.score}`, VIEW_W / 2, 136, '#ffcf4d', 1, true);
    const opts = ['TENTAR DE NOVO', 'VOLTAR AO MENU'];
    opts.forEach((opt, i) => {
      const y = 175 + i * 18;
      const sel = i === this.index;
      g.font.draw(ctx, sel ? `> ${opt}` : opt, VIEW_W / 2, y, sel ? '#ffeb3b' : '#e8e8f0', 1, true);
    });
  }
}
