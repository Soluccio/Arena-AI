// =============================================================================
// Physics.js — Gravidade + colisão AABB contra a tilemap (tile a tile).
// Padrão clássico: move X, resolve X; move Y, resolve Y. Plataformas one-way
// (id 2) só seguram a queda quando os pés estavam acima no frame anterior.
// =============================================================================

export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Centro de um corpo {x,y,w,h}. */
export function center(b) {
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

export class Physics {
  constructor(level) {
    this.level = level;
  }

  /** Lista de retângulos sólidos extras (plataformas que caem etc.). */
  extraSolids(body) {
    return this.level.platformRects(body);
  }

  /** Move um corpo aplicando velocidade e resolvendo colisões. */
  move(body, dt) {
    body.onGroundPrev = body.onGround;
    body.onGround = false;
    body.hitCeiling = false;
    body.wallDir = 0;

    // ---------------- Eixo X ----------------
    body.x += body.vx * dt;
    this.resolveX(body);

    // ---------------- Eixo Y ----------------
    const prevBottom = body.y + body.h;
    body.y += body.vy * dt;
    this.resolveY(body, prevBottom);
  }

  isSolidRect(r) {
    return this.level.solidRect(r.x, r.y, r.w, r.h);
  }

  resolveX(body) {
    if (body.vx > 0) {
      const edge = body.x + body.w;
      if (this.solidAtEdge(edge, body.y, body.h) || this.extraHits(edge, body.y, body.h, true)) {
        body.x = Math.floor(edge / this.level.tile) * this.level.tile - body.w - 0.01;
        body.wallDir = 1;
        body.vx = Math.min(body.vx, 0);
      }
    } else if (body.vx < 0) {
      if (this.solidAtEdge(body.x, body.y, body.h) || this.extraHits(body.x, body.y, body.h, false)) {
        body.x = (Math.floor(body.x / this.level.tile) + 1) * this.level.tile + 0.01;
        body.wallDir = -1;
        body.vx = Math.max(body.vx, 0);
      }
    }
    // parede grudada (para wall slide mesmo sem vx)
    if (body.wallDir === 0) {
      if (this.solidAtEdge(body.x + body.w + 0.5, body.y, body.h)) body.wallDir = 1;
      else if (this.solidAtEdge(body.x - 0.5, body.y, body.h)) body.wallDir = -1;
    }
  }

  solidAtEdge(x, y, h) {
    const t = this.level.tile;
    const top = this.level.solidAtPx(x, y + 2);
    const mid = this.level.solidAtPx(x, y + h / 2);
    const bot = this.level.solidAtPx(x, y + h - 2);
    return top || mid || bot ? Math.floor(x / t) : null;
  }

  extraHits(x, y, h, rightSide) {
    for (const r of this.extraSolids({ x, y, w: 1, h })) {
      if (rightSide ? x >= r.x - 0.5 && x <= r.x + r.w : x <= r.x + r.w + 0.5 && x >= r.x) {
        if (y + h > r.y + 2 && y < r.y + r.h - 2) return true;
      }
    }
    return false;
  }

  resolveY(body, prevBottom) {
    const t = this.level.tile;
    if (body.vy > 0) {
      const bottom = body.y + body.h;
      const ty = Math.floor(bottom / t);
      const x0 = Math.floor((body.x + 1) / t);
      const x1 = Math.floor((body.x + body.w - 1) / t);
      let landed = false;
      for (let tx = x0; tx <= x1; tx++) {
        const id = this.level.tileAt(tx, ty);
        const isSolid = this.level.isSolid(id);
        const oneWay = this.level.isOneWay(id);
        if ((isSolid || (oneWay && prevBottom <= ty * t + 1 && !body.dropThrough)) && bottom >= ty * t) {
          landed = true;
          break;
        }
      }
      // plataformas móveis
      if (!landed) {
        for (const r of this.extraSolids(body)) {
          if (prevBottom <= r.y + 1 && bottom >= r.y && body.x + body.w > r.x + 1 && body.x < r.x + r.w - 1) {
            body.y = r.y - body.h;
            body.vy = 0;
            body.onGround = true;
            return;
          }
        }
      }
      if (landed) {
        body.y = ty * t - body.h;
        body.vy = 0;
        body.onGround = true;
      }
    } else if (body.vy < 0) {
      const ty = Math.floor(body.y / t);
      const x0 = Math.floor((body.x + 1) / t);
      const x1 = Math.floor((body.x + body.w - 1) / t);
      for (let tx = x0; tx <= x1; tx++) {
        if (this.level.isSolid(this.level.tileAt(tx, ty))) {
          body.y = (ty + 1) * t + 0.01;
          body.vy = 0;
          body.hitCeiling = true;
          break;
        }
      }
    }
  }

  /** Consulta rápida: o corpo está tocando o chão logo abaixo? */
  groundBelow(body) {
    const t = this.level.tile;
    const ty = Math.floor((body.y + body.h + 1) / t);
    const x0 = Math.floor((body.x + 1) / t);
    const x1 = Math.floor((body.x + body.w - 1) / t);
    for (let tx = x0; tx <= x1; tx++) {
      const id = this.level.tileAt(tx, ty);
      if (this.level.isSolid(id) || this.level.isOneWay(id)) return true;
    }
    return false;
  }
}
