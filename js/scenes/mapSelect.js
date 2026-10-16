/* =========================
   ETERNAL FIGHTER - Map Select
   ========================= */

class MapSelectScene {
  constructor(game) {
    this.game = game;

    this.p1Index = 0;
    this.p2Index = 0;

    this.p1Locked = false;
    this.p2Locked = false;

    this.timer = 0;
    this.startCountdown = 0;

    // Aviso piscante quando os dois índices diferem
    this.warningBlink = 0;
  }

  init() {}

  /* =========================
     UPDATE
     ========================= */
  update() {
    this.timer += 0.05;
    this.warningBlink += 0.1;

    // P1
    if (!this.p1Locked) {
      if (Input.isPlayerPressed("p1", "left"))  this.p1Index--;
      if (Input.isPlayerPressed("p1", "right")) this.p1Index++;

      this.p1Index = this.wrapIndex(this.p1Index);
    }

    // P2
    if (!this.p2Locked) {
      if (Input.isPlayerPressed("p2", "left"))  this.p2Index--;
      if (Input.isPlayerPressed("p2", "right")) this.p2Index++;

      this.p2Index = this.wrapIndex(this.p2Index);
    }

    // Se um mudar depois de travar, destrava os dois
    // (pra forçar os dois a escolherem juntos)
    if (
      (this.p1Locked && this.p2Locked) &&
      this.p1Index !== this.p2Index
    ) {
      this.p1Locked = false;
      this.p2Locked = false;
    }

    // Confirmação (só se os dois estiverem no mesmo mapa)
    if (
      this.p1Index === this.p2Index &&
      Input.isPlayerPressed("p1", "punch") &&
      !this.p1Locked
    ) {
      this.p1Locked = true;
    }

    if (
      this.p1Index === this.p2Index &&
      Input.isPlayerPressed("p2", "punch") &&
      !this.p2Locked
    ) {
      this.p2Locked = true;
    }

    // Se um mudar de mapa, destrava o outro
    if (this.p1Locked && this.p1Index !== this.p2Index) {
      this.p1Locked = false;
    }
    if (this.p2Locked && this.p2Index !== this.p1Index) {
      this.p2Locked = false;
    }

    // Escape destrava
    if (Input.isPressed("Escape")) {
      // Se nada travado, volta pra charSelect
      if (!this.p1Locked && !this.p2Locked) {
        this.game.changeScene(CONFIG.SCENES.CHAR_SELECT);
      } else {
        this.p1Locked = false;
        this.p2Locked = false;
      }
    }

    // Os dois confirmaram → vai pra batalha
    if (this.p1Locked && this.p2Locked && this.p1Index === this.p2Index) {
      this.startCountdown++;
      if (this.startCountdown > 45) {
        this.game.data.selectedMap = MAPS[this.p1Index];
        this.game.changeScene(CONFIG.SCENES.BATTLE);
      }
    }
  }

  wrapIndex(i) {
    const total = MAPS.length;
    return ((i % total) + total) % total;
  }

  /* =========================
     DRAW
     ========================= */
  draw(ctx) {
    // Fundo
    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT);
    grad.addColorStop(0, "#0a0505");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // Título
    ctx.fillStyle = CONFIG.COLORS.GOLD;
    ctx.font = "900 42px Orbitron";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ESCOLHAM A ARENA", CONFIG.WIDTH / 2, 60);

    // Subtítulo
    ctx.fillStyle = "#666";
    ctx.font = "400 14px Orbitron";
    ctx.fillText(
      "Os dois precisam escolher o MESMO mapa",
      CONFIG.WIDTH / 2, 100
    );

    // ==== CARROSSEL de mapas ====
    const cardW = 400;
    const cardH = 240;
    const gap = 30;
    const totalW = MAPS.length * cardW + (MAPS.length - 1) * gap;
    const startX = (CONFIG.WIDTH - totalW) / 2;
    const y = 180;

    // Shift pra "seguir" o mapa central
    const focusIndex = this.p1Index; // segue o P1 (ou o que estiver mexendo)
    const offsetX = -focusIndex * (cardW + gap) + (CONFIG.WIDTH / 2 - cardW / 2) - startX;

