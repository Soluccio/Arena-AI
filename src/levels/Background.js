// =============================================================================
// Background.js — Céu em camadas + parallax determinístico + clima (folhas ou
// chuva) + clarão de relâmpago. Tudo procedural, sem assets.
// =============================================================================

import { VIEW_W, VIEW_H } from '../data/constants.js';
import { theme } from '../sprites/Palette.js';

/** Pseudo-aleatório determinístico por índice. */
function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export class Background {
  constructor() {
    this.flash = 0;         // intensidade do clarão (0..1)
    this.leaves = Array.from({ length: 10 }, (_, i) => ({
      x: rnd(i) * VIEW_W, y: rnd(i + 50) * VIEW_H, s: 14 + rnd(i + 99) * 22,
    }));
  }

  triggerFlash(strength = 1) {
    this.flash = Math.max(this.flash, strength);
  }

  draw(ctx, cam, themeName, time) {
    const t = theme(themeName);

    // céu em 3 faixas
    ctx.fillStyle = t.sky[0];
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = t.sky[1];
    ctx.fillRect(0, VIEW_H * 0.45, VIEW_W, VIEW_H * 0.3);
    ctx.fillStyle = t.sky[2];
    ctx.fillRect(0, VIEW_H * 0.75, VIEW_W, VIEW_H * 0.25);

    // estrelas / brilhos
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 24; i++) {
      const sx = (rnd(i) * VIEW_W * 2 - cam.x * 0.05) % VIEW_W;
      const sy = rnd(i + 7) * VIEW_H * 0.5;
      const tw = 0.5 + 0.5 * Math.sin(time * 2 + i);
      ctx.globalAlpha = 0.15 + tw * 0.25;
      ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
    }
    ctx.globalAlpha = 1;

    // camada LONGE: silhuetas de pagodes/montanhas
    this.farLayer(ctx, cam, t, themeName);
    // camada MEIO: bambus ou colunas
    this.midLayer(ctx, cam, t, themeName);

    // clima
    if (t.weather === 'leaves') this.drawLeaves(ctx, time);
    else this.drawRain(ctx, time);

    // clarão de relâmpago
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,245,190,${(0.28 * this.flash).toFixed(3)})`;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      this.flash = Math.max(0, this.flash - 0.03);
    }
  }

  farLayer(ctx, cam, t, themeName) {
    const par = 0.15;
    const off = cam.x * par;
    ctx.fillStyle = t.far;
    for (let i = 0; i < 10; i++) {
      const bx = i * 90 - (off % 90) - 90;
      const h = 60 + rnd(i + Math.floor(off / 90)) * 70;
      // montanha/pagode
      ctx.fillRect(bx + 10, VIEW_H - h, 34, h);
      ctx.fillRect(bx + 4, VIEW_H - h, 46, 6);
      ctx.fillRect(bx - 2, VIEW_H - h - 6, 58, 5);
      if (themeName === 'thunder') {
        ctx.fillRect(bx + 24, VIEW_H - h - 18, 3, 14);
      }
    }
    // lua / sol de tempestade
    ctx.fillStyle = themeName === 'thunder' ? '#8a93c9' : '#f4e9c8';
    ctx.beginPath();
    ctx.arc(VIEW_W - 70 - cam.x * 0.02 % 20, 42, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  midLayer(ctx, cam, t, themeName) {
    const par = 0.35;
    const off = cam.x * par;
    ctx.fillStyle = t.mid;
    for (let i = 0; i < 14; i++) {
      const bx = i * 48 - (off % 48) - 48;
      const h = 90 + rnd(i + 300) * 60;
      if (themeName === 'bamboo') {
        // troncos de bambu finos
        ctx.fillRect(bx + 12, VIEW_H - h, 4, h);
        ctx.fillRect(bx + 12, VIEW_H - h + 18, 6, 2);
        ctx.fillRect(bx + 8, VIEW_H - h + 44, 6, 2);
      } else {
        // colunas de templo
        ctx.fillRect(bx + 8, VIEW_H - h, 10, h);
        ctx.fillRect(bx + 4, VIEW_H - h, 18, 6);
      }
    }
    // neblina baixa
    ctx.fillStyle = t.fog;
    ctx.fillRect(0, VIEW_H * 0.7, VIEW_W, VIEW_H * 0.3);
  }

  drawLeaves(ctx, time) {
    ctx.fillStyle = 'rgba(129,199,132,0.5)';
    for (const l of this.leaves) {
      const y = (l.y + time * l.s) % VIEW_H;
      const x = (l.x + Math.sin(time + l.y) * 20 + time * 8) % VIEW_W;
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }

  drawRain(ctx, time) {
    ctx.strokeStyle = 'rgba(160,190,255,0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 26; i++) {
      const x = (rnd(i) * VIEW_W + time * 140) % VIEW_W;
      const y = (rnd(i + 40) * VIEW_H + time * 460) % VIEW_H;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 2, y + 7);
      ctx.stroke();
    }
  }
}
