// =============================================================================
// Level2.js — Fase 2: Templo do Trovão. Plataformas que caem, raios, subida
// vertical, mini-boss mecânico e a arena final do Shogun Poodle. ~4-6 minutos.
// =============================================================================

import * as B from './builder.js';

export const LEVEL2 = build();

function build() {
  const W = 200;
  const H = 24;
  const b = B.create(W, H);

  // céu de tempestade
  B.set(b, 12, 3, '~'); B.set(b, 50, 2, '~'); B.set(b, 96, 3, '~');
  B.set(b, 140, 2, '~'); B.set(b, 180, 3, '~');

  // ---------- Início ----------
  B.floor(b, 0, 20, 20);
  B.set(b, 2, 18, 'P');
  B.set(b, 8, 18, 'T');
  B.coinArc(b, 12, 16, 3);

  // ---------- Buraco com plataformas que caem ----------
  B.set(b, 23, 17, 'F');
  B.set(b, 27, 15, 'F');
  B.coinArc(b, 24, 13, 3);

  // ---------- Trilha dos arqueiros ----------
  B.floor(b, 31, 50, 20);
  B.set(b, 40, 18, 'a');
  B.set(b, 46, 18, 'a');
  B.set(b, 44, 10, 'b');
  B.set(b, 43, 20, 'L');                 // ponto de raio ambiente
  B.coinArc(b, 34, 17, 3);

  // ---------- Subida vertical ----------
  B.plat(b, 52, 55, 16);
  B.plat(b, 57, 60, 13);
  B.plat(b, 62, 66, 10);
  B.set(b, 60, 8, 'b');
  B.set(b, 64, 8, 'b');
  B.coinArc(b, 58, 11, 3);
  B.set(b, 64, 8, 'o');

  // ---------- Arena do mini-boss ----------
  B.floor(b, 71, 110, 20);
  B.set(b, 75, 18, 'C');                 // checkpoint
  B.set(b, 92, 16, 'M');                 // rato gigante mecânico
  B.coinArc(b, 82, 17, 3);
  B.coinArc(b, 100, 17, 3);

  // ---------- Corredor hostil ----------
  B.floor(b, 111, 120, 20);
  B.spikes(b, 116, 117, 19);
  B.set(b, 123, 17, 'F');
  B.set(b, 127, 15, 'F');
  B.floor(b, 128, 150, 20);
  B.set(b, 132, 18, 'a');
  B.set(b, 140, 18, 'a');
  B.set(b, 136, 12, 'b');
  B.set(b, 145, 20, 'L');
  B.coinArc(b, 143, 17, 3);

  // ---------- Arena final: Shogun Poodle ----------
  B.floor(b, 151, 199, 20);
  B.set(b, 160, 16, 'h');
  B.set(b, 172, 15, 'B');                // boss
  B.set(b, 190, 18, 'D');                // porta (depois do boss)

  return {
    name: 'Templo do Trovão',
    theme: 'thunder',
    width: W,
    height: H,
    rows: B.toRows(b),
  };
}
