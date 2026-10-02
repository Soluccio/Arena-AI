// =============================================================================
// Game.js — Loop principal (passo fixo 60fps), máquina de estados e orquestração
// de todos os sistemas. Hit-stop e freeze-frame congelam o mundo mas não as FX.
// =============================================================================

import * as C from '../data/constants.js';
import { Input } from './Input.js';
import { AudioEngine } from './Audio.js';
import { Music } from './Music.js';
import { FX, bindSpriteGetter } from './FX.js';
import { Camera } from './Camera.js';
import { Combat } from './Combat.js';
import { TileMap } from '../levels/TileMap.js';
import { Background } from '../levels/Background.js';
import { LEVEL1 } from '../levels/Level1.js';
import { LEVEL2 } from '../levels/Level2.js';
import * as SpriteFactory from '../sprites/SpriteFactory.js';
import { font } from '../ui/PixelFont.js';
import { Player } from '../entities/Player.js';
import { EnemyDog } from '../entities/EnemyDog.js';
import { EnemyRat } from '../entities/EnemyRat.js';
import { EnemyFrog } from '../entities/EnemyFrog.js';
import { EnemyArcher } from '../entities/EnemyArcher.js';
import { EnemyBomber } from '../entities/EnemyBomber.js';
import { Boss } from '../entities/Boss.js';
import { BossMini } from '../entities/BossMini.js';
import { Platform } from '../entities/Platform.js';
import { Collectible } from '../entities/Collectible.js';
import { Checkpoint } from '../entities/Checkpoint.js';
import { Door } from '../entities/Door.js';
import { Lightning } from '../entities/Lightning.js';
import { HUD } from '../ui/HUD.js';
import { Menu } from '../ui/Menu.js';
import { Pause } from '../ui/Pause.js';
import { GameOver } from '../ui/GameOver.js';
import { Transitions } from '../ui/Transitions.js';

