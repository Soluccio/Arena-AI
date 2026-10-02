// =============================================================================
// Player.js — Belisco: corrida com aceleração/atrito, pulo variável com coyote
// time e jump buffer, wall slide/wall jump, dash com i-frames e fantasmas,
// squash & stretch e máquina de estados de animação.
// =============================================================================

import { Entity } from './Entity.js';
import { Physics } from '../core/Physics.js';
import * as C from '../data/constants.js';
import { animDef } from '../data/animations.js';
import * as SpriteFactory from '../sprites/SpriteFactory.js';
import { startAttack, updateAttack } from './PlayerAttack.js';

export class Player extends Entity {
  constructor(level, spawn) {
    super(spawn.x, spawn.y, 12, 15);
    this.physics = new Physics(level);
    this.reset(spawn);
  }

  reset(spawn) {
    this.x = spawn.x;
    this.y = spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.hp = C.START_LIVES;
    this.facing = 1;
    this.dead = false;
    this.deathT = 0;

    this.coyote = 0;
    this.jumpBuffer = 0;
    this.jumpHeld = false;

    this.wallLock = 0;
    this.sliding = false;

    this.dashT = 0;
    this.dashCd = 0;
    this.dashDir = 1;

    this.iframes = 0;
    this.sx = 1;
    this.sy = 1;
    this.landT = 0;
    this.fallSpeed = 0;

    this.anim = 'idle';
    this.frame = 0;
    this.animT = 0;

    this.attacking = false;
    this.attackFrame = 0;
    this.attackT = 0;
    this.swingId = 0;
    this.attackHitSet = new Set();
  }

  get invulnerable() {
    return this.iframes > 0 || this.dashT > 0;
  }

  /** Aplica dano (chamado pelo Combat / hazards). */
  damage(n, game) {
    if (this.invulnerable || this.dead) return false;
    this.hp -= n;
    this.iframes = C.HURT_IFRAMES;
    game.audio.play('hurt');
    game.fx.burst(this.cx, this.cy, '#ff8fa3', 10, 120, 0.5, 400);
    game.camera.shake(C.SHAKE_HIT, 0.3);
    if (this.hp <= 0) this.die(game);
    return true;
  }

  die(game) {
    if (this.dead) return;
    this.dead = true;
    this.deathT = 0;
    this.vy = -260;
    game.audio.play('playerDie');
    game.fx.burst(this.cx, this.cy, '#c62828', 16, 160, 0.8, 500);
  }

  update(dt, game) {
    this.time += dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;
    if (this.iframes > 0) this.iframes -= dt;
    if (this.dashCd > 0) this.dashCd -= dt;
    if (this.wallLock > 0) this.wallLock -= dt;
    if (this.landT > 0) this.landT -= dt;

    const input = game.input;

    // ------------------------------ morte ------------------------------
    if (this.dead) {
      this.deathT += dt;
      this.vy += C.GRAVITY * dt;
      this.y += this.vy * dt;
      this.setAnim('death', dt);
      return;
    }

    // ------------------------------ input dir ------------------------------
    let dir = 0;
    if (input.heldQ('left')) dir -= 1;
    if (input.heldQ('right')) dir += 1;

    // ------------------------------ ataque ------------------------------
    if (input.pressed('attack') && this.dashT <= 0) startAttack(this, game);
    updateAttack(this, dt, game);

    // ------------------------------ dash ------------------------------
    if (input.pressed('dash') && this.dashCd <= 0 && this.dashT <= 0) {
      this.dashT = C.DASH_TIME;
      this.dashCd = C.DASH_COOLDOWN;
      this.dashDir = dir !== 0 ? dir : this.facing;
      this.vy = 0;
      game.audio.play('dash');
      game.camera.shake(C.SHAKE_DASH, 0.15);
    }

    if (this.dashT > 0) {
      this.dashT -= dt;
      this.vx = this.dashDir * C.DASH_SPEED;
      this.vy = 0;
      game.fx.ghost('cat', 'dash', this.frame, this.x - 6, this.y - 9, this.facing < 0);
      this.physics.move(this, dt);
    } else {
      this.controlledMove(dir, dt, input, game);
    }

    // atualiza facing (fora do dash/ataque travado)
    if (this.dashT <= 0 && this.wallLock <= 0 && dir !== 0 && !this.attacking) this.facing = dir;

    // ------------------------------ squash & stretch ------------------------------
    const targetSx = this.landT > 0 ? 1.25 : this.dashT > 0 ? 1.3 : this.stretched ? 0.85 : 1;
    const targetSy = this.landT > 0 ? 0.75 : this.dashT > 0 ? 0.7 : this.stretched ? 1.15 : 1;
    this.sx += (targetSx - this.sx) * Math.min(1, dt * 20);
    this.sy += (targetSy - this.sy) * Math.min(1, dt * 20);

    // ------------------------------ hazards / queda ------------------------------
    if (game.level.hazardAt(this.x, this.y, this.w, this.h)) this.damage(1, game);
    if (this.y > game.level.pixelH + 60) {
      this.damage(1, game);
      game.respawnPlayer();
    }

    // ------------------------------ animação ------------------------------
    this.chooseAnim(dt);

    // poeira ao correr
    if (this.onGround && Math.abs(this.vx) > 100 && Math.random() < 0.2) {
      game.fx.dust(this.cx, this.y + this.h, 1, this.facing);
    }
  }

