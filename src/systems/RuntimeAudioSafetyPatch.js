import { MenuScene } from '../scenes/MenuScene.js';
import { ForestScene } from '../scenes/ForestScene.js';
import { GameState } from './GameState.js';
import { playSfx, unlockSfxAudio } from './SfxPatch.js';

const MENU_VOLUME = 0.16;
const GAME_VOLUME = 0.2;
const VIDEO_VOLUME = 0.18;
const START_FOREST_DELAY = 2000;
const MUSIC_FADE_DURATION = 1500;
const CUTSCENE_COVER_DEPTH = 4999;
const PLAYER_START_X = 260;
const CAT_FOLLOW_DISTANCE = 92;

const TRACKS = {
  menu: { key: 'title-screen', volume: MENU_VOLUME },
  forest: { key: 'music-forest-initial', volume: GAME_VOLUME },
  madama: { key: 'music-madama', volume: GAME_VOLUME },
  sposine: { key: 'music-sposine', volume: GAME_VOLUME },
  cavallo: { key: 'music-cavallo', volume: GAME_VOLUME },
  finale: { key: 'music-meadow-final', volume: GAME_VOLUME },
  grecia: { key: 'music-grecia', volume: GAME_VOLUME },
  sicilia: { key: 'music-sicilia', volume: GAME_VOLUME },
  bristol: { key: 'music-bristol', volume: GAME_VOLUME }
};

const AREA_TO_TRACK = {
  forest: 'forest',
  madama: 'madama',
  sposine: 'sposine',
  cavallo: 'cavallo',
  pittore: 'cavallo',
  finale: 'finale'
};

const AREA_SPAWN_X = {
  forest: PLAYER_START_X,
  madama: 160,
  sposine: 160,
  cavallo: 160,
  finale: 160,
  pittore: 160
};

const AREA_INTRO_FLAGS = {
  madama: 'madamaIntroCutscenePlayed',
  sposine: 'sposineIntroCutscenePlayed',
  cavallo: 'cavalloIntroCutscenePlayed'
};

const FINAL_BACKGROUND_TO_TRACK = {
  'background-grecia': 'grecia',
  'background-sicilia': 'sicilia',
  'background-bristol': 'bristol'
};

const MUSIC_KEYS = new Set(Object.values(TRACKS).map((track) => track.key));
const safeVolumes = new WeakMap();
let activeTrackKey = null;
let activeTrackVolume = GAME_VOLUME;
let startClickedAt = 0;
let forestMusicTimer = null;
let installed = false;

const BASE_FOREST_CREATE = ForestScene.prototype.create;
const BASE_PLAY_CUTSCENE_VIDEO = ForestScene.prototype.playCutsceneVideo;
const BASE_PLAY_AREA_INTRO_CUTSCENE = ForestScene.prototype.playAreaIntroCutscene;
const BASE_SHOW_FINAL_ENDING_SCENE = ForestScene.prototype.showFinalEndingScene;

const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const musicSounds = (scene) => (scene?.sound?.sounds ?? []).filter((sound) => sound && MUSIC_KEYS.has(sound.key));

const unlockAudio = (scene) => {
  try {
    scene?.sound?.unlock?.();
    const context = scene?.sound?.context;
    if (context?.state === 'suspended') {
      context.resume?.();
    }
    unlockSfxAudio(scene);
  } catch (error) {
    console.warn('[RuntimeAudio] Audio unlock failed.', error);
  }
};

const setSoundVolumeSafe = (sound, volume) => {
  if (!sound) {
    return false;
  }
  try {
    sound.setVolume?.(volume);
    safeVolumes.set(sound, volume);
    return true;
  } catch {
    return false;
  }
};

const stopSoundSafe = (sound) => {
  try { sound?.stop?.(); } catch {}
  try { sound?.destroy?.(); } catch {}
};

const stopAllMusicSafe = (scene) => {
  activeTrackKey = null;
  musicSounds(scene).forEach((sound) => stopSoundSafe(sound));
};

const fadeSoundSafe = (scene, sound, from, to, duration = MUSIC_FADE_DURATION, onComplete) => {
  if (!scene?.time || !sound) {
    onComplete?.();
    return;
  }

  const steps = Math.max(1, Math.round(duration / 50));
  let currentStep = 0;
  setSoundVolumeSafe(sound, from);
  const event = scene.time.addEvent({
    delay: 50,
    repeat: steps,
    callback: () => {
      currentStep += 1;
      const progress = Math.min(1, currentStep / steps);
      const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
      setSoundVolumeSafe(sound, from + (to - from) * eased);
      if (progress >= 1) {
        event.remove(false);
        onComplete?.();
      }
    }
  });
};

