import { ForestScene } from '../scenes/ForestScene.js';
import { GameState } from './GameState.js';

const CAMERA_REFRESH_DISTANCE = 170;
const CAMERA_REFRESH_COOLDOWN = 900;

const getTime = (scene) => scene?.time?.now ?? performance.now();

const refreshAmbientForCamera = (scene) => {
  if (!scene?.createAmbientFx || !scene?.clearAmbientFx || scene.isTransitioning || scene.isCutscenePlaying) {
    return;
  }

  const area = GameState.currentArea ?? 'forest';
  scene.clearAmbientFx();
  scene.currentAmbientArea = null;
  scene.createAmbientFx(area);
};

const installAmbientCameraRefreshPatch = () => {
  if (ForestScene.prototype.__ambientCameraRefreshPatched) {
    return;
  }
  ForestScene.prototype.__ambientCameraRefreshPatched = true;

  const sourceUpdate = ForestScene.prototype.update;
  ForestScene.prototype.update = function patchedAmbientCameraRefreshUpdate(...args) {
    const result = sourceUpdate?.apply(this, args);

    if (!this.cameras?.main || !this.createAmbientFx) {
      return result;
    }

    const now = getTime(this);
    const scrollX = this.cameras.main.scrollX ?? 0;
    if (!Number.isFinite(this.__lastAmbientCameraX)) {
      this.__lastAmbientCameraX = scrollX;
      this.__lastAmbientRefreshAt = now;
      return result;
    }

    const moved = Math.abs(scrollX - this.__lastAmbientCameraX);
    const cooledDown = now - (this.__lastAmbientRefreshAt ?? 0) > CAMERA_REFRESH_COOLDOWN;
    if (moved > CAMERA_REFRESH_DISTANCE && cooledDown) {
      this.__lastAmbientCameraX = scrollX;
      this.__lastAmbientRefreshAt = now;
      refreshAmbientForCamera(this);
    }

    return result;
  };
};

setTimeout(installAmbientCameraRefreshPatch, 0);
setTimeout(installAmbientCameraRefreshPatch, 1200);
