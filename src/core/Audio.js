// =============================================================================
// Audio.js — SFX 100% procedural com Web Audio API (zero samples). Cada efeito
// é uma receita declarada em audio-map.js. Ganhos entre 0.2 e 0.5.
// =============================================================================

import { SFX } from '../data/audio-map.js';

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this._noiseBuf = null;
  }

  /** Cria/retoma o contexto (deve ser chamado num gesto do usuário). */
  resume() {
    if (!this.ctx) {
      const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  get ready() { return Boolean(this.ctx); }

  now() { return this.ctx ? this.ctx.currentTime : 0; }

  noiseBuffer() {
    if (this._noiseBuf) return this._noiseBuf;
    const len = this.ctx.sampleRate * 1;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this._noiseBuf = buf;
    return buf;
  }

  env(t0, gain, dur, peak) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    g.connect(this.master);
    return g;
  }

  osc(type, f0, t0, dur, peak, f1) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
    o.connect(this.env(t0, 0, dur, peak));
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  noise(t0, dur, peak, filterType, freq) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer();
    const f = this.ctx.createBiquadFilter();
    f.type = filterType || 'highpass';
    f.frequency.value = freq || 1000;
    src.connect(f);
    f.connect(this.env(t0, 0, dur, peak));
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  play(name) {
    if (!this.ready || !this.enabled) return;
    const s = SFX[name];
    if (!s) return;
    const t0 = this.now();
    switch (s.type) {
      case 'sweep': this.osc(s.wave, s.from, t0, s.dur, s.gain, s.to); break;
      case 'thud': this.osc('sine', s.freq, t0, s.dur, s.gain, s.freq * 0.4); this.noise(t0, 0.06, s.gain * 0.5, 'lowpass', 300); break;
      case 'sword': this.noise(t0, s.dur, s.gain, 'highpass', 2000); this.osc('square', 900, t0, 0.08, s.gain * 0.5, 200); break;
      case 'clang': this.osc('square', s.freq, t0, s.dur, s.gain * 0.7, s.freq * 0.6); this.osc('square', s.freq * 1.5, t0, s.dur * 0.6, s.gain * 0.4); break;
      case 'noise': this.noise(t0, s.dur, s.gain, 'highpass', s.hp); break;
      case 'blip': this.osc(s.wave, s.freq, t0, s.dur, s.gain); if (s.overtone) this.osc(s.wave, s.overtone, t0 + 0.02, s.dur, s.gain * 0.5); break;
      case 'chord': s.notes.forEach((n, i) => this.osc(s.wave, n, t0 + i * 0.06, s.dur, s.gain / s.notes.length * 2)); break;
      case 'hurt': this.osc('sawtooth', s.freq, t0, s.dur, s.gain, s.freq * 0.5); this.noise(t0, 0.1, s.gain * 0.4, 'lowpass', 500); break;
      case 'decay': this.osc(s.wave, s.from, t0, s.dur, s.gain, s.to); break;
      case 'sad': s.notes.forEach((n, i) => this.osc('triangle', n, t0 + i * 0.2, 0.3, s.gain)); break;
      case 'roar': this.noise(t0, s.dur, s.gain, 'lowpass', 240); this.osc('sawtooth', 70, t0, s.dur, s.gain * 0.8, 40); break;
      case 'boom': this.osc('sine', 120, t0, s.dur, s.gain, 30); this.noise(t0, s.dur, s.gain * 0.7, 'lowpass', 400); break;
      case 'crack': this.noise(t0, s.dur, s.gain, 'highpass', 3000); this.osc('square', 1800, t0, 0.1, s.gain * 0.4, 200); break;
    }
  }
}
