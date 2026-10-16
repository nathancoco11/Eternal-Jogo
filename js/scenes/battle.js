/* =========================
   ETERNAL FIGHTER - Battle
   ========================= */

class BattleScene {
  constructor(game) {
    this.game = game;

    // Lutadores (criados no init)
    this.p1 = null;
    this.p2 = null;

    // Mapa escolhido
    this.map = null;

    // Sistema de rounds
    this.round = 1;
    this.maxRounds = 3;
    this.p1Wins = 0;
    this.p2Wins = 0;

    // Estados da batalha
    // "countdown" → "fight" → "roundEnd" → "matchEnd"
    this.phase = "countdown";
    this.phaseTimer = 0;

    // Contagem regressiva (3, 2, 1)
    this.countdown = 3;

    // Vencedor do round/match
    this.roundWinner = null;
    this.matchWinner = null;

    // Timer de texto (ex: "K.O.")
    this.bigTextTimer = 0;
    this.bigText = "";

    // Tremor de tela ao acertar golpe
    this.shakeTime = 0;
    this.shakeIntensity = 0;

    // Efeitos de partícula (impacto)
    this.particles = [];
  }

  init() {
    const char1 = this.game.data.p1Char;
    const char2 = this.game.data.p2Char;
    this.map = this.game.data.selectedMap;

    // Cria lutadores
    this.p1 = new Fighter("p1", char1, 280, 1);
    this.p2 = new Fighter("p2", char2, CONFIG.WIDTH - 360, -1);

    // Começa com contagem
    this.phase = "countdown";
    this.phaseTimer = 0;
    this.countdown = 3;
    this.bigText = "";
  }

