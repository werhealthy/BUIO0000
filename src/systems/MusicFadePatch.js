import { ForestScene } from '../scenes/ForestScene.js';
import { MenuScene } from '../scenes/MenuScene.js';
import { GameState } from './GameState.js';

const MUSIC_FADE_DURATION = 1650;
const MENU_MUSIC_VOLUME = 0.36;
const GAME_MUSIC_VOLUME = 0.42;
const CUTSCENE_COVER_DEPTH = 4999;

const BASE_PLAY_CUTSCENE_VIDEO = ForestScene.prototype.playCutsceneVideo;

const MUSIC_TRACKS = {
  menu: { key: 'title-screen', volume: MENU_MUSIC_VOLUME },
  forest: { key: 'music-forest-initial', volume: GAME_MUSIC_VOLUME },
  madama: { key: 'music-madama', volume: GAME_MUSIC_VOLUME },
  sposine: { key: 'music-sposine', volume: GAME_MUSIC_VOLUME },
  cavallo: { key: 'music-cavallo', volume: GAME_MUSIC_VOLUME },
  finale: { key: 'music-meadow-final', volume: GAME_MUSIC_VOLUME },
  grecia: { key: 'music-grecia', volume: GAME_MUSIC_VOLUME },
  sicilia: { key: 'music-sicilia', volume: GAME_MUSIC_VOLUME },
  bristol: { key: 'music-bristol', volume: GAME_MUSIC_VOLUME }
};

const AREA_TO_TRACK = {
  forest: 'forest',
  madama: 'madama',
  sposine: 'sposine',
  cavallo: 'cavallo',
  pittore: 'cavallo',
  finale: 'finale'
};

const FINAL_BACKGROUND_TO_TRACK = {
  'background-grecia': 'grecia',
  'background-sicilia': 'sicilia',
  'background-bristol': 'bristol'
};

const MUSIC_KEYS = new Set(Object.values(MUSIC_TRACKS).map((track) => track.key));

const getSoundList = (scene) => scene?.sound?.sounds ?? [];

const getMusicSounds = (scene) => getSoundList(scene)
  .filter((sound) => sound && MUSIC_KEYS.has(sound.key));

const unlockAudio = (scene) => {
  try {
    scene?.sound?.unlock?.();
    const context = scene?.sound?.context;
    if (context?.state === 'suspended') {
      context.resume?.();
    }
  } catch (error) {
    console.warn('[MusicFadePatch] Could not unlock audio context.', error);
  }
};

const ensureTargetSound = (scene, track) => {
  if (!scene?.sound || !track?.key) {
    return null;
  }

  const existing = getMusicSounds(scene)
    .find((sound) => sound.key === track.key && (sound.isPlaying || sound.isPaused));
  if (existing) {
    return existing;
  }

  if (!scene.cache?.audio?.exists(track.key)) {
    console.warn(`[MusicFadePatch] Audio not loaded: ${track.key}`);
    return null;
  }

  const sound = scene.sound.add(track.key, { loop: true, volume: 0 });
  try {
    sound.play();
  } catch (error) {
    console.warn(`[MusicFadePatch] Could not play ${track.key}`, error);
    sound.destroy();
    return null;
  }
  return sound;
};

const tweenSoundVolume = (scene, sound, volume, duration, onComplete) => {
  if (!scene?.tweens || !sound) {
    onComplete?.();
    return;
  }

  scene.tweens.killTweensOf(sound);
  scene.tweens.add({
    targets: sound,
    volume,
    duration,
    ease: 'Sine.easeInOut',
    onComplete
  });
};

