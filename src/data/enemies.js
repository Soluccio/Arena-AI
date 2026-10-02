// =============================================================================
// enemies.js — Definições de dados de todos os inimigos.
// A lógica fica nas classes; aqui ficam só números (hp, dano, velocidade...).
// =============================================================================

export const ENEMIES = {
  // Cão samurai: patrulha plataformas e telegrafa o corte por 0.4s
  dog: {
    kind: 'dog',
    sprite: 'dog',
    w: 16, h: 16,
    hp: 2,
    damage: 1,
    score: 150,
    speed: 38,
    sightRange: 92,
    attackRange: 26,
    telegraph: 0.4,
    attackTime: 0.3,
    recover: 0.45,
    stompable: false,
  },

  // Cão arqueiro (fase 2): mantém distância e atira flechas em arco
  archer: {
    kind: 'archer',
    sprite: 'archer',
    w: 16, h: 16,
    hp: 2,
    damage: 1,
    score: 220,
    speed: 30,
    sightRange: 150,
    preferredRange: 110,
    shootCooldown: 2.1,
    stompable: false,
  },

  // Rato ninja: corre rápido e arremessa shurikens em grupos de 2-3
  rat: {
    kind: 'rat',
    sprite: 'rat',
    w: 13, h: 11,
    hp: 1,
    damage: 1,
    score: 120,
    speed: 74,
    sightRange: 130,
    throwCooldown: 1.5,
    small: true,          // atravessável durante o dash
    stompable: true,
  },

  // Rato bombardeiro (fase 2): solta bombas de área
  bomber: {
    kind: 'bomber',
    sprite: 'bomber',
    w: 13, h: 12,
    hp: 2,
    damage: 1,
    score: 260,
    speed: 58,
    sightRange: 120,
    throwCooldown: 2.4,
    small: true,
    stompable: true,
  },

  // Sapo saltitante: pula entre plataformas e morre se esmagado
  frog: {
    kind: 'frog',
    sprite: 'frog',
    w: 14, h: 11,
    hp: 1,
    damage: 1,
    score: 100,
    speed: 44,
    jumpCooldown: 1.1,
    stompable: true,
  },

  // Mini-boss da fase 2: rato gigante mecânico com 3 padrões
  mini: {
    kind: 'mini',
    sprite: 'mini',
    w: 34, h: 30,
    hp: 14,
    damage: 1,
    score: 1500,
    speed: 96,
    isBoss: true,
  },

  // Boss final: Shogun Poodle
  poodle: {
    kind: 'poodle',
    sprite: 'poodle',
    w: 40, h: 40,
    hp: 30,
    damage: 1,
    score: 5000,
    speed: 70,
    isBoss: true,
  },
};

/** Atalho seguro para buscar uma definição. */
export function enemyDef(kind) {
  return ENEMIES[kind] || ENEMIES.dog;
}