    MAPS.forEach((map, i) => {
      const x = startX + i * (cardW + gap) + offsetX;

      // Fundo com gradiente do mapa
      const mapGrad = ctx.createLinearGradient(0, y, 0, y + cardH);
      mapGrad.addColorStop(0, map.colorTop);
      mapGrad.addColorStop(1, map.colorBottom);

      ctx.fillStyle = mapGrad;
      ctx.fillRect(x, y, cardW, cardH);

      // Nome do mapa
      ctx.fillStyle = CONFIG.COLORS.WHITE;
      ctx.font = "700 20px Orbitron";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(map.name, x + cardW / 2, y + cardH - 25);

      // Borda base
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cardW, cardH);

      // ==== Seleção P1 (vermelho) ====
      if (i === this.p1Index) {
        ctx.save();
        ctx.strokeStyle = "#e63946";
        ctx.lineWidth = 5;
        ctx.shadowColor = "#e63946";
        ctx.shadowBlur = 20 + Math.sin(this.timer * 3) * 8;
        ctx.strokeRect(x + 3, y + 3, cardW - 6, cardH - 6);
        ctx.restore();

        // Marcador P1
        ctx.fillStyle = "#e63946";
        ctx.font = "900 18px Orbitron";
        ctx.textAlign = "left";
        ctx.fillText("P1", x + 15, y + 25);
      }

      // ==== Seleção P2 (azul) ====
      if (i === this.p2Index) {
        ctx.save();
        ctx.strokeStyle = "#4cc9f0";
        ctx.lineWidth = 5;
        ctx.shadowColor = "#4cc9f0";
        ctx.shadowBlur = 20 + Math.sin(this.timer * 3) * 8;
        ctx.strokeRect(x + 3, y + 3, cardW - 6, cardH - 6);
        ctx.restore();

        // Marcador P2
        ctx.fillStyle = "#4cc9f0";
        ctx.font = "900 18px Orbitron";
        ctx.textAlign = "right";
        ctx.fillText("P2", x + cardW - 15, y + 25);
      }
    });

    // ==== Indicador de status ====
    const sameMap = this.p1Index === this.p2Index;
    const statusY = y + cardH + 80;

    if (!sameMap) {
      // Piscando vermelho se estão em mapas diferentes
      const blink = Math.sin(this.warningBlink * 5) > 0;
      if (blink) {
        ctx.fillStyle = "#e63946";
        ctx.font = "900 24px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText("ESCOLHAM O MESMO MAPA!", CONFIG.WIDTH / 2, statusY);
      }
    } else {
      ctx.fillStyle = CONFIG.COLORS.GOLD;
      ctx.font = "700 20px Orbitron";
      ctx.textAlign = "center";

      if (!this.p1Locked && !this.p2Locked) {
        ctx.fillText(
          "P1 e P2: pressionem F / K para confirmar",
          CONFIG.WIDTH / 2, statusY
        );
      } else if (this.p1Locked && !this.p2Locked) {
        ctx.fillText("P1 pronto! Aguardando P2...", CONFIG.WIDTH / 2, statusY);
      } else if (!this.p1Locked && this.p2Locked) {
        ctx.fillText("P2 pronto! Aguardando P1...", CONFIG.WIDTH / 2, statusY);
      } else {
        ctx.fillText("ARENA DEFINIDA!", CONFIG.WIDTH / 2, statusY);
      }
    }

    // ==== Rodapé ====
    ctx.fillStyle = "#666";
    ctx.font = "400 13px Orbitron";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "P1: A / D mover  •  F confirmar      |      P2: ← / → mover  •  K confirmar      |      ESC voltar",
      CONFIG.WIDTH / 2,
      CONFIG.HEIGHT - 30
    );

    // ==== Overlay "Entrando na arena..." ====
    if (this.p1Locked && this.p2Locked && this.p1Index === this.p2Index) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, CONFIG.HEIGHT / 2 - 60, CONFIG.WIDTH, 120);

      ctx.fillStyle = CONFIG.COLORS.GOLD;
      ctx.font = "900 52px Orbitron";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ENTRANDO NA ARENA...", CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);
    }
  }
}