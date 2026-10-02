// =============================================================================
// Camera.js — Scroll com deadzone + lerp 0.15, limites do nível, zoom de boss
// e screen shake aplicado DEPOIS do lerp (como pede a especificação).
// =============================================================================

import { VIEW_W, VIEW_H, CAM_LERP, CAM_DEADZONE_X, CAM_DEADZONE_Y,
         CAM_ZOOM_BOSS, CAM_ZOOM_DEFAULT } from '../data/constants.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.zoom = CAM_ZOOM_DEFAULT;
    this.targetZoom = CAM_ZOOM_DEFAULT;
    this.shakeTime = 0;
    this.shakeMag = 0;
    this.bounds = { x: 0, y: 0, w: VIEW_W, h: VIEW_H };
  }

  /** Reposiciona de uma vez (início de fase / checkpoint). */
  snap(px, py) {
    const vw = VIEW_W / this.zoom;
    const vh = VIEW_H / this.zoom;
    this.x = this.clampX(px - vw / 2);
    this.y = this.clampY(py - vh / 2);
  }

  setBounds(w, h) {
    this.bounds = { x: 0, y: 0, w, h };
  }

  clampX(x) {
    const vw = VIEW_W / this.zoom;
    return Math.max(0, Math.min(x, Math.max(0, this.bounds.w - vw)));
  }

  clampY(y) {
    const vh = VIEW_H / this.zoom;
    return Math.max(0, Math.min(y, Math.max(0, this.bounds.h - vh)));
  }

  shake(mag, time = 0.25) {
    this.shakeMag = Math.max(this.shakeMag, mag);
    this.shakeTime = Math.max(this.shakeTime, time);
  }

  setZoomMode(boss) {
    this.targetZoom = boss ? CAM_ZOOM_BOSS : CAM_ZOOM_DEFAULT;
  }

  update(dt, target) {
    // zoom suave (levemente afastado durante o boss)
    this.zoom += (this.targetZoom - this.zoom) * Math.min(1, dt * 4);
    const vw = VIEW_W / this.zoom;
    const vh = VIEW_H / this.zoom;

    // deadzone: só segue quando o alvo sai da moldura central
    const cx = this.x + vw / 2;
    const cy = this.y + vh / 2;
    let tx = this.x;
    let ty = this.y;
    if (target.x < cx - CAM_DEADZONE_X) tx = target.x - vw / 2 + CAM_DEADZONE_X;
    else if (target.x > cx + CAM_DEADZONE_X) tx = target.x + vw / 2 - CAM_DEADZONE_X;
    if (target.y < cy - CAM_DEADZONE_Y) ty = target.y - vh / 2 + CAM_DEADZONE_Y;
    else if (target.y > cy + CAM_DEADZONE_Y) ty = target.y + vh / 2 - CAM_DEADZONE_Y;

    this.x += (this.clampX(tx) - this.x) * CAM_LERP;
    this.y += (this.clampY(ty) - this.y) * CAM_LERP;

    // decaimento do shake
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      if (this.shakeTime <= 0) this.shakeMag = 0;
    }
  }

  /** Offset de shake aleatório (aplicado após o lerp). */
  shakeOffset() {
    if (this.shakeTime <= 0) return [0, 0];
    const m = this.shakeMag * (this.shakeTime / 0.25);
    return [(Math.random() * 2 - 1) * m, (Math.random() * 2 - 1) * m];
  }

  /** Aplica a transformação de mundo no contexto (chamado no render). */
  apply(ctx) {
    const [sx, sy] = this.shakeOffset();
    ctx.save();
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-Math.round(this.x + sx), -Math.round(this.y + sy));
  }

  restore(ctx) {
    ctx.restore();
  }

  viewRect() {
    const vw = VIEW_W / this.zoom;
    const vh = VIEW_H / this.zoom;
    return { x: this.x - 24, y: this.y - 24, w: vw + 48, h: vh + 48 };
  }
}
