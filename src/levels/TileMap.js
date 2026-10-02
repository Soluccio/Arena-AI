// =============================================================================
// TileMap.js — Parser do tilemap descrito em strings (legível) e consultas de
// colisão/desenho. Legenda compartilhada pelas duas fases:
//   . vazio      # chão      = plataforma    ^ espinho    F plataforma que cai
//   P spawn      D porta     C checkpoint    Z bambu      T tocha   ~ nuvem
//   d cão        r rato      f sapo          a arqueiro   b bombardeiro
//   o moeda      i peixe     h coração       M mini-boss  B boss    L raio
// =============================================================================

import { TILE } from '../data/constants.js';

export const LEGEND = {
  '.': 0, '#': 1, '=': 2, '^': 3, D: 4, C: 5, d: 6, r: 7, f: 8, a: 9,
  b: 10, o: 11, i: 12, h: 13, F: 14, Z: 15, M: 16, B: 17, P: 18, X: 19,
  L: 20, '~': 21, T: 22,
};

// tiles que desenhamos no layer de cenário (os demais viram entidades)
export const ART_TILES = new Set([1, 2, 3, 15, 19, 21, 22]);

export class TileMap {
  constructor(rows) {
    this.tile = TILE;
    this.height = rows.length;
    this.width = Math.max(...rows.map((r) => r.length));
    this.grid = new Int16Array(this.width * this.height);
    this.spawns = [];          // {kind, tx, ty}
    this.playerSpawn = { x: 2 * TILE, y: 2 * TILE };
    this.platforms = [];       // entidades Platform registradas
    this.lightningXs = [];

    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const id = LEGEND[row[x]];
        if (id === undefined) {
          throw new Error(`TileMap: caractere inválido "${row[x]}" na linha ${y}, coluna ${x}`);
        }
        this.grid[y * this.width + x] = 0;
        if (ART_TILES.has(id)) {
          this.grid[y * this.width + x] = id;
        } else if (id !== 0) {
          this.spawns.push({ kind: row[x], tx: x, ty: y });
        }
        if (id === 18) this.playerSpawn = { x: x * TILE, y: y * TILE };
        if (id === 20) this.lightningXs.push(x * TILE + TILE / 2);
      }
    }
  }

  get pixelW() { return this.width * TILE; }
  get pixelH() { return this.height * TILE; }

  tileAt(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return 1; // fora = parede
    return this.grid[ty * this.width + tx];
  }

  isSolid(id) { return id === 1 || id === 19; }
  isOneWay(id) { return id === 2; }
  isHazard(id) { return id === 3; }

  solidAtPx(px, py) {
    return this.isSolid(this.tileAt(Math.floor(px / TILE), Math.floor(py / TILE)));
  }

  /** Algum tile sólido sob o retângulo? */
  solidRect(x, y, w, h) {
    const x0 = Math.floor(x / TILE);
    const x1 = Math.floor((x + w) / TILE);
    const y0 = Math.floor(y / TILE);
    const y1 = Math.floor((y + h) / TILE);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (this.isSolid(this.tileAt(tx, ty))) return true;
      }
    }
    return false;
  }

  /** Retângulos de plataformas móveis perto do corpo (para Física). */
  platformRects(body) {
    const out = [];
    for (const p of this.platforms) {
      if (p.solid && Math.abs((p.x + p.w / 2) - (body.x + body.w / 2)) < 80) {
        out.push({ x: p.x, y: p.y, w: p.w, h: p.h });
      }
    }
    return out;
  }

  /** Tile de espinho sob o corpo? (para dano) */
  hazardAt(x, y, w, h) {
    const x0 = Math.floor(x / TILE);
    const x1 = Math.floor((x + w) / TILE);
    const y0 = Math.floor(y / TILE);
    const y1 = Math.floor((y + h) / TILE);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (this.isHazard(this.tileAt(tx, ty))) {
          // só machuca a parte de baixo do tile de espinho
          const rect = { x: tx * TILE, y: ty * TILE + 6, w: TILE, h: TILE - 6 };
          if (x < rect.x + rect.w && x + w > rect.x && y < rect.y + rect.h && y + h > rect.y) return true;
        }
      }
    }
    return false;
  }

  /** Variante de textura determinística (sem RNG em runtime). */
  variantAt(tx, ty, id) {
    if (id === 1) return this.tileAt(tx, ty - 1) === 1 ? 1 + ((tx + ty) % 3 === 0 ? 2 : 0) : 0;
    return (tx * 7 + ty * 13) % 4;
  }

  /** Desenha apenas os tiles visíveis na view da câmera. */
  draw(ctx, cam, getTile, themeName) {
    const r = cam.viewRect();
    const x0 = Math.max(0, Math.floor(r.x / TILE));
    const x1 = Math.min(this.width - 1, Math.floor((r.x + r.w) / TILE));
    const y0 = Math.max(0, Math.floor(r.y / TILE));
    const y1 = Math.min(this.height - 1, Math.floor((r.y + r.h) / TILE));
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const id = this.grid[ty * this.width + tx];
        if (!id) continue;
        const canvas = getTile(id, themeName, this.variantAt(tx, ty, id));
        ctx.drawImage(canvas, tx * TILE, ty * TILE);
      }
    }
  }
}
