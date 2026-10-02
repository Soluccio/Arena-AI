// =============================================================================
// Enemy.js — Classe base de inimigos: gravidade, patrulha, dano, flash, morte
// com freeze-frame e pontuação. A IA específica fica em `think()`.
// =============================================================================

import { Entity } from './Entity.js';
import { Physics } from '../core/Physics.js';
import { enemyDef } from '../data/enemies.js';
import { animDef } from '../data/animations.js';
import { GRAVITY, MAX_FALL } from '../data/constants.js';

export class Enemy extends Entity {
  constructor(kind, x, y, level) {
    const def = enemyDef(kind);
    super(x, y, def.w, def.h);
    this.kind = kind;
    this.def = def;
    this.spriteKind = def.sprite;
    this.hp = def.hp;
    this.level = level;
    this.physics = new Physics(level);
    this.state = 'patrol';
    this.stateT = 0;
    this.dir = Math.random() < 0.5 ? -1 : 1;
    this.anim = 'idle';
    this.frame = 0;
    this.animT = 0;
    this.cool = def.throwCooldown || def.shootCooldown || def.jumpCooldown || 1;
    this.deadT = 0;
  }

  setState(name) {
    this.state = name;
    this.stateT = 0;
  }

  distToPlayer(game) {
    const p = game.player;
    return { dx: p.cx - this.cx, dy: p.cy - this.cy, dist: Math.hypot(p.cx - this.cx, p.cy - this.cy) };
  }

  playerNear(game, range) {
    const { dx, dy } = this.distToPlayer(game);
    return Math.abs(dx) < range && Math.abs(dy) < 48 && !game.player.dead;
  }

  gravity(dt) {
    this.vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL);
  }

  /** Vira de direção ao chegar numa borda ou parede (patrulha). */
  patrolTurn(game) {
    const ahead = this.dir;
    const footX = this.dir > 0 ? this.x + this.w + 2 : this.x - 2;
    const hasGround = this.level.solidAtPx(footX, this.y + this.h + 4);
    if (this.wallDir !== 0 || (this.onGround && !hasGround)) this.dir = -ahead;
  }

  /** Recebe dano da espada / pulo do jogador. */
  takeHit(dmg, game, fromX = this.cx, stomp = false) {
    if (this.dead) return;
    this.hp -= dmg;
    this.flash();
    game.fx.dmgNumber(this.cx, this.y - 6, dmg);
    game.fx.sparkMetal(this.cx, this.cy, fromX < this.cx ? 1 : -1);
    game.audio.play(this.def.isBoss ? 'bossHit' : 'clang');
    game.hitStop = Math.max(game.hitStop, stomp ? 0.03 : 0.04);
    this.vx += (this.cx > fromX ? 1 : -1) * (stomp ? 0 : 90);
    if (this.hp <= 0) this.die(game);
  }

  die(game) {
    if (this.dead) return;
    this.dead = true;
    game.onEnemyKilled(this);
  }

  setAnim(name, dt) {
    if (name !== this.anim) { this.anim = name; this.frame = 0; this.animT = 0; }
    const def = animDef(this.spriteKind, name);
    this.animT += dt;
    if (this.animT >= def.speed) {
      this.animT = 0;
      if (def.loop) this.frame = (this.frame + 1) % def.frames;
      else this.frame = Math.min(this.frame + 1, def.frames - 1);
    }
  }

  /** Subclasses sobrescrevem com a IA. */
  think(dt, game) { }

  update(dt, game) {
    super.update(dt, game);
    if (this.dead) return;
    this.stateT += dt;
    this.think(dt, game);
  }

  draw(ctx, game) {
    const { get } = game.sprites;
    const sprite = get(this.spriteKind, this.anim, this.frame);
    this.drawSprite(ctx, sprite);
  }
}
