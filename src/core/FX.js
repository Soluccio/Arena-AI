// =============================================================================
// FX.js — Partículas (teto de 80), números de dano flutuantes, fantasmas de
// dash, folhas, faíscas e poeira. Tudo desenhado em coordenadas de mundo.
// =============================================================================

import { MAX_PARTICLES } from '../data/constants.js';

const TAU = Math.PI * 2;

export class FX {
  constructor() {
    this.particles = [];
    this.numbers = [];
    this.ghosts = [];
    this.flashes = [];   // flashes brancos em entidades
  }

  // ---------------------------------------------------------------- partículas
  _push(p) {
    if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
    this.particles.push(p);
  }

  burst(x, y, color, n = 8, speed = 90, life = 0.5, grav = 300, size = 2) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const s = speed * (0.4 + Math.random() * 0.8);
      this._push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 40,
        life, max: life, color, size, grav,
      });
    }
  }

  dust(x, y, n = 4, dir = 0) {
    for (let i = 0; i < n; i++) {
      this._push({
        x: x + (Math.random() * 8 - 4), y: y + (Math.random() * 3 - 1),
        vx: -dir * (30 + Math.random() * 40) + (Math.random() * 30 - 15),
        vy: -(20 + Math.random() * 40),
        life: 0.4, max: 0.4, color: 'rgba(200,200,220,0.7)', size: 2, grav: -20,
      });
    }
  }

  wallDust(x, y) {
    for (let i = 0; i < 2; i++) {
      this._push({
        x, y: y + Math.random() * 8,
        vx: (Math.random() * 40 - 20), vy: 20 + Math.random() * 30,
        life: 0.35, max: 0.35, color: 'rgba(220,220,235,0.8)', size: 1, grav: 60,
      });
    }
  }

  leaf(x, y) {
    this._push({
      x, y,
      vx: 20 + Math.random() * 30, vy: 10 + Math.random() * 20,
      life: 1.2, max: 1.2, color: Math.random() < 0.5 ? '#81c784' : '#4e8f57',
      size: 2, grav: 10, wobble: Math.random() * TAU,
    });
  }

  sparkMetal(x, y, dir) {
    for (let i = 0; i < 6; i++) {
      this._push({
        x, y,
        vx: dir * (60 + Math.random() * 80), vy: -(40 + Math.random() * 60),
        life: 0.3, max: 0.3, color: i % 2 ? '#ffeb3b' : '#ffffff', size: 1, grav: 400,
      });
    }
  }

  ember(x, y) {
    this._push({
      x, y, vx: Math.random() * 30 - 15, vy: -40 - Math.random() * 40,
      life: 0.6, max: 0.6, color: '#ffeb3b', size: 1, grav: -10,
    });
  }

  // ---------------------------------------------------------------- números
  dmgNumber(x, y, text, color = '#ffffff') {
    this.numbers.push({ x, y, text: String(text), color, life: 0.8 });
    if (this.numbers.length > 12) this.numbers.shift();
  }

  // ---------------------------------------------------------------- fantasmas
  ghost(spriteKind, anim, frame, x, y, flip) {
    this.ghosts.push({ kind: spriteKind, anim, frame, x, y, flip, life: 0.25 });
    if (this.ghosts.length > 12) this.ghosts.shift();
  }

  flash(entity) {
    this.flashes.push({ e: entity, life: 0.1 });
  }

  // ---------------------------------------------------------------- update
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.vy += (p.grav || 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.wobble !== undefined) {
        p.wobble += dt * 6;
        p.x += Math.sin(p.wobble) * 20 * dt;
      }
    }
    for (let i = this.numbers.length - 1; i >= 0; i--) {
      const n = this.numbers[i];
      n.life -= dt;
      n.y -= 34 * dt;
      if (n.life <= 0) this.numbers.splice(i, 1);
    }
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      this.ghosts[i].life -= dt;
      if (this.ghosts[i].life <= 0) this.ghosts.splice(i, 1);
    }
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      this.flashes[i].life -= dt;
      if (this.flashes[i].life <= 0) this.flashes.splice(i, 1);
    }
  }

  // ---------------------------------------------------------------- draw
  draw(ctx, font) {
    // fantasmas de dash (aditivo-ish via alpha)
    for (const g of this.ghosts) {
      const sprite = g._sprite || (g._sprite = lazyGet(g.kind, g.anim, g.frame));
      ctx.save();
      ctx.globalAlpha = Math.max(0, g.life / 0.25) * 0.4;
      if (g.flip) {
        ctx.translate(g.x + sprite.width, g.y);
        ctx.scale(-1, 1);
        ctx.drawImage(sprite, 0, 0);
      } else {
        ctx.drawImage(sprite, g.x, g.y);
      }
      ctx.restore();
    }
    // partículas
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
    // números de dano
    for (const n of this.numbers) {
      ctx.globalAlpha = Math.min(1, n.life / 0.3);
      font.draw(ctx, n.text, Math.round(n.x), Math.round(n.y), n.color, 1, true);
    }
    ctx.globalAlpha = 1;
  }
}

// Evita import circular com SpriteFactory: resolve preguiçosamente.
let lazyGet = null;
export function bindSpriteGetter(fn) {
  lazyGet = fn;
}