const ensureMusicSound = (scene, trackId) => {
  const track = TRACKS[trackId];
  if (!scene?.sound || !track?.key || !scene.cache?.audio?.exists(track.key)) {
    return null;
  }

  const existing = musicSounds(scene).find((sound) => sound.key === track.key && (sound.isPlaying || sound.isPaused));
  if (existing) {
    return existing;
  }

  try {
    const sound = scene.sound.add(track.key, { loop: true, volume: 0 });
    setSoundVolumeSafe(sound, 0);
    sound.play();
    return sound;
  } catch (error) {
    console.warn(`[RuntimeAudio] Could not start music: ${trackId}`, error);
    return null;
  }
};

const playMusicSafe = (scene, trackId, options = {}) => {
  const track = TRACKS[trackId];
  if (!scene?.sound || !track) {
    return;
  }

  if (scene.sound.locked) {
    scene.sound.once('unlocked', () => playMusicSafe(scene, trackId, options));
    return;
  }

  const targetVolume = options.volume ?? track.volume;
  const duration = options.duration ?? MUSIC_FADE_DURATION;
  const targetSound = ensureMusicSound(scene, trackId);
  if (!targetSound) {
    return;
  }

  activeTrackKey = track.key;
  activeTrackVolume = targetVolume;

  musicSounds(scene).forEach((sound) => {
    if (sound === targetSound || sound.key === track.key) {
      fadeSoundSafe(scene, sound, safeVolumes.get(sound) ?? 0, targetVolume, duration);
      return;
    }
    fadeSoundSafe(scene, sound, safeVolumes.get(sound) ?? GAME_VOLUME, 0, duration, () => stopSoundSafe(sound));
  });
};

const keepMusicNormal = (scene) => {
  if (!activeTrackKey) {
    return;
  }
  musicSounds(scene).forEach((sound) => {
    if (sound.key === activeTrackKey && sound.isPlaying) {
      setSoundVolumeSafe(sound, activeTrackVolume);
    }
  });
};

const setVideoAudioLow = (scene) => {
  const video = scene?.activeCutscene?.video;
  if (!video) {
    return;
  }
  try {
    video.setMute?.(false);
    video.setVolume?.(VIDEO_VOLUME);
    if (video.video) {
      video.video.muted = false;
      video.video.volume = VIDEO_VOLUME;
    }
  } catch (error) {
    console.warn('[RuntimeAudio] Could not set video audio.', error);
  }
};

const createCutsceneCover = (scene) => {
  scene.cutsceneCover?.destroy?.();
  scene.cutsceneCover = scene.add
    .rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 1)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(CUTSCENE_COVER_DEPTH);
};

const destroyCutsceneCover = (scene) => {
  scene.cutsceneCover?.destroy?.();
  scene.cutsceneCover = null;
};

const startForestMusicWhenReady = (scene) => {
  forestMusicTimer?.remove?.(false);
  const remaining = Math.max(0, startClickedAt + START_FOREST_DELAY - nowMs());
  forestMusicTimer = scene.time?.delayedCall(remaining, () => {
    playMusicSafe(scene, 'forest', { duration: MUSIC_FADE_DURATION, volume: GAME_VOLUME });
  });
};

const trackForArea = (area) => AREA_TO_TRACK[area] ?? 'forest';

const installStartFlow = () => {
  MenuScene.prototype.startGame = function runtimeSafeStartGame(source = 'keyboard') {
    if (this.starting) {
      return;
    }
    this.starting = true;
    startClickedAt = nowMs();
    unlockAudio(this);
    if (source !== 'button') {
      playSfx(this, 'start');
    }
    stopAllMusicSafe(this);
    this.cameras.main.fadeOut(420, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('ForestScene');
    });
  };
};

const installForestCreate = () => {
  ForestScene.prototype.create = function runtimeSafeForestCreate(...args) {
    const result = BASE_FOREST_CREATE.apply(this, args);
    this.time?.delayedCall(80, () => {
      this.createAmbientFx?.(GameState.currentArea ?? 'forest');
      if ((GameState.currentArea ?? 'forest') === 'forest') {
        startForestMusicWhenReady(this);
      } else {
        playMusicSafe(this, trackForArea(GameState.currentArea), { duration: MUSIC_FADE_DURATION, volume: GAME_VOLUME });
      }
    });
    return result;
  };
};

