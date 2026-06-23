import Phaser from 'phaser';
import { ForestScene } from '../scenes/ForestScene.js';
import { GameState } from './GameState.js';

const AMBIENT_DEPTH = 16;
const AMBIENT_FRONT_DEPTH = 18;
const AMBIENT_TEXTURES = {
  dot: 'ambient-dot',
  petal: 'ambient-petal',
  mist: 'ambient-mist'
};

const FINAL_BACKGROUND_TO_AMBIENT_AREA = {
  'background-grecia': 'grecia',
  'background-sicilia': 'sicilia',
  'background-bristol': 'bristol'
};

const normalizeAmbientArea = (area = 'forest') => {
  if (area === 'pittore') {
    return 'cavallo';
  }
  return area || 'forest';
};

const ensureAmbientTexture = (scene, key, draw, width, height) => {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
};

const ensureAmbientTextures = (scene) => {
  ensureAmbientTexture(scene, AMBIENT_TEXTURES.dot, (graphics) => {
    graphics.fillStyle(0xffffff, 0.22);
    graphics.fillCircle(8, 8, 8);
    graphics.fillStyle(0xffffff, 0.74);
    graphics.fillCircle(8, 8, 3.2);
  }, 16, 16);

  ensureAmbientTexture(scene, AMBIENT_TEXTURES.petal, (graphics) => {
    graphics.fillStyle(0xffffff, 0.82);
    graphics.fillEllipse(10, 5, 18, 8);
    graphics.fillStyle(0xffffff, 0.42);
    graphics.fillEllipse(11, 5, 9, 3.5);
  }, 22, 12);

  ensureAmbientTexture(scene, AMBIENT_TEXTURES.mist, (graphics) => {
    graphics.fillStyle(0xffffff, 0.045);
    graphics.fillCircle(32, 32, 31);
    graphics.fillStyle(0xffffff, 0.08);
    graphics.fillCircle(32, 32, 18);
  }, 64, 64);
};

const destroyAmbientFx = (scene) => {
  scene.ambientFxObjects?.forEach((object) => {
    object?.stop?.();
    object?.destroy?.();
  });
  scene.ambientFxObjects = [];
};

const addAmbientEmitter = (scene, textureKey, config, options = {}) => {
  const emitter = scene.add.particles(0, 0, textureKey, config);
  emitter
    .setScrollFactor(options.scrollFactor ?? 0)
    .setDepth(options.depth ?? AMBIENT_DEPTH)
    .setAlpha(options.alpha ?? 1);
  scene.ambientFxObjects.push(emitter);
  return emitter;
};

