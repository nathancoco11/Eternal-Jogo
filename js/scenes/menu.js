/* =========================
   ETERNAL FIGHTER - Menu
   ========================= */

class MenuScene {
  constructor(game) {
    this.game = game;

    // Opções do menu
    this.options = [
      { id: "npc",       label: "1 JOGADOR (NPC)",  enabled: false },
      { id: "duel",      label: "2 JOGADORES",      enabled: true  },
      { id: "boss",      label: "MODO BOSSES",      enabled: false },
    ];

    this.selectedIndex = 1;   // já começa em "2 JOGADORES" (único ativo)
    this.hoverIndex = -1;

    // Efeito de brilho pulsante no título
    this.titlePulse = 0;

    // Guarda posição dos botões (pra mouse)
    this.buttonRects = [];
  }

  init() {
    // Captura movimento do mouse pra hover
    this.game.canvas.addEventListener("mousemove", (e) => {
      const rect = this.game.canvas.getBoundingClientRect();
      const scaleX = CONFIG.WIDTH / rect.width;
      const scaleY = CONFIG.HEIGHT / rect.height;

      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      this.hoverIndex = -1;
      this.buttonRects.forEach((b, i) => {
        if (
          mx >= b.x && mx <= b.x + b.w &&
          my >= b.y && my <= b.y + b.h
        ) {
          this.hoverIndex = i;
        }
      });
    });

    // Clique do mouse
    this.game.canvas.addEventListener("click", () => {
      if (this.hoverIndex !== -1) {
        this.selectedIndex = this.hoverIndex;
        this.confirm();
      }
    });
  }

  /* =========================
     UPDATE
     ========================= */
  update() {
    this.titlePulse += 0.05;

    // Navegação com setas (só entre habilitados)
    if (Input.isPressed("ArrowUp") || Input.isPressed("KeyW")) {
      this.moveSelection(-1);
    }
    if (Input.isPressed("ArrowDown") || Input.isPressed("KeyS")) {
      this.moveSelection(1);
    }

    // Confirma com Enter ou Espaço
    if (Input.isPressed("Enter") || Input.isPressed("Space")) {
      this.confirm();
    }
  }

  moveSelection(dir) {
    let newIndex = this.selectedIndex;
    do {
      newIndex = (newIndex + dir + this.options.length) % this.options.length;
    } while (!this.options[newIndex].enabled);

    this.selectedIndex = newIndex;
  }

  confirm() {
    const opt = this.options[this.selectedIndex];
    if (!opt.enabled) return;

    if (opt.id === "duel") {
      this.game.changeScene(CONFIG.SCENES.CHAR_SELECT);
    }
    // npc e boss ficam pra depois
  }

  /* =========================
     DRAW
     ========================= */
  draw(ctx) {
    // Fundo com gradiente vermelho escuro
    const grad = ctx.createRadialGradient(
      CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, 50,
      CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, 800
    );
    grad.addColorStop(0, "#1a0505");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // ===== TÍTULO =====
    ctx.save();

    const pulse = Math.sin(this.titlePulse) * 5;
    const glow = 20 + pulse * 2;

    ctx.shadowColor = CONFIG.COLORS.GOLD;
    ctx.shadowBlur = glow;

    ctx.fillStyle = CONFIG.COLORS.GOLD;
    ctx.font = "900 96px Orbitron";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("ETERNAL", CONFIG.WIDTH / 2, 160);
    ctx.fillText("FIGHTER", CONFIG.WIDTH / 2, 260);

    ctx.restore();

    // Subtítulo
    ctx.fillStyle = CONFIG.COLORS.BLOOD;
    ctx.font = "700 22px Orbitron";
    ctx.textAlign = "center";
    ctx.fillText("A ARENA ETERNA AGUARDA", CONFIG.WIDTH / 2, 330);

    // ===== BOTÕES =====
    this.buttonRects = [];

    const btnW = 420;
    const btnH = 70;
    const startY = 420;
    const gap = 95;

    this.options.forEach((opt, i) => {
      const x = CONFIG.WIDTH / 2 - btnW / 2;
      const y = startY + i * gap;

      this.buttonRects.push({ x, y, w: btnW, h: btnH });

      const isSelected = i === this.selectedIndex;
      const isHover = i === this.hoverIndex && opt.enabled;

      // Fundo do botão
      if (!opt.enabled) {
        ctx.fillStyle = "rgba(40, 40, 40, 0.6)";
      } else if (isSelected) {
        ctx.fillStyle = "rgba(139, 0, 0, 0.85)";
      } else if (isHover) {
        ctx.fillStyle = "rgba(80, 0, 0, 0.7)";
      } else {
        ctx.fillStyle = "rgba(20, 20, 20, 0.8)";
      }

      ctx.fillRect(x, y, btnW, btnH);

      // Borda
      ctx.strokeStyle = opt.enabled
        ? (isSelected ? CONFIG.COLORS.GOLD : "#5a4a1a")
        : "#2a2a2a";
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.strokeRect(x, y, btnW, btnH);

      // Texto do botão
      ctx.fillStyle = opt.enabled
        ? (isSelected ? CONFIG.COLORS.GOLD : CONFIG.COLORS.WHITE)
        : "#555555";

      ctx.font = "700 26px Orbitron";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(opt.label, CONFIG.WIDTH / 2, y + btnH / 2);

      // Indicador "►" no botão selecionado
      if (isSelected && opt.enabled) {
        ctx.fillStyle = CONFIG.COLORS.GOLD;
        ctx.font = "700 30px Orbitron";
        ctx.fillText("►", x - 35, y + btnH / 2);
      }

      // Texto "EM BREVE" nos desabilitados
      if (!opt.enabled) {
        ctx.fillStyle = "#444";
        ctx.font = "700 12px Orbitron";
        ctx.fillText("EM BREVE", CONFIG.WIDTH / 2, y + btnH - 12);
      }
    });

    // ===== RODAPÉ =====
    ctx.fillStyle = "#666";
    ctx.font = "400 14px Orbitron";
    ctx.textAlign = "center";
    ctx.fillText(
      "↑ ↓ para navegar   •   ENTER para confirmar   •   MOUSE também funciona",
      CONFIG.WIDTH / 2,
      CONFIG.HEIGHT - 40
    );
  }
}