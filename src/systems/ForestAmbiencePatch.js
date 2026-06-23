import { ForestScene } from '../scenes/ForestScene.js';
import { GameState } from './GameState.js';
import { unlockSfxAudio } from './SfxPatch.js';

const BIRD_MIN_DELAY = 5200;
const BIRD_MAX_DELAY = 11500;
const RUSTLE_MIN_DELAY = 7800;
const RUSTLE_MAX_DELAY = 15000;
const FOREST_AMBIENCE_VOLUME = 0.34;

const randomDelay = (min, max) => Math.round(min + Math.random() * (max - min));

const getAudioContext = (scene) => {
  const context = unlockSfxAudio(scene);
  if (!context || context.state !== 'running') {
    return null;
  }
  return context;
};

const playBirdChirp = (scene) => {
  const context = getAudioContext(scene);
  if (!context) return;

  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.035 * FOREST_AMBIENCE_VOLUME, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
  gain.connect(context.destination);

  [0, 0.12, 0.24].forEach((offset, index) => {
    const osc = context.createOscillator();
    osc.type = 'sine';
    const base = 1100 + Math.random() * 560 + index * 120;
    osc.frequency.setValueAtTime(base, now + offset);
    osc.frequency.exponentialRampToValueAtTime(base * 1.38, now + offset + 0.055);
    osc.frequency.exponentialRampToValueAtTime(base * 0.82, now + offset + 0.16);
    osc.connect(gain);
    osc.start(now + offset);
    osc.stop(now + offset + 0.19);
    osc.addEventListener('ended', () => osc.disconnect());
  });

  setTimeout(() => gain.disconnect(), 820);
};

const playLeafRustle = (scene) => {
  const context = getAudioContext(scene);
  if (!context) return;

  const now = context.currentTime;
  const length = Math.floor(context.sampleRate * 0.42);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(950 + Math.random() * 680, now);
  filter.Q.setValueAtTime(0.72, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.055 * FOREST_AMBIENCE_VOLUME, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(now);
  source.stop(now + 0.46);
  source.addEventListener('ended', () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  });
};

const shouldPlayForestAmbience = (scene) => Boolean(
  scene
  && !scene.blackIntroActive
  && !scene.isCutscenePlaying
  && !scene.isTransitioning
  && (GameState.currentArea ?? 'forest') === 'forest'
);

const installForestAmbiencePatch = () => {
  if (ForestScene.prototype.__forestAmbiencePatched) {
    return;
  }
  ForestScene.prototype.__forestAmbiencePatched = true;

  const sourceUpdate = ForestScene.prototype.update;
  ForestScene.prototype.update = function patchedForestAmbienceUpdate(...args) {
    const result = sourceUpdate?.apply(this, args);
    const now = this.time?.now ?? performance.now();

    if (!this.__nextBirdAt) this.__nextBirdAt = now + randomDelay(BIRD_MIN_DELAY, BIRD_MAX_DELAY);
    if (!this.__nextRustleAt) this.__nextRustleAt = now + randomDelay(RUSTLE_MIN_DELAY, RUSTLE_MAX_DELAY);

    if (shouldPlayForestAmbience(this) && now >= this.__nextBirdAt) {
      playBirdChirp(this);
      this.__nextBirdAt = now + randomDelay(BIRD_MIN_DELAY, BIRD_MAX_DELAY);
    }

    if (shouldPlayForestAmbience(this) && now >= this.__nextRustleAt) {
      playLeafRustle(this);
      this.__nextRustleAt = now + randomDelay(RUSTLE_MIN_DELAY, RUSTLE_MAX_DELAY);
    }

    return result;
  };
};

setTimeout(installForestAmbiencePatch, 0);
setTimeout(installForestAmbiencePatch, 1200);
