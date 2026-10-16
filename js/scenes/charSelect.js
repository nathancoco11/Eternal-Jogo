/* =========================
   ETERNAL FIGHTER - Character Select
   ========================= */

class CharSelectScene {
  constructor(game) {
    this.game = game;

    // Grade 5x3 = 15 personagens
    this.cols = 5;
    this.rows = 3;

    // Índices selecionados (0-14)
    this.p1Index = 0;
    this.p2Index = 14;

    // Confirmações
    this.p1Locked = false;
    this.p2Locked = false;

    // Timer pra animação de "piscando"
    this.timer = 0;

    // Timer pra avançar quando os dois confirmarem
    this.startCountdown = 0;
  }

  init() {}

  /* =========================
     UPDATE
     ========================= */
  update() {
    this.timer += 0.05;

    // P1
    if (!this.p1Locked) {
      if (Input.isPlayerPressed("p1", "left"))  this.p1Index -= 1;
      if (Input.isPlayerPressed("p1", "right")) this.p1Index += 1;
      if (Input.isPlayerPressed("p1", "up"))    this.p1Index -= this.cols;
      if (Input.isPlayerPressed("p1", "down"))  this.p1Index += this.cols;

      // Wrap nas laterais (mantém linha)
      this.p1Index = this.wrapGrid(this.p1Index);
    }

    // P2
    if (!this.p2Locked) {
      if (Input.isPlayerPressed("p2", "left"))  this.p2Index -= 1;
      if (Input.isPlayerPressed("p2", "right")) this.p2Index += 1;
      if (Input.isPlayerPressed("p2", "up"))    this.p2Index -= this.cols;
      if (Input.isPlayerPressed("p2", "down"))  this.p2Index += this.cols;

      this.p2Index = this.wrapGrid(this.p2Index);
    }

    // Confirmações
    if (Input.isPlayerPressed("p1", "punch") && !this.p1Locked) {
      this.p1Locked = true;
    }
    if (Input.isPlayerPressed("p2", "punch") && !this.p2Locked) {
      this.p2Locked = true;
    }

    // Escape destrava (caso queira mudar)
    if (Input.isPressed("Escape")) {
      this.p1Locked = false;
      this.p2Locked = false;
    }

    // Se os dois confirmaram → avança
    if (this.p1Locked && this.p2Locked) {
      this.startCountdown++;
      if (this.startCountdown > 45) {
        // Salva escolhas e vai pro mapa
        this.game.data.p1Char = CHARACTERS[this.p1Index];
        this.game.data.p2Char = CHARACTERS[this.p2Index];
        this.game.changeScene(CONFIG.SCENES.MAP_SELECT);
      }
    }
  }

  /* Mantém o índice válido dentro da grade 5x3 */
  wrapGrid(index) {
    const total = this.cols * this.rows;
    // Wrap vertical entre linhas mantendo coluna
    let col = ((index % this.cols) + this.cols) % this.cols;
    let row = Math.floor(index / this.cols);

    if (row < 0) row = this.rows - 1;
    if (row >= this.rows) row = 0;

    return row * this.cols + col;
  }

  /* =========================
     DRAW
     ========================= */
  draw(ctx) {
    // Fundo
    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT);
    grad.addColorStop(0, "#1a0505");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // Título
    ctx.fillStyle = CONFIG.COLORS.GOLD;
    ctx.font = "900 42px Orbitron";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ESCOLHA SEU LUTADOR", CONFIG.WIDTH / 2, 60);

    // ==== GRID de personagens (centro) ====
    const cellW = 90;
    const cellH = 100;
    const gap = 12;
    const gridW = this.cols * cellW + (this.cols - 1) * gap;
    const gridX = (CONFIG.WIDTH - gridW) / 2;
    const gridY = 130;

    CHARACTERS.forEach((char, i) => {
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);
      const x = gridX + col * (cellW + gap);
      const y = gridY + row * (cellH + gap);

      // Fundo do card
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(x, y, cellW, cellH);

      // Cor do personagem (retângulo colorido)
      ctx.fillStyle = char.color;
      ctx.fillRect(x + 10, y + 10, cellW - 20, cellH - 40);

      // Nome
      ctx.fillStyle = CONFIG.COLORS.WHITE;
      ctx.font = "700 12px Orbitron";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char.name, x + cellW / 2, y + cellH - 18);

