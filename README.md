# ⚔️ Belisco, o Gato Ninja

Platformer 2D de ação em **HTML5 Canvas**, 100% **pixel art procedural** (zero assets
externos) e **zero dependências de runtime**. Dois templos completos, boss final,
combate, dash, wall-jump, checkpoints, áudio e trilha 100% sintetizados via Web Audio.

> Belisco é um gatinho aprendiz de ninja que atravessa dois templos para recuperar o
> **Sino de Jade** roubado pelos cães samurais.

## ▶️ Como rodar

Sem build (só um servidor estático para os ES Modules):

```bash
npm start            # serve em http://localhost:3000 (node:http, zero deps)
# ou
npx vite             # dev server opcional
```

Depois abra o endereço no navegador. Em sandboxes/previws o mesmo servidor é exposto
automaticamente.

## 🎮 Controles

| Ação            | Teclas                       |
|-----------------|------------------------------|
| Mover           | `←` `→` / `A` `D`            |
| Pular (variável)| `Espaço` / `W` / `↑`         |
| Atacar (espada) | `X` / `J`                    |
| Dash            | `Shift` / `Z`                |
| Reiniciar fase  | `R`                          |
| Pausar          | `ESC`                        |

Mobile: joystick virtual à esquerda + botões `A`/`X`/`Z` à direita (aparece só em toque).

## ✨ Destaques técnicos

- **Sprites procedurais**: `SpriteFactory` desenha cada frame pixel a pixel em canvas
  offscreen e cacheia. Nenhuma imagem externa. Veja `tools/sheet.mjs` para gerar folhas
  de sprite em PNG.
- **Feel**: coyote time, jump buffer, pulo variável, wall slide/jump, dash com i-frames e
  fantasmas, squash & stretch, hit-stop, freeze-frame, screen shake, partículas (teto 80).
- **Áudio procedural**: SFX e trilha (taiko + koto pentatônico) sintetizados em tempo real,
  com intensidade dinâmica em combate.
- **Loop de passo fixo** (60 FPS) com `requestAnimationFrame` e delta cap.
- **Câmera** com deadzone, lerp, zoom de boss e shake pós-lerp.

## 🗂️ Estrutura

```
src/
  core/      Game, Input, Physics, Camera, FX, Audio, Music, Combat
  entities/  Player, inimigos, bosses, itens, projéteis, plataforma, porta...
  sprites/   Palette, SpriteFactory, pxutil, draw* (cat/enemies/boss/items/tiles)
  levels/    TileMap, builder, Level1, Level2, Background
  ui/        HUD, Menu, Pause, GameOver, Transitions, TouchControls, PixelFont
  data/      constants, enemies, animations, audio-map
tools/       server.mjs, sheet.mjs, screenshot.mjs, softcanvas, png
tests/       game.test.mjs (roda o jogo headless via node --test)
```

## 🧪 Testes

```bash
npm test             # node --test: boot das 2 fases, movimento, combate, sprites
```

## 🎨 Inspecionar arte

```bash
node tools/sheet.mjs cat out/cat.png        # folha de sprites do Belisco
node tools/screenshot.mjs 0 90 out/l1.png   # frame real do gameplay (headless)
```
