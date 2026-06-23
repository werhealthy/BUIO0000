import { ForestScene } from '../scenes/ForestScene.js';
import { DialogueManager } from './DialogueManager.js';

const SFX_MASTER_VOLUME = 0.42;
const FOOTSTEP_INTERVAL = 310;
const CUTSCENE_COVER_DEPTH = 4999;

const SOURCE_PLAY_CUTSCENE_VIDEO = ForestScene.prototype.playCutsceneVideo;
const SOURCE_FOREST_UPDATE = ForestScene.prototype.update;
const SOURCE_DIALOGUE_SKIP_OR_NEXT = DialogueManager.prototype.skipOrNextLine;
const SOURCE_DIALOGUE_CHOICE_INPUT = DialogueManager.prototype.handleChoiceInput;
const SOURCE_DIALOGUE_CONFIRM_CHOICE = DialogueManager.prototype.confirmChoice;

const rateLimitState = new WeakMap();
const noiseBuffers = new WeakMap();

const getSceneTime = (scene) => scene?.time?.now ?? performance.now();

const canPlaySfx = (scene, key, minInterval = 80) => {
  if (!scene || !key) {
    return false;
  }

  let sceneState = rateLimitState.get(scene);
  if (!sceneState) {
    sceneState = new Map();
    rateLimitState.set(scene, sceneState);
  }

  const now = getSceneTime(scene);
  const last = sceneState.get(key) ?? -Infinity;
  if (now - last < minInterval) {
    return false;
  }

  sceneState.set(key, now);
  return true;
};

export const unlockSfxAudio = (scene) => {
  const soundManager = scene?.sound;
  if (!soundManager) {
    return null;
  }

  try {
    soundManager.unlock?.();
    const context = soundManager.context;
    if (context?.state === 'suspended') {
      context.resume?.();
    }
    return context ?? null;
  } catch (error) {
    console.warn('[SFX] Could not unlock audio context.', error);
    return null;
  }
};

const getAudioContext = (scene) => {
  const context = unlockSfxAudio(scene);
  if (!context || typeof context.createGain !== 'function') {
    return null;
  }
  return context;
};

const getNoiseBuffer = (context) => {
  const cached = noiseBuffers.get(context);
  if (cached) {
    return cached;
  }

  const length = Math.max(1, Math.floor(context.sampleRate * 0.09));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  noiseBuffers.set(context, buffer);
  return buffer;
};

const playTone = (scene, {
  frequency = 440,
  endFrequency = frequency,
  duration = 0.08,
  volume = 0.16,
  type = 'sine'
} = {}) => {
  const context = getAudioContext(scene);
  if (!context) {
    return false;
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + duration);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * SFX_MASTER_VOLUME), now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
  oscillator.addEventListener('ended', () => {
    oscillator.disconnect();
    gain.disconnect();
  });
  return true;
};

const playNoise = (scene, {
  duration = 0.055,
  volume = 0.1,
  frequency = 900,
  type = 'lowpass'
} = {}) => {
  const context = getAudioContext(scene);
  if (!context) {
    return false;
  }

  const now = context.currentTime;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = getNoiseBuffer(context);
  filter.type = type;
  filter.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * SFX_MASTER_VOLUME), now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(now);
  source.stop(now + duration + 0.02);
  source.addEventListener('ended', () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  });
  return true;
};

export const playSfx = (scene, type, options = {}) => {
  if (!scene) {
    return false;
  }

  const config = {
    start: { rate: 220, action: () => playTone(scene, { frequency: 360, endFrequency: 620, duration: 0.14, volume: 0.18, type: 'triangle' }) },
    'ui-click': { rate: 100, action: () => playTone(scene, { frequency: 520, endFrequency: 300, duration: 0.055, volume: 0.14, type: 'square' }) },
    'ui-hover': { rate: 120, action: () => playTone(scene, { frequency: 620, endFrequency: 760, duration: 0.045, volume: 0.055, type: 'sine' }) },
    'dialogue-next': { rate: 90, action: () => playTone(scene, { frequency: 430, endFrequency: 510, duration: 0.045, volume: 0.06, type: 'triangle' }) },
    'choice-move': { rate: 110, action: () => playTone(scene, { frequency: 300, endFrequency: 380, duration: 0.05, volume: 0.075, type: 'triangle' }) },
    'choice-confirm': { rate: 160, action: () => playTone(scene, { frequency: 420, endFrequency: 720, duration: 0.1, volume: 0.12, type: 'triangle' }) },
    footstep: {
      rate: options.interval ?? FOOTSTEP_INTERVAL,
      action: () => {
        playNoise(scene, { duration: 0.045, volume: 0.075, frequency: 520 });
        playTone(scene, {
          frequency: 86 + Math.random() * 16,
          endFrequency: 58,
          duration: 0.055,
          volume: 0.045,
          type: 'sine'
        });
        return true;
      }
    }
  }[type];

  if (!config) {
    return false;
  }

  const key = options.rateLimitKey ?? type;
  if (!canPlaySfx(scene, key, config.rate)) {
    return false;
  }

  return config.action();
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

const isRomyWalking = (scene) => {
  const velocityX = scene?.romy?.body?.velocity?.x ?? 0;
  return Boolean(
    scene?.romy?.visible
    && Math.abs(velocityX) > 6
    && !scene.isTransitioning
    && !scene.isWakingUp
    && !scene.dialogueManager?.isActive?.()
  );
};

const installForestSfxPatch = () => {
  if (ForestScene.prototype.__proceduralSfxPatchInstalled) {
    return;
  }

  ForestScene.prototype.__proceduralSfxPatchInstalled = true;

  ForestScene.prototype.playCutsceneVideo = function patchedNoDuckingCutsceneVideo(videoKey, onComplete, options = {}) {
    createCutsceneCover(this);
    return SOURCE_PLAY_CUTSCENE_VIDEO.call(this, videoKey, () => {
      destroyCutsceneCover(this);
      onComplete?.();
    }, options);
  };

  ForestScene.prototype.update = function patchedSfxUpdate(...args) {
    const result = SOURCE_FOREST_UPDATE?.apply(this, args);
    if (isRomyWalking(this)) {
      playSfx(this, 'footstep');
    }
    return result;
  };
};

const installDialogueSfxPatch = () => {
  if (DialogueManager.prototype.__proceduralSfxPatchInstalled) {
    return;
  }

  DialogueManager.prototype.__proceduralSfxPatchInstalled = true;

  DialogueManager.prototype.skipOrNextLine = function patchedSfxSkipOrNextLine(...args) {
    if (this.active && !this.choosing && !this.waitingForAction) {
      playSfx(this.scene, 'dialogue-next');
    }
    return SOURCE_DIALOGUE_SKIP_OR_NEXT.apply(this, args);
  };

  DialogueManager.prototype.handleChoiceInput = function patchedSfxHandleChoiceInput(direction, ...args) {
    if (this.active && this.choosing) {
      playSfx(this.scene, 'choice-move');
    }
    return SOURCE_DIALOGUE_CHOICE_INPUT.call(this, direction, ...args);
  };

  DialogueManager.prototype.confirmChoice = function patchedSfxConfirmChoice(...args) {
    if (this.active && this.choosing) {
      playSfx(this.scene, 'choice-confirm');
    }
    return SOURCE_DIALOGUE_CONFIRM_CHOICE.apply(this, args);
  };
};

installDialogueSfxPatch();
setTimeout(installForestSfxPatch, 0);
