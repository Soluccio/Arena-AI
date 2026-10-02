// =============================================================================
// Music.js — Trilha procedural: taiko (tambor) + koto em escala pentatônica,
// com loop contínuo e intensidade dinâmica (calma vs. combate).
// =============================================================================

import { PENTATONIC, TAIKO } from '../data/audio-map.js';

export class Music {
  constructor(audio) {
    this.audio = audio;
    this.running = false;
    this.next = 0;
    this.step = 0;
    this.bpm = 108;
    this.intensity = false;
  }

  start() {
    if (!this.audio.ready) return;
    this.running = true;
    this.next = this.audio.now() + 0.1;
  }

  stop() {
    this.running = false;
  }

  setIntensity(hot) {
    this.intensity = hot;
  }

  /** Chamar todo frame: agenda notas com lookahead. */
  update() {
    if (!this.running || !this.audio.ready) return;
    const ahead = 0.25;
    while (this.next < this.audio.now() + ahead) {
      this.scheduleStep(this.step, this.next);
      const spb = 60 / this.bpm / 2;   // colcheias
      this.next += spb;
      this.step = (this.step + 1) % 16;
    }
  }

  scheduleStep(step, t) {
    const pat = this.intensity ? TAIKO.hot : TAIKO.calm;
    const hit = pat[step % 8];
    if (hit) this.drum(t, hit);

    // koto: melodia pentatônica esparsa (mais densa em combate)
    const want = this.intensity ? step % 2 === 0 : step % 4 === 0;
    if (want) {
      const chance = this.intensity ? 0.85 : 0.5;
      if (Math.random() < chance) {
        const idx = (step * 3 + (this.intensity ? 2 : 0)) % PENTATONIC.length;
        this.koto(t, PENTATONIC[idx]);
      }
    }
  }

  drum(t, v) {
    this.audio.osc('sine', 150, t, 0.28, 0.4 * v, 45);
    this.audio.noise(t, 0.05, 0.18 * v, 'lowpass', 400);
  }

  koto(t, f) {
    this.audio.osc('triangle', f, t, 0.4, 0.22);
    this.audio.osc('sine', f * 2, t, 0.2, 0.1);
  }
}