const installVideoFlow = () => {
  ForestScene.prototype.playCutsceneVideo = function runtimeSafePlayCutsceneVideo(videoKey, onComplete, options = {}) {
    createCutsceneCover(this);
    keepMusicNormal(this);
    const result = BASE_PLAY_CUTSCENE_VIDEO.call(this, videoKey, () => {
      keepMusicNormal(this);
      destroyCutsceneCover(this);
      onComplete?.();
    }, options);

    setVideoAudioLow(this);
    this.time?.delayedCall(80, () => setVideoAudioLow(this));
    this.time?.delayedCall(240, () => setVideoAudioLow(this));
    this.time?.addEvent({
      delay: 120,
      repeat: 48,
      callback: () => {
        keepMusicNormal(this);
        setVideoAudioLow(this);
      }
    });
    return result;
  };
};

const installAreaTransition = () => {
  ForestScene.prototype.transitionToArea = function runtimeSafeTransitionToArea(area) {
    const targetX = AREA_SPAWN_X[area];
    if (!targetX) {
      return;
    }

    playMusicSafe(this, trackForArea(area), { duration: MUSIC_FADE_DURATION, volume: GAME_VOLUME });
    this.isTransitioning = true;
    GameState.currentArea = area;
    if (area !== 'finale') {
      GameState.currentPath = area;
    }

    this.interactHint?.setVisible(false);
    this.stopRomy();
    this.BlackTransition?.setVisible(true).setAlpha(0);

    const revealGameplay = () => {
      this.tweens.add({
        targets: this.BlackTransition,
        alpha: 0,
        duration: 360,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.BlackTransition?.setVisible(false);
          this.isTransitioning = false;
        }
      });
    };

    this.tweens.add({
      targets: this.BlackTransition,
      alpha: 1,
      duration: 360,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.updateAreaBackground(area);
        this.romy.setPosition(targetX, this.getRomyY());

        const cat = this.interactables?.find((interactable) => interactable.id === 'cat');
        if (cat?.container && this.catIntroStarted) {
          cat.container.setPosition(Math.max(0, targetX - CAT_FOLLOW_DISTANCE), this.getRomyY());
          cat.entranceComplete = true;
        }

        this.cameras.main.scrollY = 0;
        this.cameras.main.scrollX = 0;

        if (area === 'finale') {
          GameState.finalMeadowStarted = false;
          this.showFinalBackgroundPlaceholder(!this.textures.exists('background-margherite'));
          this.finalMeadowContainer?.setPosition(1460, this.groundY).setVisible(true);
          const finalDaisy = this.interactables?.find((interactable) => interactable.id === 'final_daisy');
          finalDaisy?.container?.setPosition(1900, this.groundY);
          finalDaisy?.sprite?.setVisible(false);
        } else {
          this.showFinalBackgroundPlaceholder(false);
          this.finalMeadowContainer?.setVisible(false);
        }

        this.updateNpcVisibility();

        const flagKey = AREA_INTRO_FLAGS[area];
        if (flagKey && !GameState[flagKey]) {
          BASE_PLAY_AREA_INTRO_CUTSCENE.call(this, area, revealGameplay);
          return;
        }

        revealGameplay();
      }
    });
  };
};

const installFinalMusic = () => {
  ForestScene.prototype.showFinalEndingScene = function runtimeSafeShowFinalEndingScene(...args) {
    const backgroundKey = this.getFinalEndingBackgroundKey?.();
    const trackId = FINAL_BACKGROUND_TO_TRACK[backgroundKey];
    if (trackId) {
      playMusicSafe(this, trackId, { duration: MUSIC_FADE_DURATION, volume: GAME_VOLUME });
    }
    return BASE_SHOW_FINAL_ENDING_SCENE.apply(this, args);
  };
};

const installRuntimeAudioSafetyPatch = () => {
  if (installed) {
    installVideoFlow();
    installStartFlow();
    return;
  }
  installed = true;
  installStartFlow();
  installForestCreate();
  installVideoFlow();
  installAreaTransition();
  installFinalMusic();
};

setTimeout(installRuntimeAudioSafetyPatch, 0);
setTimeout(installRuntimeAudioSafetyPatch, 1200);
setTimeout(installRuntimeAudioSafetyPatch, 3200);
setTimeout(installRuntimeAudioSafetyPatch, 6200);
