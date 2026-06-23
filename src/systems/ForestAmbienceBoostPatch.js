import { ForestScene } from '../scenes/ForestScene.js';
import { GameState } from './GameState.js';

const BIRD_MIN_DELAY = 2600;
const BIRD_MAX_DELAY = 6200;
const RUSTLE_MIN_DELAY = 3600;
const RUSTLE_MAX_DELAY = 7800;
const BOOST_VOLUME = 0.72;

const randomDelay = (min, max) => Math.round(min + Math.random() * (max - min));

const getRunningContext = (scene) => {
  const context = scene?.sound?.context;
  if (!context || context.state !== 'running') {
    return null;
  }
  return context;
};

const shouldPlay = (scene) => Boolean(
  scene
  && !scene.blackIntroActive
  && !scene.isCutscenePlaying
  && !scene.isTransitioning
  && (GameState.currentArea ?? 'forest') === 'forest'
);

const playSmallBird = (scene) => {
  const context = getRunningContext(scene);
  if (!context) return;

  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.065 * BOOST_VOLUME, now + 0.016);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
  gain.connect(context.destination);

  const chirps = Math.random() > 0.45 ? [0, 0.11, 0.23] : [0, 0.13];
  chirps.forEach((offset, index) => {
    const osc = context.createOscillator();
    osc.type = 'sine';
    const base = 960 + Math.random() * 720 + index * 120;
    osc.frequency.setValueAtTime(base, now + offset);
    osc.frequency.exponentialRampToValueAtTime(base * 1.42, now + offset + 0.06);
    osc.frequency.exponentialRampToValueAtTime(base * 0.78, now + offset + 0.18);
    osc.connect(gain);
    osc.start(now + offset);
    osc.stop(now + offset + 0.2);
    osc.addEventListener('ended', () => osc.disconnect());
  });

  setTimeout(() => gain.disconnect(), 900);
};

const playSoftRustle = (scene) => {
  const context = getRunningContext(scene);
  if (!context) return;

  const now = context.currentTime;
  const length = Math.floor(context.sampleRate * 0.62);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    const envelope = Math.sin((index / length) * Math.PI);
    data[index] = (Math.random() * 2 - 1) * envelope * 0.8;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(720 + Math.random() * 780, now);
  filter.Q.setValueAtTime(0.84, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.07 * BOOST_VOLUME, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(now);
  source.stop(now + 0.64);
  source.addEventListener('ended', () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  });
};

const installForestAmbienceBoostPatch = () => {
  if (ForestScene.prototype.__forestAmbienceBoostPatched) {
    return;
  }
  ForestScene.prototype.__forestAmbienceBoostPatched = true;

  const sourceUpdate = ForestScene.prototype.update;
  ForestScene.prototype.update = function patchedForestAmbienceBoostUpdate(...args) {
    const result = sourceUpdate?.apply(this, args);
    const now = this.time?.now ?? performance.now();

    if (!this.__nextBoostBirdAt) this.__nextBoostBirdAt = now + randomDelay(1200, 2600);
    if (!this.__nextBoostRustleAt) this.__nextBoostRustleAt = now + randomDelay(2200, 4200);

    if (shouldPlay(this) && now >= this.__nextBoostBirdAt) {
      playSmallBird(this);
      this.__nextBoostBirdAt = now + randomDelay(BIRD_MIN_DELAY, BIRD_MAX_DELAY);
    }

    if (shouldPlay(this) && now >= this.__nextBoostRustleAt) {
      playSoftRustle(this);
      this.__nextBoostRustleAt = now + randomDelay(RUSTLE_MIN_DELAY, RUSTLE_MAX_DELAY);
    }

    return result;
  };
};

installForestAmbienceBoostPatch();
