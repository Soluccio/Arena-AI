// =============================================================================
// tools/sheet.mjs — Gera um .png com todos os frames de uma família de sprites.
// Uso: node tools/sheet.mjs cat out/sheet-cat.png
// Serve para inspeção visual do pixel art sem abrir o navegador.
// =============================================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { installDomShim, SoftCanvas } from './softcanvas.mjs';
import { encodePng } from './png.mjs';

installDomShim();

const { get, SPRITE_SIZES } = await import('../src/sprites/SpriteFactory.js');
const { animNames, animDef } = await import('../src/data/animations.js');

const kind = process.argv[2] || 'cat';
const outPath = process.argv[3] || `out/sheet-${kind}.png`;
const SCALE = Number(process.argv[4] || 6);
const PAD = 2;

const anims = animNames(kind);
if (!anims.length) {
  console.error(`Sem animações para "${kind}".`);
  process.exit(1);
}
const maxFrames = Math.max(...anims.map((a) => animDef(kind, a).frames));
const [sw, sh] = SPRITE_SIZES[kind];

const sheet = new SoftCanvas();
sheet.width = maxFrames * (sw + PAD) * SCALE + PAD * SCALE;
sheet.height = anims.length * (sh + PAD) * SCALE + PAD * SCALE;
const ctx = sheet.getContext('2d');

// fundo xadrez escuro para enxergar transparências
for (let y = 0; y < sheet.height; y += 4) {
  for (let x = 0; x < sheet.width; x += 4) {
    ctx.fillStyle = ((x / 4 + y / 4) % 2) ? '#20202e' : '#2a2a3c';
    ctx.fillRect(x, y, 4, 4);
  }
}

/** Copia um sprite ampliando por SCALE (vizinho mais próximo). */
function blit(sprite, dx, dy) {
  const s = sprite.getContext('2d').data;
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const o = (y * sw + x) * 4;
      if (s[o + 3] === 0) continue;
      ctx.fillStyle = `rgba(${s[o]},${s[o + 1]},${s[o + 2]},1)`;
      ctx.fillRect(dx + x * SCALE, dy + y * SCALE, SCALE, SCALE);
    }
  }
}

anims.forEach((anim, row) => {
  const frames = animDef(kind, anim).frames;
  for (let f = 0; f < frames; f++) {
    const sprite = get(kind, anim, f);
    blit(sprite, PAD * SCALE + f * (sw + PAD) * SCALE, PAD * SCALE + row * (sh + PAD) * SCALE);
  }
  // marca a linha atual
  ctx.fillStyle = '#ffeb3b';
  ctx.fillRect(0, PAD * SCALE + row * (sh + PAD) * SCALE, SCALE, SCALE);
});

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, encodePng(sheet.width, sheet.height, ctx.data));
console.log(`${kind}: ${anims.length} animações, ${anims.map((a) => `${a}=${animDef(kind, a).frames}`).join(' ')} -> ${outPath} (${sheet.width}x${sheet.height})`);
