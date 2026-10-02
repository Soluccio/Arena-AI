// =============================================================================
// Menu.js — Tela inicial: título em pixel font, gato idle animado e seleção de
// fase (a fase 2 desbloqueia após vencer a 1).
// =============================================================================

import { VIEW_W, VIEW_H } from '../data/constants.js';

export class Menu {
  constructor(game) {
    this.game = game;
    this.index = 0;
    this.t = 0;
  }

  get options() {
    return [
      { label: 'FASE 1 - TEMPLO DE BAMBU', level: 0, locked: false },
      { label: 'FASE 2 - TEMPLO DO TROVAO', level: 1, locked: this.game.save.unlocked < 1 },
    ];
  }

  update(dt) {
    this.t += dt;
    const inp = this.game.input;
    if (inp.pressed('up') || inp.pressed('left')) { this.index = (this.index + 1) % 2; this.game.audio.play('uiMove'); }
    if (inp.pressed('down') || inp.pressed('right')) { this.index = (this.index + 1) % 2; this.game.audio.play('uiMove'); }
    if (inp.pressed('confirm') || inp.pressed('jump')) {
      const opt = this.options[this.index];
      if (!opt.locked) {
        this.game.audio.play('uiSelect');
        this.game.startLevel(opt.level);
      }
    }
  }

  draw(ctx) {
    const g = this.game;
    // fundo
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, VIEW_H * 0.6, VIEW_W, VIEW_H * 0.4);
    // estrelas
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 30; i++) {
      const x = (i * 53) % VIEW_W;
      const y = (i * 29) % (VIEW_H * 0.5);
      ctx.fillRect(x, y, 1, 1);
    }
    // lua
    ctx.fillStyle = '#f4e9c8';
    ctx.beginPath();
    ctx.arc(VIEW_W - 60, 46, 18, 0, Math.PI * 2);
    ctx.fill();

    // título
    g.font.draw(ctx, 'BELISCO', VIEW_W / 2, 34, '#ffeb3b', 3, true);
    g.font.draw(ctx, 'O GATO NINJA', VIEW_W / 2, 56, '#c62828', 2, true);
    g.font.draw(ctx, 'EM BUSCA DO SINO DE JADE', VIEW_W / 2, 74, '#90a4ae', 1, true);

    // gato idle animado no centro
    const frame = Math.floor(this.t / 0.16) % 4;
    const cat = g.sprites.get('cat', 'idle', frame);
    const scale = 3;
    ctx.save();
    ctx.translate(VIEW_W / 2, 132);
    ctx.scale(scale, scale);
    ctx.drawImage(cat, -12, -23);
    ctx.restore();

    // opções
    this.options.forEach((opt, i) => {
      const y = 170 + i * 16;
      const sel = i === this.index;
      const color = opt.locked ? '#546e7a' : sel ? '#ffeb3b' : '#e8e8f0';
      if (sel) g.font.draw(ctx, '>', VIEW_W / 2 - g.font.width(opt.label, 1) / 2 - 10, y, '#ffeb3b', 1);
      g.font.draw(ctx, opt.locked ? `${opt.label} (BLOQUEADA)` : opt.label, VIEW_W / 2, y, color, 1, true);
    });

    g.font.draw(ctx, 'SETAS/AD MOVER  ESPACO PULAR  X ATACAR  SHIFT DASH', VIEW_W / 2, 226, '#7a7a8c', 1, true);
    g.font.draw(ctx, 'ENTER CONFIRMAR  ESC PAUSA', VIEW_W / 2, 238, '#7a7a8c', 1, true);
  }
}
