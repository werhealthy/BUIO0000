import { MenuScene } from '../scenes/MenuScene.js';
import { ForestScene } from '../scenes/ForestScene.js';
import { GameState } from './GameState.js';

const MENU_VOLUME = 0.2;
const GAME_VOLUME = 0.25;
const FOREST_START_DELAY = 2000;
const VIDEO_VOLUME = 0.18;
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

let installed = false;
let startClickedAt = 0;
let forestMusicStarted = false;
let titleAudio = null;

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

const publicPath = (path) => {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}${path.replace(/^\//, '')}`;
};

const musicSounds = (scene) => (scene?.sound?.sounds ?? []).filter((sound) => MUSIC_KEYS.has(sound.key));

const unlockSceneAudio = (scene) => {
  try {
    scene?.sound?.unlock?.();
    const context = scene?.sound?.context;
    if (context?.state === 'suspended') {
      context.resume?.();
    }
  } catch {
    // Browser audio unlock can fail until a user gesture; ignore and retry later.
  }
};

const stopSceneMusic = (scene) => {
  musicSounds(scene).forEach((sound) => {
    scene?.tweens?.killTweensOf(sound);
    sound.stop?.();
    sound.destroy?.();
  });
};

const startTitleAudio = () => {
  if (typeof Audio === 'undefined') {
    return;
  }

  if (!titleAudio) {
    titleAudio = new Audio(publicPath('assets/audio/title_screen.mp3'));
    titleAudio.loop = true;
    titleAudio.preload = 'auto';
  }

  titleAudio.volume = MENU_VOLUME;
  titleAudio.play?.().catch?.(() => {
    // Most browsers block unmuted autoplay before a gesture. The first gesture retries this.
  });
};

const stopTitleAudio = () => {
  if (!titleAudio) {
    return;
  }

  titleAudio.pause?.();
  titleAudio.currentTime = 0;
};

const fadeInMusic = (scene, key, volume = GAME_VOLUME) => {
  if (!scene?.sound || !scene.cache?.audio?.exists(key)) {
    return;
  }

  stopSceneMusic(scene);
  const sound = scene.sound.add(key, { loop: true, volume: 0 });
  sound.play?.();
  scene.tweens?.add({
    targets: sound,
    volume,
    duration: 1200,
    ease: 'Sine.easeInOut'
  });
};

const isForestVisualReady = (scene) => {
  const blackVisible = Boolean(scene?.BlackTransition?.visible) && (scene.BlackTransition.alpha ?? 0) > 0.05;
  return !scene?.blackIntroActive && !scene?.isCutscenePlaying && !blackVisible;
};

const waitAndStartForestMusic = (scene) => {
  if (!scene?.time || forestMusicStarted) {
    return;
  }

  let attempts = 0;
  const event = scene.time.addEvent({
    delay: 160,
    repeat: 120,
    callback: () => {
      attempts += 1;

      if (!isForestVisualReady(scene) && attempts < 120) {
        stopSceneMusic(scene);
        return;
      }

      event.remove(false);
      forestMusicStarted = true;
      const remaining = Math.max(0, startClickedAt + FOREST_START_DELAY - now());
      scene.time.delayedCall(remaining, () => fadeInMusic(scene, 'music-forest-initial', GAME_VOLUME));
    }
  });
};

const setVideoVolume = (scene) => {
  const video = scene?.activeCutscene?.video;
  if (!video) {
    return;
  }

  video.setMute?.(false);
  video.setVolume?.(VIDEO_VOLUME);
  if (video.video) {
    video.video.muted = false;
    video.video.volume = VIDEO_VOLUME;
  }
};

const keepMusicLevel = (scene) => {
  musicSounds(scene).forEach((sound) => {
    if (!sound.isPlaying) {
      return;
    }
    const target = sound.key === 'title-screen' ? MENU_VOLUME : GAME_VOLUME;
    if (Math.abs((sound.volume ?? 0) - target) > 0.03) {
      scene.tweens?.killTweensOf(sound);
      sound.setVolume?.(target);
    }
  });
};

const install = () => {
  if (installed) {
    return;
  }
  installed = true;

  const originalMenuCreate = MenuScene.prototype.create;
  MenuScene.prototype.create = function patchedIntroAudioMenuCreate(...args) {
    const result = originalMenuCreate.apply(this, args);
    startTitleAudio();
    this.input.once('pointerdown', () => startTitleAudio());
    this.input.keyboard?.once('keydown', () => startTitleAudio());
    return result;
  };

  const originalStartGame = MenuScene.prototype.startGame;
  MenuScene.prototype.startGame = function patchedIntroAudioStartGame(...args) {
    startClickedAt = now();
    forestMusicStarted = false;
    stopTitleAudio();
    stopSceneMusic(this);
    return originalStartGame.apply(this, args);
  };

  const originalForestCreate = ForestScene.prototype.create;
  ForestScene.prototype.create = function patchedIntroAudioForestCreate(...args) {
    const result = originalForestCreate.apply(this, args);

    if ((GameState.currentArea ?? 'forest') === 'forest') {
      this.time.delayedCall(90, () => {
        stopSceneMusic(this);
        waitAndStartForestMusic(this);
      });
    }

    return result;
  };

  const originalPlayCutsceneVideo = ForestScene.prototype.playCutsceneVideo;
  ForestScene.prototype.playCutsceneVideo = function patchedIntroAudioVideo(videoKey, onComplete, options = {}) {
    const result = originalPlayCutsceneVideo.call(this, videoKey, onComplete, options);
    setVideoVolume(this);
    this.time?.delayedCall(80, () => setVideoVolume(this));
    this.time?.delayedCall(240, () => setVideoVolume(this));
    this.time?.addEvent({
      delay: 120,
      repeat: 40,
      callback: () => keepMusicLevel(this)
    });
    return result;
  };
};

setTimeout(install, 0);
