// =============================================================================
// animations.js — Tabela única de animações com TIMING EXPLÍCITO por frame.
// `speed` = segundos que cada frame fica na tela. `loop` = repete ou trava
// no último frame. O SpriteFactory usa `frames` para saber quantos desenhar.
// =============================================================================

export const ANIM = {
  // ---- Belisco (gato ninja) ------------------------------------------------
  cat: {
    idle:      { frames: 4, speed: 0.16, loop: true  },
    run:       { frames: 6, speed: 0.08, loop: true  },
    jump:      { frames: 2, speed: 0.10, loop: false, clamp: true },
    wallCling: { frames: 2, speed: 0.14, loop: true  },
    attack:    { frames: 3, speed: 0.07, loop: false },
    dash:      { frames: 2, speed: 0.07, loop: true  },
    hurt:      { frames: 2, speed: 0.10, loop: false },
    death:     { frames: 4, speed: 0.13, loop: false },
  },

  // ---- Cão samurai ---------------------------------------------------------
  dog: {
    idle:   { frames: 2, speed: 0.35, loop: true  },
    walk:   { frames: 4, speed: 0.14, loop: true  },
    attack: { frames: 2, speed: 0.20, loop: false },
    hurt:   { frames: 1, speed: 0.20, loop: false },
  },

  // ---- Cão arqueiro (fase 2) ----------------------------------------------
  archer: {
    idle:  { frames: 2, speed: 0.32, loop: true  },
    walk:  { frames: 4, speed: 0.15, loop: true  },
    shoot: { frames: 2, speed: 0.18, loop: false },
    hurt:  { frames: 1, speed: 0.20, loop: false },
  },

  // ---- Rato ninja ----------------------------------------------------------
  rat: {
    idle:  { frames: 2, speed: 0.22, loop: true  },
    run:   { frames: 4, speed: 0.09, loop: true  },
    throw: { frames: 2, speed: 0.16, loop: false },
    hurt:  { frames: 1, speed: 0.20, loop: false },
  },

  // ---- Rato bombardeiro (fase 2) -------------------------------------------
  bomber: {
    idle:  { frames: 2, speed: 0.24, loop: true  },
    run:   { frames: 4, speed: 0.10, loop: true  },
    throw: { frames: 2, speed: 0.18, loop: false },
    hurt:  { frames: 1, speed: 0.20, loop: false },
  },

  // ---- Sapo saltitante ------------------------------------------------------
  frog: {
    idle: { frames: 2, speed: 0.28, loop: true  },
    jump: { frames: 2, speed: 0.16, loop: false },
    hurt: { frames: 1, speed: 0.20, loop: false },
  },

  // ---- Mini-boss: rato gigante mecânico -------------------------------------
  mini: {
    idle:    { frames: 4, speed: 0.18, loop: true  },
    charge:  { frames: 2, speed: 0.12, loop: true  },
    shoot:   { frames: 2, speed: 0.16, loop: false },
    stagger: { frames: 2, speed: 0.10, loop: false },
  },

  // ---- Boss: Shogun Poodle ---------------------------------------------------
  poodle: {
    idle:    { frames: 4, speed: 0.22, loop: true  },
    attack:  { frames: 4, speed: 0.11, loop: false },
    stagger: { frames: 2, speed: 0.12, loop: true  },
    spin:    { frames: 4, speed: 0.06, loop: true  },
  },

  // ---- Itens -----------------------------------------------------------------
  fish:     { frames: 4, speed: 0.13, loop: true },
  coin:     { frames: 4, speed: 0.11, loop: true },
  heart:    { frames: 2, speed: 0.30, loop: true },
  shuriken: { frames: 4, speed: 0.05, loop: true },
  arrow:    { frames: 1, speed: 1.00, loop: true },
  bomb:     { frames: 4, speed: 0.12, loop: true },
  spark:    { frames: 4, speed: 0.06, loop: true },
  flag:     { frames: 2, speed: 0.40, loop: true },
  bolt:     { frames: 2, speed: 0.05, loop: true },
};

/**
 * Alguns sprites (itens) têm UMA animação só e entram na tabela de forma
 * "flat": `coin: { frames: 4, ... }`. Estas helpers normalizam os dois formatos
 * para que SpriteFactory e ferramentas tratem tudo igual.
 */
export function isFlat(kind) {
  const table = ANIM[kind];
  return Boolean(table) && typeof table.frames === 'number';
}

/** Lista os nomes de animação de uma família. */
export function animNames(kind) {
  if (!ANIM[kind]) return [];
  return isFlat(kind) ? ['idle'] : Object.keys(ANIM[kind]);
}

/** Devolve a definição de animação com segurança (fallback: idle / 1 frame). */
export function animDef(kind, name) {
  const table = ANIM[kind];
  if (!table) return { frames: 1, speed: 0.2, loop: false };
  if (isFlat(kind)) return table;
  return table[name] || table.idle || { frames: 1, speed: 0.2, loop: false };
}