const addBreathingTint = (scene, color, alpha = 0.08) => {
  const { width, height } = scene.scale;
  const overlay = scene.add
    .rectangle(0, 0, width, height, color, alpha)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(AMBIENT_DEPTH - 1)
    .setBlendMode(Phaser.BlendModes.ADD);

  scene.tweens.add({
    targets: overlay,
    alpha: alpha * 0.42,
    duration: 2800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  scene.ambientFxObjects.push(overlay);
  return overlay;
};

const createForestAmbientFx = (scene) => {
  const { width, height } = scene.scale;
  addAmbientEmitter(scene, AMBIENT_TEXTURES.dot, {
    x: { min: -40, max: width + 40 },
    y: { min: height * 0.08, max: height * 0.92 },
    lifespan: { min: 4200, max: 8200 },
    speedX: { min: -5, max: 8 },
    speedY: { min: -10, max: -2 },
    scale: { start: 0.18, end: 0.03 },
    alpha: { start: 0, peak: 0.38, end: 0 },
    tint: 0xdaf7d7,
    frequency: 190,
    quantity: 1,
    blendMode: Phaser.BlendModes.ADD
  });

  addAmbientEmitter(scene, AMBIENT_TEXTURES.dot, {
    x: { min: -20, max: width + 20 },
    y: { min: height * 0.18, max: height * 0.72 },
    lifespan: { min: 2600, max: 5400 },
    speedX: { min: -14, max: 14 },
    speedY: { min: -8, max: 4 },
    scale: { start: 0.34, end: 0.02 },
    alpha: { start: 0, peak: 0.62, end: 0 },
    tint: 0xfff2a0,
    frequency: 520,
    blendMode: Phaser.BlendModes.ADD
  }, { depth: AMBIENT_FRONT_DEPTH });
};

const createMadamaAmbientFx = (scene) => {
  const { width, height } = scene.scale;
  addBreathingTint(scene, 0xffd36b, 0.075);
  addAmbientEmitter(scene, AMBIENT_TEXTURES.dot, {
    x: { min: 0, max: width },
    y: { min: height * 0.12, max: height * 0.82 },
    lifespan: { min: 1700, max: 3600 },
    speedX: { min: -10, max: 10 },
    speedY: { min: -16, max: -4 },
    scale: { start: 0.13, end: 0.01 },
    alpha: { start: 0, peak: 0.85, end: 0 },
    tint: 0xffd36b,
    frequency: 120,
    quantity: 1,
    blendMode: Phaser.BlendModes.ADD
  }, { depth: AMBIENT_FRONT_DEPTH });
};

const createSposineAmbientFx = (scene) => {
  const { width, height } = scene.scale;
  addBreathingTint(scene, 0xffc7de, 0.055);
  addAmbientEmitter(scene, AMBIENT_TEXTURES.petal, {
    x: { min: -60, max: width + 60 },
    y: { min: -40, max: height * 0.12 },
    lifespan: { min: 5400, max: 9200 },
    speedX: { min: -16, max: 22 },
    speedY: { min: 10, max: 30 },
    rotate: { min: -40, max: 40 },
    angularVelocity: { min: -18, max: 18 },
    scale: { start: 0.26, end: 0.08 },
    alpha: { start: 0, peak: 0.52, end: 0 },
    tint: 0xffeef6,
    frequency: 360,
    quantity: 1,
    blendMode: Phaser.BlendModes.NORMAL
  }, { depth: AMBIENT_FRONT_DEPTH });
};

const createCavalloAmbientFx = (scene) => {
  const { width, height } = scene.scale;
  addBreathingTint(scene, 0x8ec9ff, 0.045);
  addAmbientEmitter(scene, AMBIENT_TEXTURES.dot, {
    x: { min: -20, max: width + 20 },
    y: { min: height * 0.08, max: height * 0.88 },
    lifespan: { min: 5200, max: 9600 },
    speedX: { min: -7, max: 7 },
    speedY: { min: -6, max: 5 },
    scale: { start: 0.16, end: 0.03 },
    alpha: { start: 0, peak: 0.34, end: 0 },
    tint: 0xd8efff,
    frequency: 150,
    quantity: 1,
    blendMode: Phaser.BlendModes.ADD
  });

  addAmbientEmitter(scene, AMBIENT_TEXTURES.dot, {
    x: { min: 0, max: width },
    y: { min: height * 0.18, max: height * 0.74 },
    lifespan: { min: 3000, max: 6200 },
    speedX: { min: -12, max: 12 },
    speedY: { min: -12, max: 8 },
    scale: { start: 0.1, end: 0.01 },
    alpha: { start: 0, peak: 0.56, end: 0 },
    tint: 0x7ee7ff,
    frequency: 420,
    blendMode: Phaser.BlendModes.ADD
  }, { depth: AMBIENT_FRONT_DEPTH });
};

const createFinaleAmbientFx = (scene) => {
  const { width, height } = scene.scale;
  addBreathingTint(scene, 0xf5f0a8, 0.07);
  addAmbientEmitter(scene, AMBIENT_TEXTURES.mist, {
    x: { min: -80, max: width + 80 },
    y: { min: height * 0.28, max: height + 80 },
    lifespan: { min: 7600, max: 12800 },
    speedX: { min: -8, max: 8 },
    speedY: { min: -18, max: -5 },
    scale: { start: 0.58, end: 0.9 },
    alpha: { start: 0, peak: 0.22, end: 0 },
    frequency: 540,
    quantity: 1,
    blendMode: Phaser.BlendModes.ADD
  });

  addAmbientEmitter(scene, AMBIENT_TEXTURES.dot, {
    x: { min: -40, max: width + 40 },
    y: { min: height * 0.22, max: height * 0.92 },
    lifespan: { min: 3600, max: 7600 },
    speedX: { min: -8, max: 8 },
    speedY: { min: -24, max: -7 },
    scale: { start: 0.22, end: 0.02 },
    alpha: { start: 0, peak: 0.6, end: 0 },
    tint: 0xfff5b8,
    frequency: 230,
    blendMode: Phaser.BlendModes.ADD
  }, { depth: AMBIENT_FRONT_DEPTH });
};

const createTravelAmbientFx = (scene, area) => {
  const { width, height } = scene.scale;
  const tintByArea = {
    grecia: 0xbfeaff,
    sicilia: 0xffdf9f,
    bristol: 0xcdd8ff
  };
  addBreathingTint(scene, tintByArea[area] ?? 0xffffff, 0.04);
  addAmbientEmitter(scene, AMBIENT_TEXTURES.dot, {
    x: { min: -30, max: width + 30 },
    y: { min: height * 0.12, max: height * 0.88 },
    lifespan: { min: 5000, max: 9800 },
    speedX: { min: -9, max: 9 },
    speedY: { min: -10, max: 3 },
    scale: { start: 0.14, end: 0.02 },
    alpha: { start: 0, peak: 0.28, end: 0 },
    tint: tintByArea[area] ?? 0xffffff,
    frequency: 230,
    blendMode: Phaser.BlendModes.ADD
  });
};

const createAmbientFx = (scene, area = 'forest') => {
  if (!scene?.add || !scene?.scale) {
    return;
  }

  const normalizedArea = normalizeAmbientArea(area);
  if (scene.currentAmbientArea === normalizedArea && scene.ambientFxObjects?.length) {
    return;
  }

  ensureAmbientTextures(scene);
  destroyAmbientFx(scene);
  scene.currentAmbientArea = normalizedArea;
  scene.ambientFxObjects = [];

  if (normalizedArea === 'madama') {
    createMadamaAmbientFx(scene);
    return;
  }
  if (normalizedArea === 'sposine') {
    createSposineAmbientFx(scene);
    return;
  }
  if (normalizedArea === 'cavallo') {
    createCavalloAmbientFx(scene);
    return;
  }
  if (normalizedArea === 'finale') {
    createFinaleAmbientFx(scene);
    return;
  }
  if (['grecia', 'sicilia', 'bristol'].includes(normalizedArea)) {
    createTravelAmbientFx(scene, normalizedArea);
    return;
  }

  createForestAmbientFx(scene);
};

const patchForestSceneAmbientFx = () => {
  if (ForestScene.prototype.__ambientFxPatched) {
    return;
  }
  ForestScene.prototype.__ambientFxPatched = true;

  ForestScene.prototype.clearAmbientFx = function clearAmbientFx() {
    destroyAmbientFx(this);
    this.currentAmbientArea = null;
  };

  ForestScene.prototype.createAmbientFx = function createAmbientFxForScene(area = GameState.currentArea ?? 'forest') {
    createAmbientFx(this, area);
  };

  const originalCreate = ForestScene.prototype.create;
  ForestScene.prototype.create = function patchedAmbientCreate(...args) {
    const result = originalCreate.apply(this, args);
    this.createAmbientFx(GameState.currentArea ?? 'forest');
    return result;
  };

  const originalUpdateAreaBackground = ForestScene.prototype.updateAreaBackground;
  ForestScene.prototype.updateAreaBackground = function patchedAmbientUpdateAreaBackground(area, ...args) {
    const result = originalUpdateAreaBackground.call(this, area, ...args);
    this.createAmbientFx(area);
    return result;
  };

  const originalShowFinalEndingScene = ForestScene.prototype.showFinalEndingScene;
  ForestScene.prototype.showFinalEndingScene = function patchedAmbientFinalEndingScene(...args) {
    const result = originalShowFinalEndingScene.apply(this, args);
    const backgroundKey = this.getFinalEndingBackgroundKey?.();
    this.createAmbientFx(FINAL_BACKGROUND_TO_AMBIENT_AREA[backgroundKey] ?? 'finale');
    return result;
  };

  const originalShutdown = ForestScene.prototype.shutdown;
  ForestScene.prototype.shutdown = function patchedAmbientShutdown(...args) {
    this.clearAmbientFx?.();
    return originalShutdown?.apply(this, args);
  };
};

patchForestSceneAmbientFx();