      // Borda base
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cellW, cellH);
    });

    // ==== Seleção P1 (borda vermelha) ====
    if (!this.p1Locked) {
      const pos = this.getCellPos(this.p1Index, gridX, gridY, cellW, cellH, gap);
      ctx.save();
      ctx.strokeStyle = "#e63946";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#e63946";
      ctx.shadowBlur = 15 + Math.sin(this.timer * 3) * 5;
      ctx.strokeRect(pos.x, pos.y, cellW, cellH);
      ctx.restore();
    }

    // ==== Seleção P2 (borda azul) ====
    if (!this.p2Locked) {
      const pos = this.getCellPos(this.p2Index, gridX, gridY, cellW, cellH, gap);
      ctx.save();
      ctx.strokeStyle = "#4cc9f0";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#4cc9f0";
      ctx.shadowBlur = 15 + Math.sin(this.timer * 3) * 5;
      ctx.strokeRect(pos.x, pos.y, cellW, cellH);
      ctx.restore();
    }

    // ==== Painel P1 (esquerda) ====
    this.drawPlayerPanel(
      ctx,
      "JOGADOR 1",
      this.game.data.p1Char || CHARACTERS[this.p1Index],
      this.p1Locked,
      "#e63946",
      80
    );

    // ==== Painel P2 (direita) ====
    this.drawPlayerPanel(
      ctx,
      "JOGADOR 2",
      this.game.data.p2Char || CHARACTERS[this.p2Index],
      this.p2Locked,
      "#4cc9f0",
      CONFIG.WIDTH - 320
    );

    // ==== "PRONTO!" quando confirma ====
    if (this.p1Locked) {
      ctx.fillStyle = CONFIG.COLORS.GOLD;
      ctx.font = "900 28px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText("PRONTO!", 240, 240);
    }
    if (this.p2Locked) {
      ctx.fillStyle = CONFIG.COLORS.GOLD;
      ctx.font = "900 28px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText("PRONTO!", CONFIG.WIDTH - 240, 240);
    }

    // ==== Rodapé ====
    ctx.fillStyle = "#666";
    ctx.font = "400 13px Orbitron";
    ctx.textAlign = "center";
    ctx.fillText(
      "P1: WASD mover  •  F confirmar      |      P2: setas mover  •  K confirmar      |      ESC voltar",
      CONFIG.WIDTH / 2,
      CONFIG.HEIGHT - 30
    );

    // ==== Contagem "Começando..." ====
    if (this.p1Locked && this.p2Locked) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, CONFIG.HEIGHT / 2 - 60, CONFIG.WIDTH, 120);

      ctx.fillStyle = CONFIG.COLORS.GOLD;
      ctx.font = "900 52px Orbitron";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ESCOLHENDO MAPA...", CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);
    }
  }

  getCellPos(index, gridX, gridY, cellW, cellH, gap) {
    const col = index % this.cols;
    const row = Math.floor(index / this.cols);
    return {
      x: gridX + col * (cellW + gap),
      y: gridY + row * (cellH + gap),
    };
  }

  drawPlayerPanel(ctx, label, char, locked, color, x) {
    const y = 130;
    const w = 240;
    const h = 360;

    // Fundo do painel
    ctx.fillStyle = "rgba(10, 10, 10, 0.8)";
    ctx.fillRect(x, y, w, h);

    // Borda
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Label
    ctx.fillStyle = color;
    ctx.font = "900 22px Orbitron";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + w / 2, y + 30);

    // Personagem grande
    ctx.fillStyle = char.color;
    ctx.fillRect(x + 40, y + 70, w - 80, 180);

    ctx.strokeStyle = CONFIG.COLORS.GOLD;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 40, y + 70, w - 80, 180);

    // Nome
    ctx.fillStyle = CONFIG.COLORS.WHITE;
    ctx.font = "700 20px Orbitron";
    ctx.fillText(char.name, x + w / 2, y + 285);

    // Stats
    ctx.font = "400 13px Orbitron";
    ctx.textAlign = "left";
    ctx.fillStyle = "#aaa";
    ctx.fillText(`HP:    ${char.hp}`,   x + 30, y + 315);
    ctx.fillText(`SPD:   ${char.speed}`, x + 30, y + 335);
    ctx.fillText(`PWR:   ${char.power}`, x + 30, y + 355);
  }
}