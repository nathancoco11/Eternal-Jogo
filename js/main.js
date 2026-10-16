/* =========================
   ETERNAL FIGHTER - Main
   ========================= */

const Game = {
  canvas: null,
  ctx: null,

  // Cena atual (string, ex: "menu")
  currentScene: null,

  // Objeto da cena ativa (tem update/draw)
  sceneInstance: null,

  // Dados compartilhados entre cenas (personagens escolhidos, mapa...)
  data: {
    p1Char: null,
    p2Char: null,
    selectedMap: null,
  },

  // Controle de tempo (FPS fixo)
  lastTime: 0,
  accumulator: 0,
  frameInterval: 1000 / CONFIG.FPS,

  /* =========================
     INICIALIZAÇÃO
     ========================= */
  init() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");

    // Suavização desligada (visual mais "pixel")
    this.ctx.imageSmoothingEnabled = false;

    // Inicializa o sistema de input
    Input.init();

    // Registra todas as cenas disponíveis
    this.scenes = {
      [CONFIG.SCENES.MENU]:        MenuScene,
      [CONFIG.SCENES.CHAR_SELECT]: CharSelectScene,
      [CONFIG.SCENES.MAP_SELECT]:  MapSelectScene,
      [CONFIG.SCENES.BATTLE]:      BattleScene,
    };

    // Começa no menu
    this.changeScene(CONFIG.SCENES.MENU);

    // Inicia o loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  },

  /* =========================
     TROCA DE CENA
     ========================= */
  changeScene(sceneName) {
    this.currentScene = sceneName;
    const SceneClass = this.scenes[sceneName];

    if (!SceneClass) {
      console.error(`Cena "${sceneName}" não encontrada!`);
      return;
    }

    // Cria a instância da cena
    this.sceneInstance = new SceneClass(this);

    // Chama init() da cena, se existir
    if (typeof this.sceneInstance.init === "function") {
      this.sceneInstance.init();
    }
  },

  /* =========================
     GAME LOOP (60 FPS fixo)
     ========================= */
  loop(currentTime) {
    const delta = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.accumulator += delta;

    // Roda update em passos fixos (60 por segundo)
    while (this.accumulator >= this.frameInterval) {
      this.update();
      this.accumulator -= this.frameInterval;
    }

    // Desenha 1 vez por frame do navegador
    this.draw();

    // Continua o loop
    requestAnimationFrame((t) => this.loop(t));
  },

  /* =========================
     UPDATE (lógica)
     ========================= */
  update() {
    if (this.sceneInstance && typeof this.sceneInstance.update === "function") {
      this.sceneInstance.update();
    }

    // IMPORTANTE: limpa teclas "pressed" no fim do frame
    Input.clearPressed();
  },

  /* =========================
     DRAW (renderização)
     ========================= */
  draw() {
    // Limpa a tela
    this.ctx.fillStyle = CONFIG.COLORS.BLACK;
    this.ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // Desenha a cena atual
    if (this.sceneInstance && typeof this.sceneInstance.draw === "function") {
      this.sceneInstance.draw(this.ctx);
    }
  },
};

/* =========================
   INICIA QUANDO A PÁGINA CARREGAR
   ========================= */
window.addEventListener("load", () => {
  Game.init();
});