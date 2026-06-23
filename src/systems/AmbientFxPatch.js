import Phaser from 'phaser';
import { ForestScene } from '../scenes/ForestScene.js';
import { GameState } from './GameState.js';

const AMBIENT_BACK_DEPTH = 7;
const AMBIENT_MID_DEPTH = 15;
const AMBIENT_FRONT_DEPTH = 22;

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

const clearAmbientFx = (scene) => {
  scene.ambientFxObjects?.forEach((object) => object?.destroy?.());
  scene.ambientFxTweens?.forEach((tween) => tween?.stop?.());
  scene.ambientFxObjects = [];
  scene.ambientFxTweens = [];
};

const trackObject = (scene, object) => {
  scene.ambientFxObjects.push(object);
  return object;
};

const trackTween = (scene, tween) => {
  scene.ambientFxTweens.push(tween);
  return tween;
};

const addCircle = (scene, {
  x,
  y,
  radius = 2,
  color = 0xffffff,
  alpha = 0.45,
  depth = AMBIENT_MID_DEPTH,
  blendMode = Phaser.BlendModes.ADD
}) => trackObject(
  scene,
  scene.add.circle(x, y, radius, color, alpha)
    .setDepth(depth)
    .setScrollFactor(0)
    .setBlendMode(blendMode)
);

const addEllipse = (scene, {
  x,
  y,
  width = 10,
  height = 4,
  color = 0xffffff,
  alpha = 0.45,
  depth = AMBIENT_MID_DEPTH,
  blendMode = Phaser.BlendModes.NORMAL
}) => trackObject(
  scene,
  scene.add.ellipse(x, y, width, height, color, alpha)
    .setDepth(depth)
    .setScrollFactor(0)
    .setBlendMode(blendMode)
);

const addBreathingTint = (scene, color, alpha = 0.07) => {
  const { width, height } = scene.scale;
  const overlay = trackObject(
    scene,
    scene.add.rectangle(0, 0, width, height, color, alpha)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(AMBIENT_BACK_DEPTH)
      .setBlendMode(Phaser.BlendModes.ADD)
  );

  trackTween(scene, scene.tweens.add({
    targets: overlay,
    alpha: alpha * 0.35,
    duration: 2600,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  }));
};

const addFloatingDots = (scene, {
  count = 32,
  color = 0xffffff,
  minRadius = 1.6,
  maxRadius = 4.2,
  minAlpha = 0.18,
  maxAlpha = 0.58,
  yMin = 20,
  yMax = scene.scale.height - 20,
  xDrift = 36,
  yDrift = 28,
  durationMin = 2600,
  durationMax = 7200,
  depth = AMBIENT_MID_DEPTH
} = {}) => {
  const { width } = scene.scale;

  for (let i = 0; i < count; i += 1) {
    const particle = addCircle(scene, {
      x: Phaser.Math.Between(-20, width + 20),
      y: Phaser.Math.Between(yMin, yMax),
      radius: Phaser.Math.FloatBetween(minRadius, maxRadius),
      color,
      alpha: Phaser.Math.FloatBetween(minAlpha, maxAlpha),
      depth
    });

    trackTween(scene, scene.tweens.add({
      targets: particle,
      x: particle.x + Phaser.Math.Between(-xDrift, xDrift),
      y: particle.y + Phaser.Math.Between(-yDrift, yDrift),
      scale: { from: Phaser.Math.FloatBetween(0.72, 1.05), to: Phaser.Math.FloatBetween(1.08, 1.72) },
      alpha: { from: particle.alpha * 0.28, to: particle.alpha },
      duration: Phaser.Math.Between(durationMin, durationMax),
      delay: Phaser.Math.Between(0, 1800),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    }));
  }
};

const addPetals = (scene, count = 24) => {
  const { width, height } = scene.scale;

  for (let i = 0; i < count; i += 1) {
    const petal = addEllipse(scene, {
      x: Phaser.Math.Between(-40, width + 40),
      y: Phaser.Math.Between(-60, Math.round(height * 0.34)),
      width: Phaser.Math.FloatBetween(9, 20),
      height: Phaser.Math.FloatBetween(3, 7),
      color: Phaser.Utils.Array.GetRandom([0xfff0f6, 0xffffff, 0xffc7de]),
      alpha: Phaser.Math.FloatBetween(0.32, 0.64),
      depth: AMBIENT_FRONT_DEPTH,
      blendMode: Phaser.BlendModes.NORMAL
    });

    trackTween(scene, scene.tweens.add({
      targets: petal,
      x: petal.x + Phaser.Math.Between(-90, 120),
      y: height + Phaser.Math.Between(20, 90),
      angle: Phaser.Math.Between(-160, 160),
      alpha: 0,
      duration: Phaser.Math.Between(6200, 10800),
      delay: Phaser.Math.Between(0, 4200),
      repeat: -1,
      ease: 'Sine.easeInOut',
      onRepeat: () => {
        petal.setPosition(Phaser.Math.Between(-40, width + 40), Phaser.Math.Between(-80, 20));
        petal.setAlpha(Phaser.Math.FloatBetween(0.32, 0.64));
      }
    }));
  }
};

