import { ForestScene } from '../scenes/ForestScene.js';
import { DialogueManager } from './DialogueManager.js';

const SFX_MASTER_VOLUME = 0.9;
const FOOTSTEP_INTERVAL = 285;

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

  const length = Math.max(1, Math.floor(context.sampleRate * 0.11));
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
  oscillator.stop(now + duration + 0.03);
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
  source.stop(now + duration + 0.03);
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
    start: { rate: 220, action: () => playTone(scene, { frequency: 360, endFrequency: 720, duration: 0.18, volume: 0.28, type: 'triangle' }) },
    'ui-click': { rate: 100, action: () => playTone(scene, { frequency: 520, endFrequency: 280, duration: 0.07, volume: 0.22, type: 'square' }) },
    'ui-hover': { rate: 120, action: () => playTone(scene, { frequency: 620, endFrequency: 800, duration: 0.055, volume: 0.12, type: 'sine' }) },
    'dialogue-next': { rate: 90, action: () => playTone(scene, { frequency: 430, endFrequency: 540, duration: 0.055, volume: 0.12, type: 'triangle' }) },
    'choice-move': { rate: 110, action: () => playTone(scene, { frequency: 300, endFrequency: 410, duration: 0.06, volume: 0.14, type: 'triangle' }) },
    'choice-confirm': { rate: 160, action: () => playTone(scene, { frequency: 420, endFrequency: 780, duration: 0.12, volume: 0.2, type: 'triangle' }) },
    footstep: {
      rate: options.interval ?? FOOTSTEP_INTERVAL,
      action: () => {
        playNoise(scene, { duration: 0.052, volume: 0.16, frequency: 520 });
        playTone(scene, {
          frequency: 92 + Math.random() * 18,
          endFrequency: 58,
          duration: 0.065,
          volume: 0.09,
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

const isRomyWalking = (scene) => {
  const velocityX = scene?.romy?.body?.velocity?.x ?? 0;
  const currentAnimKey = scene?.romy?.anims?.currentAnim?.key ?? '';
  return Boolean(
    scene?.romy?.visible
    && !scene.isTransitioning
    && !scene.isCutscenePlaying
    && !scene.isWakingUp
    && !scene.dialogueManager?.isActive?.()
    && (Math.abs(velocityX) > 6 || currentAnimKey.includes('walk'))
  );
};

export const installProceduralSfxPatch = () => {
  if (ForestScene.prototype.__proceduralSfxPatchInstalled) {
    return;
  }
  ForestScene.prototype.__proceduralSfxPatchInstalled = true;

  const sourceForestUpdate = ForestScene.prototype.update;
  ForestScene.prototype.update = function patchedSfxUpdate(...args) {
    const result = sourceForestUpdate?.apply(this, args);
    if (isRomyWalking(this)) {
      playSfx(this, 'footstep');
    }
    return result;
  };

  if (!DialogueManager.prototype.__proceduralSfxPatchInstalled) {
    DialogueManager.prototype.__proceduralSfxPatchInstalled = true;

    const sourceDialogueSkipOrNext = DialogueManager.prototype.skipOrNextLine;
    DialogueManager.prototype.skipOrNextLine = function patchedSfxSkipOrNextLine(...args) {
      if (this.active && !this.choosing && !this.waitingForAction) {
        playSfx(this.scene, 'dialogue-next');
      }
      return sourceDialogueSkipOrNext.apply(this, args);
    };

    const sourceDialogueChoiceInput = DialogueManager.prototype.handleChoiceInput;
    DialogueManager.prototype.handleChoiceInput = function patchedSfxHandleChoiceInput(direction, ...args) {
      if (this.active && this.choosing) {
        playSfx(this.scene, 'choice-move');
      }
      return sourceDialogueChoiceInput.call(this, direction, ...args);
    };

    const sourceDialogueConfirmChoice = DialogueManager.prototype.confirmChoice;
    DialogueManager.prototype.confirmChoice = function patchedSfxConfirmChoice(...args) {
      if (this.active && this.choosing) {
        playSfx(this.scene, 'choice-confirm');
      }
      return sourceDialogueConfirmChoice.apply(this, args);
    };
  }
};

setTimeout(installProceduralSfxPatch, 0);
