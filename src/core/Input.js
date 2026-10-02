// =============================================================================
// Input.js — Teclado + gamepad + botões virtuais (touch) num único lugar.
// O resto do jogo só pergunta: input.held('jump'), input.pressed('dash')...
// =============================================================================

const KEYMAP = {
  left:  ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  jump:  ['Space', 'KeyW', 'ArrowUp'],
  attack: ['KeyX', 'KeyJ'],
  dash:  ['ShiftLeft', 'ShiftRight', 'KeyZ'],
  pause: ['Escape', 'KeyP'],
  restart: ['KeyR'],
  confirm: ['Enter', 'Space', 'KeyX'],
  up:    ['ArrowUp', 'KeyW'],
  down:  ['ArrowDown', 'KeyS'],
};

const PREVENT = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export class Input {
  constructor() {
    this.held = new Set();
    this.just = new Set();
    this.virtualHeld = new Set();
    this.virtualJust = new Set();
    this.anyKeyPressed = false;
    this.onFirstGesture = null;   // chamado no 1º gesto (para AudioContext.resume)

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('keydown', (e) => this._key(e, true));
      window.addEventListener('keyup', (e) => this._key(e, false));
      window.addEventListener('pointerdown', () => this._gesture());
    }
  }

  _gesture() {
    this.anyKeyPressed = true;
    if (this.onFirstGesture) {
      const cb = this.onFirstGesture;
      this.onFirstGesture = null;
      cb();
    }
  }

  _key(e, down) {
    if (PREVENT.has(e.code)) e.preventDefault();
    const action = Object.keys(KEYMAP).find((a) => KEYMAP[a].includes(e.code));
    if (!action) return;
    if (down) {
      this._gesture();
      if (!this.held.has(action) && !this.virtualHeld.has(action)) this.just.add(action);
      this.held.add(action);
    } else {
      this.held.delete(action);
    }
  }

  /** Botões virtuais do touch (chamado pelo TouchControls). */
  setVirtual(action, down) {
    if (down) {
      this._gesture();
      if (!this.held.has(action) && !this.virtualHeld.has(action)) this.virtualJust.add(action);
      this.virtualHeld.add(action);
    } else {
      this.virtualHeld.delete(action);
    }
  }

  /** Lê o gamepad padrão (se houver) e injeta nas mesmas ações. */
  _pollGamepad() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const pad = [...navigator.getGamepads()].find((p) => p && p.connected);
    if (!pad) return;
    const axisX = pad.axes[0] || 0;
    const btn = (i) => Boolean(pad.buttons[i] && pad.buttons[i].pressed);
    const states = {
      left: axisX < -0.4 || btn(14),
      right: axisX > 0.4 || btn(15),
      jump: btn(0) || btn(12),
      attack: btn(2),
      dash: btn(5) || btn(1),
      pause: btn(9),
      confirm: btn(0),
    };
    for (const [action, down] of Object.entries(states)) {
      if (down) {
        if (!this.held.has(action) && !this.virtualHeld.has(action) && !this._padHeld?.has(action)) {
          this.just.add(action);
        }
        (this._padHeld ||= new Set()).add(action);
      } else {
        this._padHeld?.delete(action);
      }
    }
  }

  heldQ(action) {
    return this.held.has(action) || this.virtualHeld.has(action);
  }

  /** True apenas no frame em que a ação acabou de ser pressionada. */
  pressed(action) {
    return this.just.has(action) || this.virtualJust.has(action);
  }

  /** Chama no fim de cada frame de update para limpar os "just pressed". */
  endFrame() {
    this.just.clear();
    this.virtualJust.clear();
    this.anyKeyPressed = false;
    this._pollGamepad();
  }
}
