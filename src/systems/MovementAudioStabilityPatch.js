import { MenuScene } from '../scenes/MenuScene.js';
import { ForestScene } from '../scenes/ForestScene.js';

const MUSIC_KEYS = new Set([
  'title-screen',
  'music-forest-initial',
  'music-madama',
  'music-sposine',
  'music-cavallo',
  'music-meadow-final',
  'music-grecia',
  'music-sicilia',
  'music-bristol'
]);

const stopSound = (sound) => {
  try { sound?.stop?.(); } catch {}
  try { sound?.destroy?.(); } catch {}
};

const keepOnlyMusic = (scene, keyToKeep) => {
  const sounds = scene?.sound?.sounds ?? [];
  let kept = null;

  sounds.forEach((sound) => {
    if (!sound || !MUSIC_KEYS.has(sound.key)) return;

    if (keyToKeep && sound.key === keyToKeep && sound.isPlaying && !kept) {
      kept = sound;
      return;
    }

    stopSound(sound);
  });
};

const installMovementAudioStabilityPatch = () => {
  if (!MenuScene.prototype.__movementAudioStabilityMenuPatched) {
    MenuScene.prototype.__movementAudioStabilityMenuPatched = true;

    // The forest music must be controlled by ForestScene only.
    // Keeping a second delayed menu timer can create overlapping tracks
    // while the black intro is still running.
    MenuScene.prototype.scheduleForestMusicFromMenu = function disabledMenuForestMusicTimer() {
      window.clearTimeout?.(window.__buioForestMusicTimer);
      window.__buioForestMusicTimer = null;
    };
  }

  if (!ForestScene.prototype.__movementAudioStabilityForestPatched) {
    ForestScene.prototype.__movementAudioStabilityForestPatched = true;

    const sourceCreate = ForestScene.prototype.create;
    ForestScene.prototype.create = function stableAudioForestCreate(...args) {
      const result = sourceCreate.apply(this, args);

      this.time?.delayedCall(120, () => {
        keepOnlyMusic(this, null);
      });

      this.time?.delayedCall(2350, () => {
        keepOnlyMusic(this, 'music-forest-initial');
      });

      return result;
    };

    const sourceUpdate = ForestScene.prototype.update;
    ForestScene.prototype.update = function stableParticleRefreshUpdate(...args) {
      // PostRuntimeFixPatch refreshes particles when the camera moves.
      // That made them feel nervous. Keep its movement detector stable
      // before it runs, so it only creates particles when missing or when
      // an area explicitly calls createAmbientFx.
      if (this.cameras?.main) {
        this.__postWorldFxCameraX = this.cameras.main.scrollX ?? 0;
        this.__postWorldFxAt = this.time?.now ?? performance.now();
      }

      return sourceUpdate.apply(this, args);
    };
  }
};

installMovementAudioStabilityPatch();
setTimeout(installMovementAudioStabilityPatch, 0);
setTimeout(installMovementAudioStabilityPatch, 1800);
setTimeout(installMovementAudioStabilityPatch, 4200);