const createForestAmbientFx = (scene) => {
  addFloatingDots(scene, { count: 46, color: 0xdaf7d7, minAlpha: 0.2, maxAlpha: 0.48, depth: AMBIENT_BACK_DEPTH });
  addFloatingDots(scene, { count: 18, color: 0xfff2a0, minRadius: 2.4, maxRadius: 5.2, minAlpha: 0.35, maxAlpha: 0.82, yMax: Math.round(scene.scale.height * 0.75), depth: AMBIENT_FRONT_DEPTH, durationMin: 1800, durationMax: 4600 });
};

const createMadamaAmbientFx = (scene) => {
  addBreathingTint(scene, 0xffd36b, 0.09);
  addFloatingDots(scene, { count: 62, color: 0xffd36b, minRadius: 1.2, maxRadius: 3.5, minAlpha: 0.35, maxAlpha: 0.92, yMin: 40, yMax: Math.round(scene.scale.height * 0.85), depth: AMBIENT_FRONT_DEPTH, xDrift: 22, yDrift: 48, durationMin: 1400, durationMax: 4200 });
};

const createSposineAmbientFx = (scene) => {
  addBreathingTint(scene, 0xffc7de, 0.07);
  addPetals(scene, 34);
  addFloatingDots(scene, { count: 20, color: 0xffffff, minAlpha: 0.16, maxAlpha: 0.38, depth: AMBIENT_MID_DEPTH });
};

const createCavalloAmbientFx = (scene) => {
  addBreathingTint(scene, 0x8ec9ff, 0.065);
  addFloatingDots(scene, { count: 50, color: 0xd8efff, minAlpha: 0.18, maxAlpha: 0.42, depth: AMBIENT_MID_DEPTH, durationMin: 5200, durationMax: 10400 });
  addFloatingDots(scene, { count: 18, color: 0x7ee7ff, minRadius: 1.2, maxRadius: 3.2, minAlpha: 0.32, maxAlpha: 0.7, depth: AMBIENT_FRONT_DEPTH });
};

const createFinaleAmbientFx = (scene) => {
  addBreathingTint(scene, 0xf5f0a8, 0.09);
  addFloatingDots(scene, { count: 62, color: 0xfff5b8, minRadius: 2, maxRadius: 5.4, minAlpha: 0.28, maxAlpha: 0.78, depth: AMBIENT_FRONT_DEPTH, yMin: Math.round(scene.scale.height * 0.18), yMax: scene.scale.height + 40, yDrift: 68, durationMin: 3600, durationMax: 8200 });
};

const createTravelAmbientFx = (scene, area) => {
  const tintByArea = {
    grecia: 0xbfeaff,
    sicilia: 0xffdf9f,
    bristol: 0xcdd8ff
  };
  const tint = tintByArea[area] ?? 0xffffff;
  addBreathingTint(scene, tint, 0.06);
  addFloatingDots(scene, { count: 42, color: tint, minAlpha: 0.18, maxAlpha: 0.52, depth: AMBIENT_FRONT_DEPTH, durationMin: 4300, durationMax: 9000 });
};

const createAmbientFx = (scene, area = 'forest') => {
  if (!scene?.add || !scene?.scale) {
    return;
  }

  const normalizedArea = normalizeAmbientArea(area);
  if (scene.currentAmbientArea === normalizedArea && scene.ambientFxObjects?.length) {
    return;
  }

  clearAmbientFx(scene);
  scene.currentAmbientArea = normalizedArea;
  scene.ambientFxObjects = [];
  scene.ambientFxTweens = [];

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

export const installAmbientFxPatch = () => {
  if (ForestScene.prototype.__ambientFxPatched) {
    return;
  }
  ForestScene.prototype.__ambientFxPatched = true;

  ForestScene.prototype.clearAmbientFx = function clearAmbientFxForScene() {
    clearAmbientFx(this);
    this.currentAmbientArea = null;
  };

  ForestScene.prototype.createAmbientFx = function createAmbientFxForScene(area = GameState.currentArea ?? 'forest') {
    createAmbientFx(this, area);
  };

  const originalCreate = ForestScene.prototype.create;
  ForestScene.prototype.create = function patchedAmbientCreate(...args) {
    const result = originalCreate.apply(this, args);
    this.time.delayedCall(60, () => this.createAmbientFx(GameState.currentArea ?? 'forest'));
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

setTimeout(installAmbientFxPatch, 0);
