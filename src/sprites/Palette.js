// =============================================================================
// Palette.js — Paleta retrô de 16 cores + variações de tema.
// Nenhuma cor fora daqui: trocar a paleta aqui repinta o jogo inteiro.
// =============================================================================

/** Paleta base de 16 cores (a "regra" do jogo). */
export const PAL = {
  // fundo / atmosfera
  night0:   '#1a1a2e',
  night1:   '#16213e',
  // Belisco
  fur:      '#7a7a8c',
  furDark:  '#5b5b6b',
  white:    '#e8e8f0',
  eye:      '#ffd93d',
  // roupa ninja
  red:      '#c62828',
  redDark:  '#8e1c1c',
  band:     '#ffffff',
  // espada
  steel:    '#b0bec5',
  steelDk:  '#7d8f99',
  wood:     '#5d4037',
  // inimigos
  dog:      '#8d6e63',
  dogDark:  '#6d4c41',
  rat:      '#37474f',
  ratLight: '#546e7a',
  // cenário
  bamboo:   '#81c784',
  bambooDk: '#4e8f57',
  stone:    '#90a4ae',
  stoneDk:  '#62757e',
  // efeitos
  storm:    '#37474f',
  bolt:     '#ffeb3b',
  // utilidades
  black:    '#0b0b16',
  shadow:   '#2b2b3d',
  gold:     '#ffcf4d',
  pink:     '#ff8fa3',
  cyan:     '#7fe3d4',
};

/** Cores nomeadas usadas pelos mapas de pixels dos sprites. */
export const CHAR_MAP = {
  '.': null,        // transparente
  k: PAL.black,
  s: PAL.shadow,
  f: PAL.fur,
  d: PAL.furDark,
  w: PAL.white,
  e: PAL.eye,
  r: PAL.red,
  R: PAL.redDark,
  b: PAL.band,
  S: PAL.steel,
  T: PAL.steelDk,
  o: PAL.wood,
  g: PAL.dog,
  G: PAL.dogDark,
  n: PAL.rat,
  N: PAL.ratLight,
  p: PAL.pink,
  y: PAL.gold,
  c: PAL.cyan,
};

/** Temas de cenário (fase 1 = bambu, fase 2 = trovão). */
export const THEMES = {
  bamboo: {
    name: 'Templo de Bambu',
    sky:      ['#1a1a2e', '#16213e', '#20304f'],
    far:      '#243b53',
    mid:      '#2f5d50',
    near:     '#1b3b33',
    tile:     PAL.bamboo,
    tileDark: PAL.bambooDk,
    accent:   PAL.stone,
    accentDk: PAL.stoneDk,
    fog:      'rgba(129,199,132,0.06)',
    weather:  'leaves',
  },
  thunder: {
    name: 'Templo do Trovão',
    sky:      ['#0f1226', '#1b2340', '#2a2f52'],
    far:      '#232b4a',
    mid:      '#37474f',
    near:     '#22283f',
    tile:     PAL.stone,
    tileDark: PAL.stoneDk,
    accent:   PAL.bolt,
    accentDk: '#a8951f',
    fog:      'rgba(255,235,59,0.05)',
    weather:  'rain',
  },
};

export function theme(name) {
  return THEMES[name] || THEMES.bamboo;
}
