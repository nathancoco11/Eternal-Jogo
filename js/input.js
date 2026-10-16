/* =========================
   ETERNAL FIGHTER - Input
   ========================= */

const Input = {
  // Teclas seguradas agora
  keys: {},

  // Teclas apertadas NESTE frame (consumidas depois)
  pressed: {},

  /* Mapeamento dos controles dos 2 jogadores */
  controls: {
    p1: {
      left:   "KeyA",
      right:  "KeyD",
      up:     "KeyW",
      down:   "KeyS",
      punch:  "KeyF",
      kick:   "KeyG",
    },
    p2: {
      left:   "ArrowLeft",
      right:  "ArrowRight",
      up:     "ArrowUp",
      down:   "ArrowDown",
      punch:  "KeyK",
      kick:   "KeyL",
    },
  },

  /* Inicializa os listeners */
  init() {
    window.addEventListener("keydown", (e) => {
      // Se a tecla já estava pressionada, ignora (evita repetição)
      if (!this.keys[e.code]) {
        this.pressed[e.code] = true;
      }
      this.keys[e.code] = true;

      // Evita que setas/barra de espaço rolem a página
      if (
        [
          "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
          "Space",
        ].includes(e.code)
      ) {
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  },

  /* Segurando a tecla? (andar, agachar) */
  isDown(code) {
    return !!this.keys[code];
  },

  /* Apertou agora? (soco, chute, pulo) */
  isPressed(code) {
    return !!this.pressed[code];
  },

  /* Verifica se o jogador está segurando uma direção */
  isPlayerDown(player, action) {
    const key = this.controls[player][action];
    return this.isDown(key);
  },

  /* Verifica se o jogador apertou um botão agora */
  isPlayerPressed(player, action) {
    const key = this.controls[player][action];
    return this.isPressed(key);
  },

  /* Limpa as teclas "pressed" no fim de cada frame */
  clearPressed() {
    this.pressed = {};
  },
};