// =============================================================================
// TouchControls.js — Joystick/botões virtuais em DOM para mobile. Só é montado
// em dispositivos de toque. Envia tudo para Input.setVirtual().
// =============================================================================

export class TouchControls {
  constructor(input) {
    this.input = input;
    const touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!touch) return;
    this.build();
  }

  btn(parent, label, action, cls) {
    const el = document.createElement('button');
    el.className = `tbtn ${cls}`;
    el.textContent = label;
    const down = (e) => { e.preventDefault(); this.input.setVirtual(action, true); };
    const up = (e) => { e.preventDefault(); this.input.setVirtual(action, false); };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('pointercancel', up);
    parent.appendChild(el);
    return el;
  }

  build() {
    const root = document.createElement('div');
    root.className = 'touch';
    const left = document.createElement('div');
    left.className = 'tleft';
    const right = document.createElement('div');
    right.className = 'tright';
    root.appendChild(left);
    root.appendChild(right);

    this.btn(left, '◀', 'left');
    this.btn(left, '▶', 'right');
    this.btn(right, 'A', 'jump', 'big');
    this.btn(right, 'X', 'attack');
    this.btn(right, 'Z', 'dash');

    document.body.appendChild(root);
  }
}
