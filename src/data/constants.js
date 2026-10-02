// =============================================================================
// constants.js — TODOS os valores de tuning do jogo vivem aqui.
// Para mudar o "feel" do jogo (pulo mais alto, dash mais rápido...) basta
// editar este arquivo. Nada de número mágico espalhado pela lógica.
// =============================================================================

// --- Grade / resolução ------------------------------------------------------
export const TILE = 16;              // tamanho de um tile em pixels lógicos
export const VIEW_W = 480;           // resolução lógica interna (16:9)
export const VIEW_H = 270;

// --- Loop -------------------------------------------------------------------
export const FIXED_DT = 1 / 60;      // passo fixo de simulação (60 FPS)
export const MAX_DT = 0.1;           // cap do delta (aba trocada não explode)

// --- Física global ----------------------------------------------------------
export const GRAVITY = 900;          // px/s²
export const MAX_FALL = 620;         // velocidade máxima de queda
export const GRAVITY_LOW = 0.55;     // gravidade reduzida enquanto segura pulo

// --- Jogador: corrida -------------------------------------------------------
export const RUN_ACCEL = 1500;       // aceleração no chão
export const RUN_FRICTION = 2000;    // atrito no chão (sem input)
export const AIR_ACCEL = 1000;       // aceleração no ar
export const AIR_FRICTION = 300;     // atrito no ar
export const MAX_RUN = 152;          // velocidade máxima de corrida
export const TURN_BOOST = 1.6;       // aceleração extra ao inverter direção

// --- Jogador: pulo ----------------------------------------------------------
export const JUMP_VELOCITY = 336;    // impulso inicial (aplicado para cima)
export const JUMP_CUT = 0.42;        // multiplicador ao soltar o botão cedo
export const COYOTE_TIME = 0.1;      // pode pular até 0.1s depois de cair
export const JUMP_BUFFER = 0.15;     // registro de pulo 0.15s antes de pousar
export const LAND_SQUASH = 0.1;      // duração do achatamento ao pousar

// --- Jogador: parede --------------------------------------------------------
export const WALL_SLIDE_SPEED = 62;  // velocidade de descida na parede
export const WALL_JUMP_X = 196;      // impulso horizontal do wall jump
export const WALL_JUMP_Y = 324;      // impulso vertical do wall jump
export const WALL_STICK_TIME = 0.12; // tempo grudado após soltar a direção

// --- Jogador: dash ----------------------------------------------------------
export const DASH_SPEED = 430;
export const DASH_TIME = 0.15;
export const DASH_COOLDOWN = 0.8;
export const DASH_IFRAMES = 0.3;     // invencibilidade durante o dash
export const DASH_GHOSTS = 4;        // sprites fantasmas do rastro

// --- Jogador: combate -------------------------------------------------------
export const ATTACK_FRAMES = 3;
export const ATTACK_FRAME_TIME = 0.07;
export const ATTACK_RANGE = 20;      // alcance da espada
export const ATTACK_DAMAGE = 1;
export const ATTACK_COMBO_WINDOW = 1.1; // janela para emendar combos
export const HURT_IFRAMES = 1.2;     // invencibilidade após levar dano

// --- Juice ------------------------------------------------------------------
export const HIT_STOP = 0.04;        // 40ms de congelamento no acerto
export const KILL_FREEZE = 0.1;      // 100ms de freeze ao matar
export const MAX_PARTICLES = 80;     // teto de partículas simultâneas
export const SHAKE_HIT = 3;
export const SHAKE_KILL = 5;
export const SHAKE_LAND = 4;
export const SHAKE_DASH = 2;

// --- Progressão -------------------------------------------------------------
export const START_LIVES = 3;
export const MAX_LIVES = 5;
export const COINS_PER_LIFE = 100;   // +1 coração a cada 100 moedas
export const COMBO_BONUS = 250;      // bônus por 3 inimigos em sequência
export const COMBO_HITS = 3;

// --- Câmera -----------------------------------------------------------------
export const CAM_LERP = 0.15;
export const CAM_DEADZONE_X = 34;
export const CAM_DEADZONE_Y = 24;
export const CAM_ZOOM_BOSS = 0.82;
export const CAM_ZOOM_DEFAULT = 1;

// --- Armazenamento ----------------------------------------------------------
export const SAVE_KEY = 'belisco-ninja-save-v1';
