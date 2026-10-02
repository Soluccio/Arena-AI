// =============================================================================
// Level1.js — Fase 1: Templo de Bambu. Tutorial silencioso, floresta de bambu,
// muro de wall jump e o corredor com 5 cães samurai. ~3-5 minutos.
// =============================================================================

import * as B from './builder.js';

export const LEVEL1 = build();

function build() {
  const W = 176;
  const H = 24;
  const b = B.create(W, H);

  // céu
  B.set(b, 10, 3, '~'); B.set(b, 44, 2, '~'); B.set(b, 82, 3, '~');
  B.set(b, 120, 2, '~'); B.set(b, 152, 3, '~');

  // ---------- Seção 1: tutorial silencioso ----------
  B.floor(b, 0, 33, 20);
  B.set(b, 2, 18, 'P');
  B.coinArc(b, 8, 16, 3);                 // ensina a coletar
  B.plat(b, 16, 20, 16);                  // ensina a pular
  B.set(b, 18, 14, 'i');                  // peixe: recompensa
  B.set(b, 24, 18, 'T');
  B.coinArc(b, 27, 17, 3);

  B.spikes(b, 34, 37, 22);                // primeiro buraco

  // ---------- Seção 2: floresta de bambu ----------
  B.floor(b, 38, 69, 20);
  B.vline(b, 41, 16, 19, 'Z');
  B.vline(b, 49, 15, 19, 'Z');
  B.vline(b, 66, 16, 19, 'Z');
  B.plat(b, 42, 46, 16); B.coinArc(b, 43, 14, 3);
  B.plat(b, 50, 54, 13); B.set(b, 52, 11, 'o'); B.set(b, 53, 11, 'o');
  B.set(b, 45, 18, 'f'); B.set(b, 56, 18, 'f');
  B.set(b, 60, 18, 'r'); B.set(b, 62, 18, 'r');
  B.coinArc(b, 63, 17, 3);

  B.spikes(b, 70, 73, 22);

  // ---------- Seção 3: muro com wall jump ----------
  B.floor(b, 74, 150, 20);
  B.plat(b, 73, 76, 16);
  B.plat(b, 76, 79, 13);
  B.vline(b, 80, 8, 19, '#');             // parede esquerda
  B.vline(b, 84, 8, 19, '#');             // parede direita
  B.set(b, 82, 6, 'h');                   // coração no topo
  B.set(b, 77, 18, 'T');

  // ---------- Seção 4: corredor dos 5 cães ----------
  B.set(b, 95, 18, 'd'); B.set(b, 105, 18, 'd'); B.set(b, 115, 18, 'd');
  B.set(b, 125, 18, 'd'); B.set(b, 135, 18, 'd');
  B.set(b, 110, 18, 'C');                 // checkpoint do meio
  B.spikes(b, 100, 101, 19);
  B.spikes(b, 120, 121, 19);
  B.plat(b, 108, 112, 15); B.coinArc(b, 109, 13, 3);
  B.plat(b, 128, 132, 15); B.coinArc(b, 129, 13, 3);
  B.set(b, 90, 18, 'T'); B.set(b, 140, 18, 'T');
  B.set(b, 145, 16, 'i');

  // ---------- Saída ----------
  B.floor(b, 151, 175, 20);
  B.set(b, 162, 18, 'D');

  return {
    name: 'Templo de Bambu',
    theme: 'bamboo',
    width: W,
    height: H,
    rows: B.toRows(b),
  };
}