const enforceMusicCrossfade = (scene, trackId, options = {}) => {
  const track = MUSIC_TRACKS[trackId];
  if (!scene?.sound || !track) {
    return;
  }

  unlockAudio(scene);
  const duration = options.duration ?? MUSIC_FADE_DURATION;
  const targetVolume = options.volume ?? track.volume;
  const targetSound = ensureTargetSound(scene, track);

  getMusicSounds(scene).forEach((sound) => {
    if (sound === targetSound || sound.key === track.key) {
      if (sound.volume <= 0.01) {
        sound.setVolume?.(0);
      }
      tweenSoundVolume(scene, sound, targetVolume, duration);
      return;
    }

    if (sound.isPlaying || sound.isPaused) {
      tweenSoundVolume(scene, sound, 0, duration, () => {
        sound.stop?.();
        sound.destroy?.();
      });
    }
  });
};

const createCutsceneCover = (scene) => {
  scene.cutsceneCover?.destroy?.();
  scene.cutsceneCover = scene.add
    .rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 1)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(CUTSCENE_COVER_DEPTH)
    .setVisible(true);
  return scene.cutsceneCover;
};

const destroyCutsceneCover = (scene) => {
  scene.cutsceneCover?.destroy?.();
  scene.cutsceneCover = null;
};

const trackForArea = (area) => AREA_TO_TRACK[area] ?? AREA_TO_TRACK.forest;

export const installMusicFadePatch = () => {
  if (ForestScene.prototype.__musicFadePatchInstalled) {
    return;
  }
  ForestScene.prototype.__musicFadePatchInstalled = true;

  const originalMenuCreate = MenuScene.prototype.create;
  MenuScene.prototype.create = function patchedMusicMenuCreate(...args) {
    const result = originalMenuCreate.apply(this, args);
    this.time.delayedCall(80, () => enforceMusicCrossfade(this, 'menu', { duration: 1200, volume: MENU_MUSIC_VOLUME }));
    return result;
  };

  const originalForestCreate = ForestScene.prototype.create;
  ForestScene.prototype.create = function patchedMusicForestCreate(...args) {
    const result = originalForestCreate.apply(this, args);
    this.time.delayedCall(90, () => {
      enforceMusicCrossfade(this, trackForArea(GameState.currentArea ?? 'forest'), { duration: MUSIC_FADE_DURATION });
    });
    return result;
  };

  const originalTransitionToArea = ForestScene.prototype.transitionToArea;
  ForestScene.prototype.transitionToArea = function patchedMusicTransitionToArea(area, ...args) {
    const result = originalTransitionToArea.call(this, area, ...args);
    this.time.delayedCall(40, () => enforceMusicCrossfade(this, trackForArea(area), { duration: MUSIC_FADE_DURATION }));
    return result;
  };

  ForestScene.prototype.playCutsceneVideo = function patchedMusicCutsceneVideo(videoKey, onComplete, options = {}) {
    createCutsceneCover(this);
    return BASE_PLAY_CUTSCENE_VIDEO.call(this, videoKey, () => {
      destroyCutsceneCover(this);
      onComplete?.();
    }, options);
  };

  const originalShowFinalEndingScene = ForestScene.prototype.showFinalEndingScene;
  ForestScene.prototype.showFinalEndingScene = function patchedMusicFinalEndingScene(...args) {
    const result = originalShowFinalEndingScene.apply(this, args);
    const backgroundKey = this.getFinalEndingBackgroundKey?.();
    const trackId = FINAL_BACKGROUND_TO_TRACK[backgroundKey];
    if (trackId) {
      this.time.delayedCall(40, () => enforceMusicCrossfade(this, trackId, { duration: MUSIC_FADE_DURATION }));
    }
    return result;
  };

  const originalShowFinalCredits = ForestScene.prototype.showFinalCredits;
  ForestScene.prototype.showFinalCredits = function patchedMusicFinalCredits(...args) {
    enforceMusicCrossfade(this, 'menu', { duration: MUSIC_FADE_DURATION, volume: MENU_MUSIC_VOLUME });
    return originalShowFinalCredits.apply(this, args);
  };
};

setTimeout(installMusicFadePatch, 0);
