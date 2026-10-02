// =============================================================================
// Boss.js — Shogun Poodle (boss final, fase 2). Três fases de comportamento:
//  1) investida com a espada gigante
//  2) invoca cães samurai + chuva de raios
//  3) ataque giratório + queda do teto com onda de choque
// Fica vulnerável (stagger) após receber vários acertos.
// =============================================================================

import { Enemy } from './Enemy.js';
import { EnemyDog } from './EnemyDog.js';
import { Lightning } from './Lightning.js';

export class Boss extends Enemy {
  constructor(kind, x, y, level) {
    super(kind, x, y, level);
    this.active = false;
    this.nextAction = 'charge';
    this.summoned = 0;
    this.boltTimer = 0;
    this.boltsLeft = 0;
    this.staggerHits = 0;
    this.homeX = x;
  }

  get phase() {
    const f = this.hp / this.def.hp;
    if (f > 0.66) return 1;
    if (f > 0.33) return 2;
    return 3;
  }

  takeHit(dmg, game, fromX, stomp) {
    if (this.dead || !this.active) return;
    super.takeHit(dmg, game, fromX, stomp);
    if (this.dead) { game.onBossDefeated(this); return; }
    // vulnerável após acertos suficientes
    this.staggerHits++;
    if (this.staggerHits >= 6 && this.state !== 'stagger') {
      this.staggerHits = 0;
      this.setState('stagger');
    }
  }

  update(dt, game) {
    super.update(dt, game);
    if (this.dead) return;

    // ativa quando o jogador entra na arena
    if (!this.active) {
      this.setAnim('idle', dt);
      if (Math.abs(game.player.cx - this.cx) < 120) {
        this.active = true;
        game.onBossActivate(this);
      }
      return;
    }

    this.stateT += dt;
    const { dx } = this.distToPlayer(game);

    switch (this.state) {
      case 'idle': {
        this.vx = Math.sign(dx) * this.def.speed * 0.5;
        this.facing = dx > 0 ? 1 : -1;
        this.setAnim('idle', dt);
        if (this.stateT > 0.9) this.chooseAction(game);
        break;
      }
      case 'telegraph': {
        this.vx = 0;
        this.facing = dx > 0 ? 1 : -1;
        this.setAnim('attack', dt);
        this.frame = 1; // ergue a espada
        if (this.stateT > 0.5) { this.setState(this.nextAction); this.onActionStart(game); }
        break;
      }
      case 'charge': {
        this.vx = this.facing * this.def.speed * 3;
        this.setAnim('attack', dt);
        this.frame = 2;
        if (Math.random() < 0.4) game.fx.dust(this.cx, this.y + this.h, 1, this.facing);
        if (this.stateT > 0.7 || this.wallDir !== 0) {
          if (this.wallDir !== 0) { game.camera.shake(5, 0.25); game.fx.burst(this.cx, this.cy, '#90a4ae', 8, 120, 0.4, 400); }
          this.setState('idle');
        }
        break;
      }
      case 'summon': {
        this.vx = 0;
        this.setAnim('attack', dt);
        if (this.stateT > 0.4 && this.summoned < 2) {
          this.summoned = 2;
          game.spawnEnemy(new EnemyDog('dog', this.x - 40, this.y, this.level));
          game.spawnEnemy(new EnemyDog('dog', this.x + 60, this.y, this.level));
          game.audio.play('bossRoar');
          game.fx.burst(this.cx, this.cy, '#c62828', 12, 150, 0.5, 400);
        }
        if (this.stateT > 1.0) { this.summoned = 0; this.setState('idle'); }
        break;
      }
      case 'bolts': {
        this.vx = 0;
        this.setAnim('attack', dt);
        this.boltTimer -= dt;
        if (this.boltsLeft > 0 && this.boltTimer <= 0) {
          this.boltTimer = 0.4;
          this.boltsLeft--;
          game.spawnLightning(new Lightning(game.player.cx + (Math.random() * 60 - 30), 0, game.player.y + 40));
        }
        if (this.boltsLeft <= 0 && this.stateT > 1.6) this.setState('idle');
        break;
      }
      case 'spin': {
        this.vx = Math.sign(dx) * this.def.speed * 2.2;
        this.setAnim('spin', dt);
        if (Math.random() < 0.5) game.fx.dust(this.cx, this.y + this.h, 1, 0);
        if (this.stateT > 1.4) this.setState('stagger');
        break;
      }
      case 'drop': {
        if (this.stateT < 0.02) { this.vy = -520; this.vx = Math.sign(dx) * 120; }
        this.setAnim('idle', dt);
        if (this.vy > 0 && this.onGround && this.stateT > 0.2) {
          // onda de choque
          game.camera.shake(6, 0.35);
          game.audio.play('explode');
          game.fx.burst(this.cx, this.y + this.h, '#ffeb3b', 16, 200, 0.5, 300, 2);
          const p = game.player;
          if (p.onGround && Math.abs(p.cx - this.cx) < 70) p.damage(1, game);
          this.setState('idle');
        }
        break;
      }
      case 'stagger': {
        this.vx = 0;
        this.setAnim('stagger', dt);
        if (this.stateT > 0.9) this.setState('idle');
        break;
      }
    }

    this.gravity(dt);
    this.physics.move(this, dt);
  }

  chooseAction(game) {
    const { dx } = this.distToPlayer(game);
    if (this.phase === 1) {
      this.nextAction = 'charge';
    } else if (this.phase === 2) {
      this.nextAction = (this.summoned === 0 && game.enemies.filter((e) => e.kind === 'dog' && !e.dead).length < 2) ? 'summon' : 'bolts';
    } else {
      this.nextAction = Math.abs(dx) > 60 ? 'spin' : 'drop';
    }
    this.setState('telegraph');
  }

  onActionStart(game) {
    if (this.nextAction === 'bolts') { this.boltsLeft = 3; this.boltTimer = 0; }
    if (this.nextAction === 'drop') this.vy = 0;
  }
}