  /* =========================
     UPDATE
     ========================= */
  update() {
    // Tremor de tela decai
    if (this.shakeTime > 0) this.shakeTime--;

    // Partículas
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5;
      p.life--;
      return p.life > 0;
    });

    // Texto grande (K.O., etc)
    if (this.bigTextTimer > 0) this.bigTextTimer--;

    // ==== FASES ====
    switch (this.phase) {
      case "countdown":  this.updateCountdown(); break;
      case "fight":      this.updateFight();     break;
      case "roundEnd":   this.updateRoundEnd();  break;
      case "matchEnd":   this.updateMatchEnd();  break;
    }
  }

  /* ---------- CONTAGEM REGRESSIVA ---------- */
  updateCountdown() {
    this.phaseTimer++;

    if (this.phaseTimer === 60) { this.countdown = 2; }
    if (this.phaseTimer === 120) { this.countdown = 1; }
    if (this.phaseTimer === 180) {
      this.countdown = "LUTEM!";
      this.phase = "fight";
      this.phaseTimer = 0;
      this.bigText = "LUTEM!";
      this.bigTextTimer = 60;
    }

    // Lutadores ficam paradinhos nessa fase
    this.p1.vx = 0;
    this.p2.vx = 0;
  }

  /* ---------- LUTA ATIVA ---------- */
  updateFight() {
    // Atualiza lutadores
    this.p1.update(this.p2);
    this.p2.update(this.p1);

    // Impede sobreposição dos corpos (colisão lateral)
    this.resolveBodyOverlap();

    // Checa hits
    this.checkHit(this.p1, this.p2);
    this.checkHit(this.p2, this.p1);

    // Verifica fim de round
    if (this.p1.hp <= 0 || this.p2.hp <= 0) {
      this.endRound();
    }
  }

  /* ---------- FIM DE ROUND ---------- */
  updateRoundEnd() {
    this.phaseTimer++;

    // Lutadores continuam caindo fisicamente, mas sem input
    this.p1.vx = 0;
    this.p2.vx = 0;

    // Após 90 frames, ou vai pro próximo round, ou termina o match
    if (this.phaseTimer >= 120) {
      if (this.p1Wins >= 2 || this.p2Wins >= 2) {
        // Alguém venceu a melhor de 3
        this.phase = "matchEnd";
        this.phaseTimer = 0;
        this.matchWinner = this.p1Wins >= 2 ? this.p1 : this.p2;
      } else {
        // Novo round
        this.startNewRound();
      }
    }
  }

  /* ---------- FIM DE MATCH ---------- */
  updateMatchEnd() {
    this.phaseTimer++;

    if (this.phaseTimer > 180) {
      // Depois de 3s, aperta qualquer coisa pra voltar
      if (Input.isPressed("Enter") || Input.isPressed("Space")) {
        this.game.changeScene(CONFIG.SCENES.MENU);
      }
    }
  }

  /* =========================
     LÓGICA DE ROUND
     ========================= */
  startNewRound() {
    this.round++;
    this.p1.reset(280, 1);
    this.p2.reset(CONFIG.WIDTH - 360, -1);

    this.phase = "countdown";
    this.phaseTimer = 0;
    this.countdown = 3;
    this.roundWinner = null;
    this.bigText = "";
  }

  endRound() {
    this.phase = "roundEnd";
    this.phaseTimer = 0;

    // Quem ficou com mais vida venceu
    if (this.p1.hp > this.p2.hp) {
      this.p1Wins++;
      this.roundWinner = this.p1;
      this.bigText = "K.O.";
    } else if (this.p2.hp > this.p1.hp) {
      this.p2Wins++;
      this.roundWinner = this.p2;
      this.bigText = "K.O.";
    } else {
      // Empate (não conta pra ninguém)
      this.bigText = "EMPATE";
    }
    this.bigTextTimer = 120;
  }

  /* =========================
     COLISÃO ENTRE CORPOS
     ========================= */
  resolveBodyOverlap() {
    const a = this.p1.getBodyBox();
    const b = this.p2.getBodyBox();

    // Se sobrepõem horizontalmente
    if (
      a.x < b.x + b.width &&
      a.x + a.width > b.x
    ) {
      // Empurra pra longe um do outro
      const overlap = Math.min(
        a.x + a.width - b.x,
        b.x + b.width - a.x
      );

      if (a.x < b.x) {
        this.p1.x -= overlap / 2;
        this.p2.x += overlap / 2;
      } else {
        this.p1.x += overlap / 2;
        this.p2.x -= overlap / 2;
      }

      // Não deixa sair da tela
      if (this.p1.x < 0) this.p1.x = 0;
      if (this.p2.x < 0) this.p2.x = 0;
      if (this.p1.x + this.p1.width > CONFIG.WIDTH)
        this.p1.x = CONFIG.WIDTH - this.p1.width;
      if (this.p2.x + this.p2.width > CONFIG.WIDTH)
        this.p2.x = CONFIG.WIDTH - this.p2.width;
    }
  }

  /* =========================
     CHECAGEM DE HIT
     ========================= */
  checkHit(attacker, defender) {
    const atkBox = attacker.getAttackBox();
    if (!atkBox) return;

    const defBox = defender.getBodyBox();

    // Colisão AABB
    if (
      atkBox.x < defBox.x + defBox.width &&
      atkBox.x + atkBox.width > defBox.x &&
      atkBox.y < defBox.y + defBox.height &&
      atkBox.y + atkBox.height > defBox.y
    ) {
      // Acertou!
      if (defender.hitCooldown === 0) {
        const damage = attacker.state === "punch"
          ? attacker.data.power
          : attacker.data.power + 2;

        defender.takeDamage(damage);

        // Tremor de tela
        this.shakeTime = 10;
        this.shakeIntensity = 8;

        // Partículas
        this.spawnHitParticles(
          atkBox.x + atkBox.width / 2,
          atkBox.y + atkBox.height / 2
        );
      }
    }
  }

  spawnHitParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 3,
        life: 20 + Math.random() * 15,
        color: Math.random() > 0.5 ? CONFIG.COLORS.GOLD : "#ffffff",
        size: 3 + Math.random() * 4,
      });
    }
  }

  /* =========================
     DRAW
     ========================= */
  draw(ctx) {
    ctx.save();

    // Tremor de tela
    if (this.shakeTime > 0) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(sx, sy);
    }

    // ==== FUNDO (mapa escolhido) ====
    this.drawBackground(ctx);

    // ==== LUTADORES ====
    // Desenha quem tá mais atrás primeiro? Aqui é simples, desenha P1 depois P2
    this.p1.draw(ctx);
    this.p2.draw(ctx);

    // ==== PARTÍCULAS ====
    this.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life / 30);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    // ==== HUD ====
    this.drawHUD(ctx);

    // ==== TEXTOS GRANDES ====
    this.drawBigText(ctx);

    // ==== FASES ESPECIAIS ====
    if (this.phase === "matchEnd") {
      this.drawMatchEnd(ctx);
    }

    ctx.restore();
  }

  drawBackground(ctx) {
    // Gradiente do mapa escolhido
    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT);
    grad.addColorStop(0, this.map.colorTop);
    grad.addColorStop(1, this.map.colorBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // Nome do mapa (canto)
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.font = "700 16px Orbitron";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(this.map.name.toUpperCase(), 20, CONFIG.HEIGHT - 30);

    // ==== CHÃO ====
    const groundY = CONFIG.HEIGHT - 60;
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, groundY, CONFIG.WIDTH, 60);

    ctx.strokeStyle = CONFIG.COLORS.GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(CONFIG.WIDTH, groundY);
    ctx.stroke();
  }

  drawHUD(ctx) {
    const barW = 480;
    const barH = 30;
    const y = 30;

    // ===== BARRA P1 =====
    this.drawHealthBar(
      ctx,
      40, y, barW, barH,
      this.p1.hp, this.p1.maxHp,
      "#e63946",
      "left"
    );

    // ===== BARRA P2 =====
    this.drawHealthBar(
      ctx,
      CONFIG.WIDTH - 40 - barW, y, barW, barH,
      this.p2.hp, this.p2.maxHp,
      "#4cc9f0",
      "right"
    );

    // ===== NOMES =====
    ctx.font = "700 18px Orbitron";
    ctx.fillStyle = CONFIG.COLORS.WHITE;
    ctx.textBaseline = "middle";

    ctx.textAlign = "left";
    ctx.fillText(this.p1.data.name, 40, y + barH + 20);

    ctx.textAlign = "right";
    ctx.fillText(this.p2.data.name, CONFIG.WIDTH - 40, y + barH + 20);

    // ===== ROUND (centro) =====
    ctx.textAlign = "center";
    ctx.fillStyle = CONFIG.COLORS.GOLD;
    ctx.font = "900 26px Orbitron";
    ctx.fillText(`ROUND ${this.round}`, CONFIG.WIDTH / 2, y + barH / 2);

    // ===== VITÓRIAS (bolinhas) =====
    const dotR = 8;
    for (let i = 0; i < 2; i++) {
      // P1
      ctx.beginPath();
      ctx.arc(60 + i * 30, y + barH + 50, dotR, 0, Math.PI * 2);
      ctx.fillStyle = i < this.p1Wins ? CONFIG.COLORS.GOLD : "#333";
      ctx.fill();

      // P2
      ctx.beginPath();
      ctx.arc(CONFIG.WIDTH - 60 - i * 30, y + barH + 50, dotR, 0, Math.PI * 2);
      ctx.fillStyle = i < this.p2Wins ? CONFIG.COLORS.GOLD : "#333";
      ctx.fill();
    }
  }

  drawHealthBar(ctx, x, y, w, h, hp, maxHp, color, dir) {
    // Fundo
    ctx.fillStyle = "#111";
    ctx.fillRect(x, y, w, h);

    // Barra (com borda dourada)
    const ratio = Math.max(0, hp / maxHp);
    const fillW = w * ratio;

    ctx.fillStyle = color;
    if (dir === "left") {
      ctx.fillRect(x, y, fillW, h);
    } else {
      ctx.fillRect(x + w - fillW, y, fillW, h);
    }

    // Borda
    ctx.strokeStyle = CONFIG.COLORS.GOLD;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);

    // Texto com valor
    ctx.fillStyle = CONFIG.COLORS.WHITE;
    ctx.font = "700 14px Orbitron";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.ceil(hp)} / ${maxHp}`, x + w / 2, y + h / 2);
  }

  drawBigText(ctx) {
    if (this.bigTextTimer <= 0) return;

    const alpha = Math.min(1, this.bigTextTimer / 30);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = CONFIG.COLORS.GOLD;
    ctx.shadowColor = CONFIG.COLORS.BLOOD;
    ctx.shadowBlur = 30;

    ctx.font = "900 120px Orbitron";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(this.bigText, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);

    ctx.restore();
  }

  drawMatchEnd(ctx) {
    // Escurece
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // Nome do vencedor
    ctx.fillStyle = CONFIG.COLORS.GOLD;
    ctx.shadowColor = CONFIG.COLORS.BLOOD;
    ctx.shadowBlur = 40;
    ctx.font = "900 72px Orbitron";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      `${this.matchWinner.data.name} VENCEU!`,
      CONFIG.WIDTH / 2,
      CONFIG.HEIGHT / 2 - 40
    );

    ctx.shadowBlur = 0;

    // Placar final
    ctx.fillStyle = CONFIG.COLORS.WHITE;
    ctx.font = "700 28px Orbitron";
    ctx.fillText(
      `${this.p1Wins}  -  ${this.p2Wins}`,
      CONFIG.WIDTH / 2,
      CONFIG.HEIGHT / 2 + 50
    );

    // Instrução pra voltar
    if (this.phaseTimer > 180) {
      const blink = Math.sin(this.phaseTimer * 0.1) > 0;
      if (blink) {
        ctx.fillStyle = CONFIG.COLORS.WHITE;
        ctx.font = "700 20px Orbitron";
        ctx.fillText(
          "Pressione ENTER para voltar ao menu",
          CONFIG.WIDTH / 2,
          CONFIG.HEIGHT - 80
        );
      }
    }
  }
}