// =============================================================================
// audio-map.js — Receita declarativa de cada SFX procedural.
// O Audio.js lê esta tabela e sintetiza com Web Audio API (zero samples).
// Ganhos sempre entre 0.2 e 0.5, conforme especificação.
// =============================================================================

export const SFX = {
  jump:     { type: 'sweep', wave: 'square',   from: 300, to: 620, dur: 0.14, gain: 0.26 },
  walljump: { type: 'sweep', wave: 'square',   from: 420, to: 760, dur: 0.13, gain: 0.24 },
  land:     { type: 'thud',  freq: 90,  dur: 0.12, gain: 0.34 },
  sword:    { type: 'sword', dur: 0.18, gain: 0.30 },
  clang:    { type: 'clang', freq: 1180, dur: 0.22, gain: 0.30 },
  dash:     { type: 'noise', hp: 1400, dur: 0.20, gain: 0.26 },
  coin:     { type: 'blip',  wave: 'sine', freq: 1320, dur: 0.10, gain: 0.28, overtone: 1980 },
  fish:     { type: 'blip',  wave: 'sine', freq: 880,  dur: 0.22, gain: 0.30, overtone: 1320 },
  heart:    { type: 'chord', wave: 'sine', notes: [523, 659, 784], dur: 0.34, gain: 0.30 },
  hurt:     { type: 'hurt',  freq: 150, dur: 0.30, gain: 0.40 },
  enemyDie: { type: 'decay', wave: 'square', from: 420, to: 70, dur: 0.24, gain: 0.30 },
  playerDie:{ type: 'sad',   notes: [392, 330, 262, 196], dur: 1.0, gain: 0.36 },
  bossRoar: { type: 'roar',  dur: 1.1, gain: 0.44 },
  bossHit:  { type: 'clang', freq: 640, dur: 0.26, gain: 0.36 },
  explode:  { type: 'boom',  dur: 0.5, gain: 0.42 },
  bolt:     { type: 'crack', dur: 0.4, gain: 0.38 },
  stomp:    { type: 'thud',  freq: 140, dur: 0.16, gain: 0.36 },
  checkpoint:{ type: 'chord', wave: 'triangle', notes: [523, 784, 1046], dur: 0.5, gain: 0.32 },
  door:     { type: 'chord', wave: 'triangle', notes: [392, 523, 659, 880], dur: 0.8, gain: 0.32 },
  uiMove:   { type: 'blip',  wave: 'square', freq: 660, dur: 0.05, gain: 0.20 },
  uiSelect: { type: 'blip',  wave: 'square', freq: 990, dur: 0.09, gain: 0.24 },
  combo:    { type: 'chord', wave: 'square', notes: [660, 880, 1320], dur: 0.3, gain: 0.28 },
  shuriken: { type: 'noise', hp: 2200, dur: 0.12, gain: 0.20 },
  arrow:    { type: 'noise', hp: 900,  dur: 0.16, gain: 0.22 },
};

/** Escala pentatônica (koto) em Lá — usada pela trilha procedural. */
export const PENTATONIC = [220, 261.63, 293.66, 329.63, 392.0, 440, 523.25, 587.33, 659.25];

/** Padrões de taiko (batidas por compasso) — 1 = batida forte, 0.5 = fraca. */
export const TAIKO = {
  calm: [1, 0, 0, 0.5, 0, 0, 1, 0],
  hot:  [1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5],
};
