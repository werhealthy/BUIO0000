import Phaser from 'phaser';
import { ForestScene } from '../scenes/ForestScene.js';
import { GameState } from './GameState.js';

const DEPTH_BACK = 7;
const DEPTH_MID = 15;
const DEPTH_FRONT = 22;
const REFRESH_DISTANCE = 120;
const REFRESH_COOLDOWN = 760;

const FINAL_BACKGROUND_TO_AREA = {
  'background-grecia': 'grecia',
  'background-sicilia': 'sicilia',
  'background-bristol': 'bristol'
};

const normalizeArea = (area = 'forest') => area === 'pittore' ? 'cavallo' : (area || 'forest');

const clearObjects = (scene) => {
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

const getCameraBounds = (scene) => {
  const camera = scene.cameras?.main;
  const width = scene.scale?.width ?? 960;
  const height = scene.scale?.height ?? 540;
  const scrollX = camera?.scrollX ?? 0;
  const scrollY = camera?.scrollY ?? 0;

  return {
    width,
    height,
    scrollX,
    scrollY,
    left: scrollX - 90,
    right: scrollX + width + 90,
    top: scrollY - 70,
    bottom: scrollY + height + 70
  };
};

const randomX = (bounds) => Phaser.Math.Between(Math.round(bounds.left), Math.round(bounds.right));
const randomY = (bounds, min = 20, max = bounds.height - 20) => Phaser.Math.Between(
  Math.round(bounds.scrollY + min),
  Math.round(bounds.scrollY + max)
);

const addWorldCircle = (scene, bounds, {
  radius = 2,
  color = 0xffffff,
  alpha = 0.45,
  depth = DEPTH_MID,
  x,
  y
} = {}) => trackObject(
  scene,
  scene.add.circle(x ?? randomX(bounds), y ?? randomY(bounds), radius, color, alpha)
    .setDepth(depth)
    .setScrollFactor(1)
    .setBlendMode(Phaser.BlendModes.ADD)
);

const addWorldEllipse = (scene, bounds, {
  width = 14,
  height = 4,
  color = 0xffffff,
  alpha = 0.45,
  depth = DEPTH_FRONT,
  x,
  y
} = {}) => trackObject(
  scene,
  scene.add.ellipse(x ?? randomX(bounds), y ?? randomY(bounds), width, height, color, alpha)
    .setDepth(depth)
    .setScrollFactor(1)
    .setBlendMode(Phaser.BlendModes.NORMAL)
);

const addScreenTint = (scene, color, alpha) => {
  const bounds = getCameraBounds(scene);
  const overlay = trackObject(
    scene,
    scene.add.rectangle(0, 0, bounds.width, bounds.height, color, alpha)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH_BACK)
      .setBlendMode(Phaser.BlendModes.ADD)
  );
  trackTween(scene, scene.tweens.add({
    targets: overlay,
    alpha: alpha * 0.32,
    duration: 3200,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  }));
};

const addDots = (scene, {
  count = 32,
  color = 0xffffff,
  minRadius = 1.4,
  maxRadius = 4,
  minAlpha = 0.18,
  maxAlpha = 0.58,
  yMin = 20,
  yMax = scene.scale.height - 20,
  xDrift = 44,
  yDrift = 30,
  durationMin = 2600,
  durationMax = 7200,
  depth = DEPTH_MID
} = {}) => {
  const bounds = getCameraBounds(scene);
  for (let index = 0; index < count; index += 1) {
    const dot = addWorldCircle(scene, bounds, {
      y: randomY(bounds, yMin, yMax),
      radius: Phaser.Math.FloatBetween(minRadius, maxRadius),
      color,
      alpha: Phaser.Math.FloatBetween(minAlpha, maxAlpha),
      depth
    });

    trackTween(scene, scene.tweens.add({
      targets: dot,
      x: dot.x + Phaser.Math.Between(-xDrift, xDrift),
      y: dot.y + Phaser.Math.Between(-yDrift, yDrift),
      scale: { from: Phaser.Math.FloatBetween(0.72, 1), to: Phaser.Math.FloatBetween(1.08, 1.72) },
      alpha: { from: dot.alpha * 0.25, to: dot.alpha },
      duration: Phaser.Math.Between(durationMin, durationMax),
      delay: Phaser.Math.Between(0, 1800),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    }));
  }
};

