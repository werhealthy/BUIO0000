import { ForestScene } from '../scenes/ForestScene.js';

const VIDEO_VOLUME = 0.18;
const GAME_VOLUME = 0.25;
const MENU_VOLUME = 0.2;
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

const setVideoLevel = (scene) => {
  const video = scene?.activeCutscene?.video;
  if (!video) return;
  video.setMute?.(false);
  video.setVolume?.(VIDEO_VOLUME);
  if (video.video) {
    video.video.muted = false;
    video.video.volume = VIDEO_VOLUME;
  }
};

const keepMusicLevel = (scene) => {
  (scene?.sound?.sounds ?? []).forEach((sound) => {
    if (!sound?.isPlaying || !MUSIC_KEYS.has(sound.key)) return;
    const target = sound.key === 'title-screen' ? MENU_VOLUME : GAME_VOLUME;
    if (Math.abs((sound.volume ?? 0) - target) > 0.03) {
      scene.tweens?.killTweensOf(sound);
      sound.setVolume?.(target);
    }
  });
};

const installVideoAudioGuard = () => {
  const previous = ForestScene.prototype.playCutsceneVideo;
  if (previous?.__videoAudioGuardPatch) return;

  function guardedPlayCutsceneVideo(videoKey, onComplete, options = {}) {
    const result = previous.call(this, videoKey, onComplete, options);
    setVideoLevel(this);
    this.time?.delayedCall(80, () => setVideoLevel(this));
    this.time?.delayedCall(240, () => setVideoLevel(this));
    this.time?.addEvent({
      delay: 120,
      repeat: 48,
      callback: () => {
        setVideoLevel(this);
        keepMusicLevel(this);
      }
    });
    return result;
  }

  guardedPlayCutsceneVideo.__videoAudioGuardPatch = true;
  ForestScene.prototype.playCutsceneVideo = guardedPlayCutsceneVideo;
};

setTimeout(installVideoAudioGuard, 0);
setTimeout(installVideoAudioGuard, 360);
setTimeout(installVideoAudioGuard, 1300);
setTimeout(installVideoAudioGuard, 2700);