  /** Movimento com aceleração + pulo + parede. */
  controlledMove(dir, dt, input, game) {
    const accel = this.onGround ? C.RUN_ACCEL : C.AIR_ACCEL;
    const fric = this.onGround ? C.RUN_FRICTION : C.AIR_FRICTION;

    if (dir !== 0 && this.wallLock <= 0) {
      const boost = (dir !== Math.sign(this.vx) && this.vx !== 0) ? C.TURN_BOOST : 1;
      this.vx += dir * accel * boost * dt;
      this.vx = Math.max(-C.MAX_RUN, Math.min(C.MAX_RUN, this.vx));
    } else {
      const s = Math.sign(this.vx);
      this.vx -= s * fric * dt;
      if (Math.sign(this.vx) !== s) this.vx = 0;
    }

    // ---- timers de pulo ----
    this.coyote = this.onGround ? C.COYOTE_TIME : this.coyote - dt;
    this.jumpBuffer = input.pressed('jump') ? C.JUMP_BUFFER : this.jumpBuffer - dt;

    // ---- pulo normal ----
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      this.vy = -C.JUMP_VELOCITY;
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.stretched = true;
      game.audio.play('jump');
      game.fx.dust(this.cx, this.y + this.h, 3, 0);
    }
    // ---- wall jump ----
    else if (this.jumpBuffer > 0 && !this.onGround && this.wallDir !== 0) {
      this.vy = -C.WALL_JUMP_Y;
      this.vx = -this.wallDir * C.WALL_JUMP_X;
      this.facing = -this.wallDir;
      this.wallLock = C.WALL_STICK_TIME;
      this.jumpBuffer = 0;
      this.stretched = true;
      game.audio.play('walljump');
      game.fx.wallDust(this.cx + this.wallDir * 6, this.cy);
    }

    // ---- pulo variável (soltar corta) ----
    const held = input.heldQ('jump');
    if (!held && this.vy < 0 && this.jumpHeld) this.vy *= C.JUMP_CUT;
    this.jumpHeld = held;
    if (this.onGround) this.stretched = false;

    // ---- gravidade + wall slide ----
    let g = C.GRAVITY;
    if (held && this.vy < 0) g *= C.GRAVITY_LOW;
    this.vy += g * dt;

    this.sliding = false;
    if (!this.onGround && this.vy > 0 && this.wallDir !== 0 && this.wallLock <= 0) {
      const pushing = (this.wallDir === 1 && input.heldQ('right')) || (this.wallDir === -1 && input.heldQ('left'));
      if (pushing) {
        this.vy = Math.min(this.vy, C.WALL_SLIDE_SPEED);
        this.sliding = true;
        if (Math.random() < 0.4) game.fx.wallDust(this.cx + this.wallDir * 6, this.cy);
      }
    }
    this.vy = Math.min(this.vy, C.MAX_FALL);

    // ---- registra velocidade de queda p/ aterrissagem ----
    this.fallSpeed = this.vy;
    this.physics.move(this, dt);

    // ---- aterrissagem: squash + shake se queda alta ----
    if (this.onGround && !this.onGroundPrev) {
      this.landT = C.LAND_SQUASH;
      game.audio.play('land');
      game.fx.dust(this.cx, this.y + this.h, 4, 0);
      if (this.fallSpeed > 380) {
        game.camera.shake(C.SHAKE_LAND, 0.2);
        game.fx.dust(this.cx, this.y + this.h, 8, 0);
      }
    }
  }

  setAnim(name, dt) {
    if (name !== this.anim) {
      this.anim = name;
      this.frame = 0;
      this.animT = 0;
    }
    const def = animDef('cat', name);
    this.animT += dt;
    if (this.animT >= def.speed) {
      this.animT = 0;
      if (def.loop) this.frame = (this.frame + 1) % def.frames;
      else this.frame = Math.min(this.frame + 1, def.frames - 1);
    }
  }

  chooseAnim(dt) {
    let name = 'idle';
    if (this.attacking) name = 'attack';
    else if (this.dashT > 0) name = 'dash';
    else if (this.sliding) name = 'wallCling';
    else if (!this.onGround) name = 'jump';
    else if (Math.abs(this.vx) > 20) name = 'run';
    if (this.iframes > 0 && this.iframes > C.HURT_IFRAMES - 0.3) name = 'hurt';
    // frame do jump: 0 subindo, 1 descendo
    if (name === 'jump') this.frame = this.vy < 0 ? 0 : 1;
    else this.setAnim(name, dt);
    if (name === 'jump') this.anim = 'jump';
  }

  draw(ctx, game) {
    const sprite = SpriteFactory.get('cat', this.anim, this.frame);
    ctx.save();
    ctx.translate(Math.round(this.x + this.w / 2), Math.round(this.y + this.h));
    ctx.scale(this.facing * this.sx, this.sy);
    if (this.iframes > 0 && !this.dead && Math.floor(this.time * 18) % 2 === 0) ctx.globalAlpha = 0.45;
    ctx.drawImage(sprite, -12, -23);
    if (this.flashTimer > 0) {
      ctx.globalAlpha = 0.6;
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(sprite, -12, -23);
    }
    ctx.restore();
  }
}