const addPetals = (scene, count = 26) => {
  const bounds = getCameraBounds(scene);
  for (let index = 0; index < count; index += 1) {
    const petal = addWorldEllipse(scene, bounds, {
      x: randomX(bounds),
      y: bounds.scrollY + Phaser.Math.Between(-80, Math.round(bounds.height * 0.28)),
      width: Phaser.Math.FloatBetween(9, 20),
      height: Phaser.Math.FloatBetween(3, 7),
      color: Phaser.Utils.Array.GetRandom([0xffeef8, 0xffffff, 0xffc7de]),
      alpha: Phaser.Math.FloatBetween(0.3, 0.62),
      depth: DEPTH_FRONT
    });

    trackTween(scene, scene.tweens.add({
      targets: petal,
      x: petal.x + Phaser.Math.Between(-110, 130),
      y: bounds.scrollY + bounds.height + Phaser.Math.Between(30, 110),
      angle: Phaser.Math.Between(-160, 160),
      alpha: 0,
      duration: Phaser.Math.Between(6200, 11000),
      delay: Phaser.Math.Between(0, 4200),
      repeat: -1,
      ease: 'Sine.easeInOut',
      onRepeat: () => {
        const nextBounds = getCameraBounds(scene);
        petal.setPosition(randomX(nextBounds), nextBounds.scrollY + Phaser.Math.Between(-90, 20));
        petal.setAlpha(Phaser.Math.FloatBetween(0.3, 0.62));
      }
    }));
  }
};

const createWorldAmbientFx = (scene, area = 'forest') => {
  if (!scene?.add || !scene?.cameras?.main) {
    return;
  }

  const normalizedArea = normalizeArea(area);
  clearObjects(scene);
  scene.currentAmbientArea = normalizedArea;
  scene.__worldAmbientArea = normalizedArea;
  scene.__worldAmbientCameraX = scene.cameras.main.scrollX ?? 0;
  scene.__worldAmbientRefreshAt = scene.time?.now ?? performance.now();

  if (normalizedArea === 'madama') {
    addScreenTint(scene, 0xffd36b, 0.07);
    addDots(scene, { count: 58, color: 0xffd36b, minRadius: 1.1, maxRadius: 3.2, minAlpha: 0.32, maxAlpha: 0.86, yMin: 40, yMax: scene.scale.height * 0.86, depth: DEPTH_FRONT, xDrift: 34, yDrift: 54, durationMin: 1600, durationMax: 4700 });
    return;
  }

  if (normalizedArea === 'sposine') {
    addScreenTint(scene, 0xffc7de, 0.055);
    addPetals(scene, 34);
    addDots(scene, { count: 18, color: 0xffffff, minAlpha: 0.14, maxAlpha: 0.34, depth: DEPTH_MID });
    return;
  }

  if (normalizedArea === 'cavallo') {
    addScreenTint(scene, 0x8ec9ff, 0.05);
    addDots(scene, { count: 46, color: 0xd8efff, minAlpha: 0.16, maxAlpha: 0.38, depth: DEPTH_MID, durationMin: 5600, durationMax: 10800 });
    addDots(scene, { count: 18, color: 0x7ee7ff, minRadius: 1.1, maxRadius: 3.1, minAlpha: 0.3, maxAlpha: 0.64, depth: DEPTH_FRONT });
    return;
  }

  if (normalizedArea === 'finale') {
    addScreenTint(scene, 0xf5f0a8, 0.07);
    addDots(scene, { count: 58, color: 0xfff5b8, minRadius: 2, maxRadius: 5.2, minAlpha: 0.26, maxAlpha: 0.7, depth: DEPTH_FRONT, yMin: scene.scale.height * 0.18, yMax: scene.scale.height + 40, yDrift: 76, durationMin: 3600, durationMax: 8500 });
    return;
  }

  if (['grecia', 'sicilia', 'bristol'].includes(normalizedArea)) {
    const tint = { grecia: 0xbfeaff, sicilia: 0xffdf9f, bristol: 0xcdd8ff }[normalizedArea] ?? 0xffffff;
    addScreenTint(scene, tint, 0.045);
    addDots(scene, { count: 38, color: tint, minAlpha: 0.16, maxAlpha: 0.46, depth: DEPTH_FRONT, durationMin: 4400, durationMax: 9200 });
    return;
  }

  addDots(scene, { count: 48, color: 0xdaf7d7, minAlpha: 0.18, maxAlpha: 0.44, depth: DEPTH_BACK, xDrift: 58, yDrift: 34 });
  addDots(scene, { count: 22, color: 0xfff2a0, minRadius: 2.1, maxRadius: 5, minAlpha: 0.32, maxAlpha: 0.74, yMax: scene.scale.height * 0.76, depth: DEPTH_FRONT, durationMin: 1900, durationMax: 5000, xDrift: 70, yDrift: 46 });
};

