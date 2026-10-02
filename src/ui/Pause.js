// =============================================================================
// Pause.js — Menu de pausa (ESC): Continuar, Reiniciar Fase, Sair.
// =============================================================================

import { VIEW_W, VIEW_H } from '../data/constants.js';

export class Pause {
  constructor(game) {
    this.game = game;
    this.index = 0;
  }

  get options() {
    return ['CONTINUAR', 'REINICIAR FASE', 'SAIR'];
  }

  update(dt) {
    const inp = this.game.input;
    if (inp.pressed('pause')) { this.game.state = 'play'; this.game.audio.play('uiMove'); return; }
    if (inp.pressed('up') || inp.pressed('down')) {
      this.index = (this.index + 1) % 3;
      this.game.audio.play('uiMove');
    }
    if (inp.pressed('confirm')) {
      this.game.audio.play('uiSelect');
      if (this.index === 0) this.game.state = 'play';
      else if (this.index === 1) this.game.startLevel(this.game.levelIndex);
      else this.game.state = 'menu';
    }
  }

  draw(ctx) {
    const g = this.game;
    ctx.fillStyle = 'rgba(10,10,22,0.75)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    g.font.draw(ctx, 'PAUSA', VIEW_W / 2, 90, '#ffeb3b', 2, true);
    this.options.forEach((opt, i) => {
      const y = 130 + i * 18;
      const sel = i === this.index;
      g.font.draw(ctx, sel ? `> ${opt}` : opt, VIEW_W / 2, y, sel ? '#ffeb3b' : '#e8e8f0', 1, true);
    });
  }
}