const LEVELS = [LEVEL1, LEVEL2];
const ENEMY_CTOR = { d: EnemyDog, r: EnemyRat, f: EnemyFrog, a: EnemyArcher, b: EnemyBomber };

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.input = new Input();
    this.audio = new AudioEngine();
    this.music = new Music(this.audio);
    this.fx = new FX();
    this.camera = new Camera();
    this.combat = new Combat(this);
    this.sprites = SpriteFactory;
    this.font = font;
    this.background = new Background();
    bindSpriteGetter((k, a, f) => SpriteFactory.get(k, a, f));

    this.input.onFirstGesture = () => { this.audio.resume(); this.music.start(); };

    this.hud = new HUD(this);
    this.menu = new Menu(this);
    this.pause = new Pause(this);
    this.gameover = new GameOver(this);
    this.transitions = new Transitions(this);

    this.state = 'menu';
    this.stats = this.freshStats();
    this.freeze = 0;
    this.hitStop = 0;
    this.lightningTimer = 3;
    this.boss = null;

    SpriteFactory.preload();
    this.loadSave();
  }

  freshStats() {
    return { coins: 0, score: 0, kills: 0 };
  }

  loadSave() {
    try {
      const raw = localStorage.getItem(C.SAVE_KEY);
      this.save = raw ? JSON.parse(raw) : { unlocked: 0, checkpoints: {} };
    } catch {
      this.save = { unlocked: 0, checkpoints: {} };
    }
  }

  persist() {
    try { localStorage.setItem(C.SAVE_KEY, JSON.stringify(this.save)); } catch { /* sem storage */ }
  }

  // --------------------------------------------------------------- ciclo de vida
  startLevel(index, fromCheckpoint = true) {
    const data = LEVELS[index];
    this.levelIndex = index;
    this.level = new TileMap(data.rows);
    this.theme = data.theme;
    this.background = new Background();

    this.enemies = [];
    this.projectiles = [];
    this.lightnings = [];
    this.collectibles = [];
    this.checkpoints = [];
    this.platforms = [];
    this.doors = [];
    this.boss = null;

    for (const s of this.level.spawns) this.spawnFromCode(s);
    this.level.platforms = this.platforms;

    const cp = fromCheckpoint && this.save.checkpoints[index];
    const spawn = cp ? { x: cp.x, y: cp.y } : this.level.playerSpawn;
    this.player = new Player(this.level, spawn);
    if (cp) {
      const c = this.checkpoints.find((k) => Math.abs(k.x - cp.x) < 24);
      if (c) c.active = true;
    }
    this.checkpointPos = cp || null;

    this.camera.setBounds(this.level.pixelW, this.level.pixelH);
    this.camera.setZoomMode(false);
    this.camera.snap(this.player.cx, this.player.cy);

    this.stats = this.freshStats();
    this.freeze = 0;
    this.hitStop = 0;
    this.state = 'play';
    this.music.setIntensity(false);
  }

  spawnFromCode(s) {
    const x = s.tx * C.TILE;
    const y = s.ty * C.TILE;
    const Ctor = ENEMY_CTOR[s.kind];
    if (Ctor) this.enemies.push(new Ctor(s.kind, x, y - 2, this.level));
    else if (s.kind === 'M') this.enemies.push(new BossMini('mini', x, y - 8, this.level));
    else if (s.kind === 'B') this.enemies.push(new Boss('poodle', x, y - 8, this.level));
    else if (s.kind === 'F') this.platforms.push(new Platform(x, y, this.theme));
    else if (s.kind === 'o' || s.kind === 'i' || s.kind === 'h') this.collectibles.push(new Collectible({ o: 'coin', i: 'fish', h: 'heart' }[s.kind], x + 2, y + 2));
    else if (s.kind === 'C') this.checkpoints.push(new Checkpoint(x, y));
    else if (s.kind === 'D') this.doors.push(new Door(x, y));
  }

  // --------------------------------------------------------------- callbacks de entidades
  addProjectile(p) { this.projectiles.push(p); return p; }
  spawnEnemy(e) { this.enemies.push(e); }
  spawnLightning(l) { this.lightnings.push(l); }

  registerComboHit() {
    this.comboCount = (this.comboCount || 0) + 1;
    this.comboTimer = C.COMBO_WINDOW;
    if (this.comboCount >= C.COMBO_HITS) {
      this.comboCount = 0;
      this.stats.score += C.COMBO_BONUS;
      this.audio.play('combo');
      this.fx.dmgNumber(this.player.cx, this.player.y - 14, 'COMBO!', '#ffeb3b');
    }
  }

  onEnemyKilled(e) {
    this.stats.kills++;
    this.stats.score += e.def.score;
    this.freeze = Math.max(this.freeze, C.KILL_FREEZE);
    this.camera.shake(C.SHAKE_KILL, 0.25);
    this.audio.play('enemyDie');
    this.fx.burst(e.cx, e.cy, '#ffffff', 12, 140, 0.5, 400);
  }

  onBossActivate(b) {
    this.boss = b;
    this.camera.setZoomMode(true);
    this.audio.play('bossRoar');
    this.music.setIntensity(true);
  }

  onBossDefeated(b) {
    this.boss = null;
    this.freeze = 0.3;
    this.camera.shake(8, 0.5);
    this.camera.setZoomMode(false);
    this.audio.play('explode');
    this.fx.burst(b.cx, b.cy, '#ffeb3b', 24, 220, 0.9, 400, 3);
    this.music.setIntensity(false);
  }

  activateCheckpoint(cp) {
    this.checkpoints.forEach((c) => { c.active = c === cp; });
    this.checkpointPos = { x: cp.x, y: cp.y };
    this.save.checkpoints[this.levelIndex] = this.checkpointPos;
    this.persist();
    this.audio.play('checkpoint');
    this.fx.burst(cp.cx, cp.cy, '#ffeb3b', 10, 100, 0.6, 200);
  }

  respawnPlayer() {
    const p = this.checkpointPos || this.level.playerSpawn;
    this.player.x = p.x;
    this.player.y = p.y - 2;
    this.player.vx = 0;
    this.player.vy = 0;
    this.camera.snap(this.player.cx, this.player.cy);
  }

  finishLevel() {
    this.save.unlocked = Math.max(this.save.unlocked, this.levelIndex + 1);
    delete this.save.checkpoints[this.levelIndex];
    this.persist();
    this.transitions.start(this.levelIndex, () => {
      if (this.levelIndex === 0) this.startLevel(1);
      else this.state = 'win';
    });
    this.state = 'transition';
  }

  // --------------------------------------------------------------- loop
  frame(t) {
    if (!this.last) this.last = t;
    const dt = Math.min(C.MAX_DT, (t - this.last) / 1000);
    this.last = t;
    this.acc = (this.acc || 0) + dt;
    while (this.acc >= C.FIXED_DT) {
      this.step(C.FIXED_DT);
      this.acc -= C.FIXED_DT;
    }
    this.render();
  }

  step(dt) {
    this.audio.ready && this.music.update();

    if (this.state === 'play') {
      if (this.input.pressed('pause')) { this.state = 'pause'; this.audio.play('uiMove'); }
      else if (this.input.pressed('restart')) this.startLevel(this.levelIndex);
      else this.updatePlay(dt);
    } else if (this.state === 'pause') {
      this.pause.update(dt);
    } else if (this.state === 'menu') {
      this.menu.update(dt);
    } else if (this.state === 'gameover') {
      this.gameover.update(dt);
    } else if (this.state === 'transition') {
      this.transitions.update(dt);
    } else if (this.state === 'win') {
      if (this.input.pressed('confirm')) this.state = 'menu';
    }
    this.input.endFrame();
  }

  updatePlay(dt) {
    // hit-stop / freeze: congela o mundo, mantém FX e shake
    if (this.hitStop > 0) { this.hitStop -= dt; this.fx.update(dt); this.camera.update(dt, this.player); return; }
    if (this.freeze > 0) { this.freeze -= dt; this.fx.update(dt); this.camera.update(dt, this.player); return; }

    if (this.comboTimer > 0) { this.comboTimer -= dt; if (this.comboTimer <= 0) this.comboCount = 0; }

    // raios ambientes da fase 2
    if (this.theme === 'thunder') {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.lightningTimer = 3 + Math.random() * 3;
        const xs = this.level.lightningXs.filter((x) => Math.abs(x - this.player.cx) < 240);
        if (xs.length) {
          const x = xs[Math.floor(Math.random() * xs.length)];
          this.spawnLightning(new Lightning(x, 0, this.player.y + 60));
        }
      }
    }

    this.player.update(dt, this);
    for (const e of this.enemies) e.update(dt, this);
    for (const p of this.platforms) p.update(dt, this);
    for (const c of this.collectibles) c.update(dt, this);
    for (const c of this.checkpoints) c.update(dt, this);
    for (const d of this.doors) d.update(dt, this);
    for (const pr of this.projectiles) pr.update(dt, this);
    for (const l of this.lightnings) l.update(dt, this);

    // contatos
    for (const e of this.enemies) if (!e.dead) this.combat.enemyContact(e);
    for (const pr of this.projectiles) if (!pr.dead) this.combat.projectileContact(pr);

    // limpa mortos
    this.enemies = this.enemies.filter((e) => !e.dead);
    this.projectiles = this.projectiles.filter((p) => !p.dead);
    this.lightnings = this.lightnings.filter((l) => !l.dead);
    this.collectibles = this.collectibles.filter((c) => !c.dead);

    this.fx.update(dt);
    this.camera.update(dt, this.player);

    // intensidade da música por proximidade de inimigos
    const hot = this.enemies.some((e) => !e.dead && !e.def.isBoss && Math.abs(e.cx - this.player.cx) < 200);
    this.music.setIntensity(hot || Boolean(this.boss));

    // morte do jogador -> game over
    if (this.player.dead && this.player.deathT > 1.4) this.state = 'gameover';
  }

  // --------------------------------------------------------------- render
  render() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, C.VIEW_W, C.VIEW_H);

    if (this.state === 'menu') { this.menu.draw(ctx); return; }

    const time = performance.now() / 1000;
    this.background.draw(ctx, this.camera, this.theme, time);

    this.camera.apply(ctx);
    this.level.draw(ctx, this.camera, (id, th, v) => SpriteFactory.getTile(id, th, v), this.theme);
    for (const p of this.platforms) p.draw(ctx, this);
    for (const c of this.checkpoints) c.draw(ctx, this);
    for (const d of this.doors) d.draw(ctx, this);
    for (const c of this.collectibles) c.draw(ctx, this);
    for (const e of this.enemies) e.draw(ctx, this);
    this.player.draw(ctx, this);
    for (const pr of this.projectiles) pr.draw(ctx, this);
    for (const l of this.lightnings) l.draw(ctx, this);
    this.fx.draw(ctx, this.font);
    this.camera.restore(ctx);

    if (this.state === 'play' || this.state === 'pause') this.hud.draw(ctx);
    if (this.state === 'pause') this.pause.draw(ctx);
    if (this.state === 'gameover') this.gameover.draw(ctx);
    if (this.state === 'transition') this.transitions.draw(ctx);
    if (this.state === 'win') this.drawWin(ctx);
  }

  drawWin(ctx) {
    ctx.fillStyle = 'rgba(10,10,22,0.85)';
    ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    font.draw(ctx, 'MISSAO CUMPRIDA!', C.VIEW_W / 2, 90, '#ffeb3b', 2, true);
    font.draw(ctx, 'O SINO DE JADE FOI RECUPERADO', C.VIEW_W / 2, 120, '#ffffff', 1, true);
    font.draw(ctx, `PONTOS ${this.stats.score}  MOEDAS ${this.stats.coins}`, C.VIEW_W / 2, 145, '#7fe3d4', 1, true);
    font.draw(ctx, 'ENTER PARA VOLTAR', C.VIEW_W / 2, 180, '#90a4ae', 1, true);
  }
}