const refreshIfCameraMoved = (scene) => {
  if (!scene?.cameras?.main || scene.isTransitioning || scene.isCutscenePlaying) {
    return;
  }

  const now = scene.time?.now ?? performance.now();
  const cameraX = scene.cameras.main.scrollX ?? 0;
  const lastX = scene.__worldAmbientCameraX ?? cameraX;
  const lastAt = scene.__worldAmbientRefreshAt ?? 0;
  const moved = Math.abs(cameraX - lastX);
  const cooled = now - lastAt > REFRESH_COOLDOWN;

  if (!scene.ambientFxObjects?.length || (moved > REFRESH_DISTANCE && cooled)) {
    createWorldAmbientFx(scene, GameState.currentArea ?? scene.__worldAmbientArea ?? 'forest');
  }
};

const installWorldAmbientFxPatch = () => {
  ForestScene.prototype.clearAmbientFx = function clearWorldAmbientFxForScene() {
    clearObjects(this);
    this.currentAmbientArea = null;
    this.__worldAmbientArea = null;
  };

  ForestScene.prototype.createAmbientFx = function createWorldAmbientFxForScene(area = GameState.currentArea ?? 'forest') {
    createWorldAmbientFx(this, area);
  };

  if (!ForestScene.prototype.__worldAmbientUpdatePatched) {
    ForestScene.prototype.__worldAmbientUpdatePatched = true;
    const sourceUpdate = ForestScene.prototype.update;
    ForestScene.prototype.update = function patchedWorldAmbientUpdate(...args) {
      const result = sourceUpdate?.apply(this, args);
      refreshIfCameraMoved(this);
      return result;
    };
  }

  if (!ForestScene.prototype.__worldAmbientFinalPatched) {
    ForestScene.prototype.__worldAmbientFinalPatched = true;
    const sourceFinal = ForestScene.prototype.showFinalEndingScene;
    ForestScene.prototype.showFinalEndingScene = function patchedWorldAmbientFinal(...args) {
      const result = sourceFinal?.apply(this, args);
      const backgroundKey = this.getFinalEndingBackgroundKey?.();
      createWorldAmbientFx(this, FINAL_BACKGROUND_TO_AREA[backgroundKey] ?? 'finale');
      return result;
    };
  }
};

installWorldAmbientFxPatch();
setTimeout(installWorldAmbientFxPatch, 0);
setTimeout(installWorldAmbientFxPatch, 1200);
setTimeout(installWorldAmbientFxPatch, 2600);
