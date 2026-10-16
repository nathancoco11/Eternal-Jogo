/* =========================
   ETERNAL FIGHTER - Config
   ========================= */

const CONFIG = {
  // Resolução interna do jogo
  WIDTH: 1280,
  HEIGHT: 720,

  // FPS alvo
  FPS: 60,

  // Cores do tema
  COLORS: {
    BG:        "#0a0a0a",
    GOLD:      "#c9a227",
    BLOOD:     "#8b0000",
    WHITE:     "#e0e0e0",
    BLACK:     "#000000",
    DARK_RED:  "#1a0505",
    GRAY:      "#333333",
  },

  // Nomes das cenas (evita erro de digitação)
  SCENES: {
    MENU:        "menu",
    CHAR_SELECT: "charSelect",
    MAP_SELECT:  "mapSelect",
    BATTLE:      "battle",
  },
};

/* =========================
   15 PERSONAGENS (placeholder)
   Troque nome/cor quando tiver os sprites reais
   ========================= */

const CHARACTERS = [
  { id: 0,  name: "Kael",     color: "#e63946", hp: 100, speed: 5, power: 8 },
  { id: 1,  name: "Nyx",      color: "#9d4edd", hp: 95,  speed: 6, power: 7 },
  { id: 2,  name: "Ragnar",   color: "#8b0000", hp: 120, speed: 3, power: 10 },
  { id: 3,  name: "Sora",     color: "#4cc9f0", hp: 90,  speed: 7, power: 6 },
  { id: 4,  name: "Vex",      color: "#2a9d8f", hp: 100, speed: 5, power: 8 },
  { id: 5,  name: "Morrigan", color: "#7209b7", hp: 95,  speed: 6, power: 7 },
  { id: 6,  name: "Drax",     color: "#606c38", hp: 110, speed: 4, power: 9 },
  { id: 7,  name: "Lyra",     color: "#f72585", hp: 90,  speed: 7, power: 6 },
  { id: 8,  name: "Zane",     color: "#ffb703", hp: 100, speed: 5, power: 8 },
  { id: 9,  name: "Kira",     color: "#fb8500", hp: 95,  speed: 6, power: 7 },
  { id: 10, name: "Orion",    color: "#457b9d", hp: 105, speed: 4, power: 9 },
  { id: 11, name: "Sable",    color: "#3a0ca3", hp: 100, speed: 5, power: 8 },
  { id: 12, name: "Thorne",   color: "#588157", hp: 115, speed: 3, power: 10 },
  { id: 13, name: "Echo",     color: "#a3b18a", hp: 90,  speed: 7, power: 6 },
  { id: 14, name: "Vega",     color: "#bc4749", hp: 100, speed: 5, power: 8 },
];

/* =========================
   MAPAS (placeholder)
   ========================= */

const MAPS = [
  { id: 0, name: "Arena Eterna",  colorTop: "#1a0505", colorBottom: "#000000" },
  { id: 1, name: "Templo Perdido", colorTop: "#2a1a05", colorBottom: "#0a0500" },
  { id: 2, name: "Vazio Estelar",  colorTop: "#050a1a", colorBottom: "#000000" },
  { id: 3, name: "Covil de Sangue", colorTop: "#2a0505", colorBottom: "#0a0000" },
  { id: 4, name: "Cume Dourado",   colorTop: "#2a2505", colorBottom: "#0a0800" },
];