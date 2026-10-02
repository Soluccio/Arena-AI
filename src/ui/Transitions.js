// =============================================================================
// Transitions.js — Tela preta entre fases com um kanji em pixel art surgindo e
// fade-in. O kanji é desenhado por um bitmap 12x12 (sem fonte externa).
// =============================================================================

import { VIEW_W, VIEW_H } from '../data/constants.js';

// Kanji simplificados em bitmap 12x12: bambu (竹) e trovão (雷).
const KANJI = {
  bamboo: [
    '..#.....#...',
    '.##.....##..',
    '..#..#..#...',
    '....#.#.....',
    '.....#......',
    '.#..###..#..',
    '.#.#.#.#.#..',
    '.##..#..##..',
    '.#..###..#..',
    '.#.#.#.#.#..',
    '.##..#..##..',
    '....#.#.....',
  ],
  thunder: [
    '############',
    '#....##....#',
    '#.##.##.##.#',
    '############',
    '.....##.....',
    '..########..',
    '..#..##..#..',
    '..########..',
    '.....##.....',
    '..###..###..',
    '..#..##..#..',
    '..########..',
  ],
};

export class Transitions {
  constructor(game) {
    this.game = game;
    this.t = 0;
    this.cb = null;
    this.fromLevel = 0;
    this.fired = false;
  }

  start(fromLevel, cb) {
    this.fromLevel = fromLevel;
    this.cb = cb;
    this.t = 0;
    this.fired = false;
  }

  update(dt) {
    this.t += dt;
    // no meio da transição, carrega a próxima fase
    if (!this.fired && this.t > 1.2) {
      this.fired = true;
      if (this.cb) this.cb();
    }
    if (this.t > 2.2) this.t = 2.2;
  }

  draw(ctx) {
    const g = this.game;
    // fade in/out
    const a = this.t < 0.5 ? this.t / 0.5 : this.t > 1.7 ? (2.2 - this.t) / 0.5 : 1;
    ctx.fillStyle = `rgba(5,5,12,${Math.min(1, a).toFixed(3)})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    if (a > 0.5) {
      const target = this.fromLevel === 0 ? 'thunder' : 'bamboo';
      const name = this.fromLevel === 0 ? 'TEMPLO DO TROVAO' : 'TEMPLO DE BAMBU';
      this.drawKanji(ctx, KANJI[target], VIEW_W / 2 - 24, 80, '#ffeb3b');
      g.font.draw(ctx, name, VIEW_W / 2, 150, '#e8e8f0', 2, true);
    }
  }

  drawKanji(ctx, rows, x, y, color) {
    const scale = 4;
    ctx.fillStyle = color;
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        if (rows[r][c] === '#') ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
      }
    }
  }
}
