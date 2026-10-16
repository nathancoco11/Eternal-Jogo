/* =========================
   ETERNAL FIGHTER - Fighter
   ========================= */

class Fighter {
  constructor(player, data, startX, facing) {
    this.player = player;           // "p1" ou "p2"
    this.data = data;               // vem do CHARACTERS (name, color, hp...)

    // Posição e tamanho (retângulo placeholder)
    this.width = 80;
    this.height = 160;
    this.x = startX;
    this.y = CONFIG.HEIGHT - this.height - 60; // pé no chão

    // Física
    this.vx = 0;
    this.vy = 0;
    this.speed = data.speed;
    this.jumpForce = -16;
    this.gravity = 0.8;
    this.onGround = true;
    this.facing = facing;           // 1 = olhando pra direita, -1 = pra esquerda

    // Vida
    this.maxHp = data.hp;
    this.hp = data.hp;

    // Estados de ação
    this.state = "idle";            // idle | walk | jump | crouch | punch | kick | hit
    this.attackTimer = 0;           // tempo restante da animação de ataque
    this.attackDuration = 18;       // frames que dura o ataque
    this.hitCooldown = 0;           // evita tomar dano várias vezes seguidas
    this.hitFlash = 0;              // piscar vermelho ao tomar dano

    // Ataque ativo (só causa dano no meio da animação)
    this.attackActive = false;
  }

  /* =========================
     UPDATE - roda a cada frame
     ========================= */
  update(opponent) {
    // Se tomou hit recentemente, decrementa o flash
    if (this.hitFlash > 0) this.hitFlash--;

    // Cooldown pra tomar dano
    if (this.hitCooldown > 0) this.hitCooldown--;

    // Se está atacando, trava movimento
    if (this.attackTimer > 0) {
      this.attackTimer--;
      // Ataque fica "ativo" entre os frames 4 e 12 (meio da animação)
      this.attackActive =
        this.attackTimer < 14 && this.attackTimer > 6;

      if (this.attackTimer === 0) {
        this.state = "idle";
        this.attackActive = false;
      }
    } else {
      this.handleInput();
    }

    // Aplica física
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;

    // Colisão com o chão
    const groundY = CONFIG.HEIGHT - this.height - 60;
    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.onGround = true;
      if (this.state === "jump") this.state = "idle";
    } else {
      this.onGround = false;
    }

    // Limita dentro da tela
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > CONFIG.WIDTH)
      this.x = CONFIG.WIDTH - this.width;

    // Atualiza direção (sempre olha pro oponente)
    this.facing = this.x + this.width / 2 < opponent.x + opponent.width / 2
      ? 1
      : -1;
  }

  /* =========================
     INPUT - controle do jogador
     ========================= */
  handleInput() {
    const isCrouching = Input.isPlayerDown(this.player, "down");

    // Agachar
    if (isCrouching && this.onGround) {
      this.state = "crouch";
      this.vx = 0;
      return;
    }

    // Pulo
    if (
      Input.isPlayerPressed(this.player, "up") &&
      this.onGround
    ) {
      this.vy = this.jumpForce;
      this.onGround = false;
      this.state = "jump";
    }

    // Soco
    if (Input.isPlayerPressed(this.player, "punch")) {
      this.startAttack("punch");
      return;
    }

    // Chute
    if (Input.isPlayerPressed(this.player, "kick")) {
      this.startAttack("kick");
      return;
    }

    // Movimento horizontal
    let moving = false;
    if (Input.isPlayerDown(this.player, "left")) {
      this.vx = -this.speed;
      moving = true;
    } else if (Input.isPlayerDown(this.player, "right")) {
      this.vx = this.speed;
      moving = true;
    } else {
      this.vx = 0;
    }

    if (this.onGround) {
      this.state = moving ? "walk" : "idle";
    }
  }

  /* =========================
     ATAQUE
     ========================= */
  startAttack(type) {
    this.state = type;
    this.attackTimer = this.attackDuration;
    this.vx = 0;
  }

  /* =========================
     TOMAR DANO
     ========================= */
  takeDamage(amount) {
    if (this.hitCooldown > 0) return;
    this.hp = Math.max(0, this.hp - amount);
    this.hitCooldown = 20;
    this.hitFlash = 8;
  }

  /* =========================
     HITBOX de ataque
     ========================= */
  getAttackBox() {
    if (!this.attackActive) return null;

    const isPunch = this.state === "punch";
    const reach = isPunch ? 60 : 75;
    const boxHeight = isPunch ? 30 : 45;
    const yOffset = isPunch ? 50 : 90;

    return {
      x: this.facing === 1
        ? this.x + this.width
        : this.x - reach,
      y: this.y + yOffset,
      width: reach,
      height: boxHeight,
    };
  }

  /* =========================
     CORPO (pra colisão de dano)
     ========================= */
  getBodyBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /* =========================
     DESENHO
     ========================= */
  draw(ctx) {
    const isCrouching = this.state === "crouch";
    const drawHeight = isCrouching ? this.height * 0.65 : this.height;
    const drawY = this.y + (this.height - drawHeight);

    // Cor base (ou branco piscando se tomou dano)
    let color = this.data.color;
    if (this.hitFlash > 0) color = "#ffffff";

    // Corpo do lutador
    ctx.fillStyle = color;
    ctx.fillRect(this.x, drawY, this.width, drawHeight);

    // Contorno
    ctx.strokeStyle = CONFIG.COLORS.GOLD;
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, drawY, this.width, drawHeight);

    // Nome
    ctx.fillStyle = CONFIG.COLORS.WHITE;
    ctx.font = "bold 16px Orbitron";
    ctx.textAlign = "center";
    ctx.fillText(this.data.name, this.x + this.width / 2, drawY - 10);

    // Indicador de golpe (retângulo amarelo quando ataca)
    const atkBox = this.getAttackBox();
    if (atkBox) {
      ctx.fillStyle = "rgba(255, 200, 0, 0.5)";
      ctx.fillRect(atkBox.x, atkBox.y, atkBox.width, atkBox.height);
    }
  }

  /* =========================
     RESET (pra novos rounds)
     ========================= */
  reset(startX, facing) {
    this.x = startX;
    this.y = CONFIG.HEIGHT - this.height - 60;
    this.vx = 0;
    this.vy = 0;
    this.hp = this.maxHp;
    this.state = "idle";
    this.attackTimer = 0;
    this.hitCooldown = 0;
    this.hitFlash = 0;
    this.facing = facing;
  }
}