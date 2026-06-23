import Phaser from 'phaser';
import { playSfx, unlockSfxAudio } from '../systems/SfxPatch.js';

const runtimePatchLoaders = [
  () => import('../systems/AmbientFxPatch.js'),
  () => import('../systems/AmbientCameraRefreshPatch.js'),
  () => import('../systems/ForestAmbiencePatch.js'),
  () => import('../systems/RuntimeAudioSafetyPatch.js'),
  () => import('../systems/FinalCreditsRollPatch.js'),
  () => import('../systems/DialogueContentPatch.js'),
  () => import('../systems/InitialTextPolishPatch.js')
];

let runtimePatchesPromise = null;

const loadRuntimePatches = () => {
  if (!runtimePatchesPromise) {
    runtimePatchesPromise = Promise.all(
      runtimePatchLoaders.map((loadPatch) => loadPatch().catch((error) => {
        console.warn('[MenuScene] Runtime patch could not be loaded.', error);
        return null;
      }))
    );
  }
  return runtimePatchesPromise;
};

const backgroundAssets = import.meta.glob('../assets/backgrounds/background_menu_final.png', {
  eager: true,
  query: '?url',
  import: 'default'
});
const menuFinalBackgroundUrl = backgroundAssets['../assets/backgrounds/background_menu_final.png'];

const MENU_MUSIC_KEYS = new Set(['title-screen']);
const GAME_MUSIC_KEYS = new Set([
  'music-forest-initial',
  'music-madama',
  'music-sposine',
  'music-cavallo',
  'music-meadow-final',
  'music-grecia',
  'music-sicilia',
  'music-bristol'
]);
const ALL_MUSIC_KEYS = new Set([...MENU_MUSIC_KEYS, ...GAME_MUSIC_KEYS]);
const MENU_VOLUME = 0.16;
const FOREST_VOLUME = 0.2;
const FOREST_MUSIC_DELAY = 2000;
const START_FADE_DURATION = 720;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('menu-background-01', menuFinalBackgroundUrl);
  }

  create() {
    const { width, height } = this.scale;

    this.background = this.add.image(width / 2, height / 2, 'menu-background-01').setOrigin(0.5);
    this.fitBackgroundCover();
    this.createMenuParticles();
    this.createSoundPrompt();
    this.startButton = this.createButton(width / 2, height * 0.72, 'Inizia', () => this.safeStartGame('button'));
    this.tryStartMenuMusic();

    this.input.once('pointerdown', () => this.enableAudioFromGesture());
    this.input.keyboard?.once('keydown', () => this.enableAudioFromGesture());
    this.input.keyboard?.on('keydown-SPACE', () => this.safeStartGame('keyboard'));
    this.input.keyboard?.on('keydown-E', () => this.safeStartGame('keyboard'));

    this.scale.on('resize', () => {
      this.fitBackgroundCover();
      this.createMenuParticles();
      this.layoutSoundPrompt();
      this.layoutStartButton();
    });

    loadRuntimePatches();
  }

  fitBackgroundCover() {
    if (!this.background?.texture) {
      return;
    }

    const { width, height } = this.scale;
    const source = this.background.texture.getSourceImage();
    const sourceWidth = source?.width || this.background.width || width;
    const sourceHeight = source?.height || this.background.height || height;
    const scale = Math.max(width / sourceWidth, height / sourceHeight);

    this.background
      .setPosition(width / 2, height / 2)
      .setScale(scale)
      .setDepth(-30);
  }

  createMenuParticles() {
    this.menuParticles?.forEach((item) => item.destroy?.());
    this.menuParticles = [];

    const { width, height } = this.scale;

    const createGlow = (x, y, radius, color, alpha, depth, drift = 16) => {
      const particle = this.add.circle(x, y, radius, color, alpha)
        .setScrollFactor(0)
        .setDepth(depth)
        .setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-drift, drift),
        y: y + Phaser.Math.Between(-drift, drift),
        scale: { from: 0.75, to: 1.35 },
        alpha: { from: alpha * 0.25, to: alpha },
        duration: Phaser.Math.Between(1900, 5200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.menuParticles.push(particle);
      return particle;
    };

    for (let index = 0; index < 42; index += 1) {
      const x = Phaser.Math.Between(18, Math.max(18, width - 18));
      const y = Phaser.Math.Between(18, Math.max(18, height - 18));
      const radius = Phaser.Math.FloatBetween(1, 3.6);
      const color = Phaser.Math.RND.pick([0xfff0a8, 0xc5ffd5, 0xa9ebff, 0xf8ffe1]);
      const alpha = Phaser.Math.FloatBetween(0.12, 0.42);
      createGlow(x, y, radius, color, alpha, -6, 30);
    }

    for (let index = 0; index < 10; index += 1) {
      const mist = this.add.ellipse(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(Math.round(height * 0.16), Math.round(height * 0.84)),
        Phaser.Math.Between(90, 210),
        Phaser.Math.Between(10, 28),
        0xd0fff0,
        Phaser.Math.FloatBetween(0.02, 0.055)
      )
        .setScrollFactor(0)
        .setDepth(-14)
        .setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: mist,
        x: mist.x + Phaser.Math.Between(-70, 70),
        alpha: { from: mist.alpha * 0.35, to: mist.alpha },
        duration: Phaser.Math.Between(5800, 9800),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.menuParticles.push(mist);
    }

    const halo = this.add.circle(width / 2, height * 0.54, Math.max(width, height) * 0.18, 0xd7ffe6, 0.05)
      .setScrollFactor(0)
      .setDepth(-18)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: halo,
      scale: { from: 0.9, to: 1.12 },
      alpha: { from: 0.03, to: 0.07 },
      duration: 5200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.menuParticles.push(halo);
  }

  createSoundPrompt() {
    this.soundPrompt?.destroy?.();
    const { width, height } = this.scale;
    const container = this.add.container(width / 2, height - 42).setScrollFactor(0).setDepth(40).setAlpha(0.92);
    const bg = this.add.rectangle(0, 0, 286, 34, 0x061b1f, 0.52)
      .setStrokeStyle(1, 0xbde8d0, 0.35)
      .setOrigin(0.5);
    const text = this.add.text(0, 0, 'clicca per attivare il suono', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '13px',
      color: '#d8fff1',
      letterSpacing: 0.5
    }).setOrigin(0.5);
    container.add([bg, text]);
    this.soundPrompt = container;

    this.tweens.add({
      targets: container,
      alpha: { from: 0.52, to: 0.95 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.layoutSoundPrompt();
  }

  layoutSoundPrompt() {
    if (!this.soundPrompt) {
      return;
    }
    const { width, height } = this.scale;
    this.soundPrompt.setPosition(width / 2, height - 42);
  }

  hideSoundPrompt() {
    if (!this.soundPrompt || this.soundPromptHidden) {
      return;
    }
    this.soundPromptHidden = true;
    this.tweens.add({
      targets: this.soundPrompt,
      alpha: 0,
      duration: 220,
      onComplete: () => this.soundPrompt?.setVisible(false)
    });
  }

  layoutStartButton() {
    if (!this.startButton) {
      return;
    }
    const { width, height } = this.scale;
    this.startButton.setPosition(width / 2, height * 0.72);
  }

  createButton(x, y, label, onClick) {
    const width = 146;
    const height = 38;
    const hitWidth = 212;
    const hitHeight = 78;
    const container = this.add.container(x, y).setDepth(24);

    const aura = this.add.ellipse(0, 0, width + 22, height + 14, 0xaad6c8, 0.035)
      .setOrigin(0.5)
      .setBlendMode(Phaser.BlendModes.ADD);
    const panel = this.add.rectangle(0, 0, width, height, 0x0a171b, 0.68)
      .setStrokeStyle(1, 0x9bb8ac, 0.48)
      .setOrigin(0.5);
    const innerLine = this.add.rectangle(0, 0, width - 12, height - 10, 0x173033, 0.14)
      .setStrokeStyle(1, 0x5d7f75, 0.22)
      .setOrigin(0.5);
    const leftMark = this.add.text(-width / 2 + 14, 0, '•', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '14px',
      color: '#8fa89e'
    }).setOrigin(0.5).setAlpha(0.72);
    const rightMark = this.add.text(width / 2 - 14, 0, '•', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '14px',
      color: '#8fa89e'
    }).setOrigin(0.5).setAlpha(0.72);
    const text = this.add.text(0, -1, label, {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#d7dfd0',
      shadow: { offsetX: 1, offsetY: 1, color: '#06100f', blur: 0, fill: true }
    }).setOrigin(0.5).setPadding(0, 0, 0, 5);
    const hitZone = this.add.rectangle(0, 0, hitWidth, hitHeight, 0x000000, 0.001)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    container.add([aura, panel, innerLine, leftMark, rightMark, text, hitZone]);
    container.hitZone = hitZone;
    container.isHovering = false;

    const setHoverState = (isHovering) => {
      if (container.isHovering === isHovering || this.starting) {
        return;
      }
      container.isHovering = isHovering;
      this.tweens.killTweensOf([aura, panel, innerLine, text, leftMark, rightMark]);

      if (isHovering) {
        playSfx(this, 'ui-hover');
        aura.setAlpha(0.14);
        panel.setFillStyle(0x102529, 0.78).setStrokeStyle(1, 0xd8dbc0, 0.68);
        innerLine.setFillStyle(0x1b383b, 0.22).setStrokeStyle(1, 0x8fb7a8, 0.38);
        text.setColor('#f0ead9');
        leftMark.setAlpha(1);
        rightMark.setAlpha(1);
        return;
      }

      aura.setAlpha(0.035);
      panel.setFillStyle(0x0a171b, 0.68).setStrokeStyle(1, 0x9bb8ac, 0.48);
      innerLine.setFillStyle(0x173033, 0.14).setStrokeStyle(1, 0x5d7f75, 0.22);
      text.setColor('#d7dfd0');
      leftMark.setAlpha(0.72);
      rightMark.setAlpha(0.72);
    };

    hitZone.on('pointerover', () => setHoverState(true));
    hitZone.on('pointerout', () => setHoverState(false));
    hitZone.on('pointerdown', () => {
      if (this.starting) {
        return;
      }
      hitZone.disableInteractive();
      playSfx(this, 'start');
      this.tweens.add({ targets: [panel, innerLine, text, leftMark, rightMark, aura], alpha: 0.42, duration: 120, yoyo: true, ease: 'Sine.easeInOut' });
      onClick?.();
    });

    return container;
  }

  tryStartMenuMusic() {
    if (!this.sound || this.sound.locked || !this.cache.audio.exists('title-screen')) {
      return;
    }

    try {
      const existing = this.sound.sounds?.find((sound) => sound?.key === 'title-screen' && sound.isPlaying);
      if (existing) {
        return;
      }
      const music = this.sound.add('title-screen', { loop: true, volume: MENU_VOLUME });
      music.play();
    } catch (error) {
      console.warn('[MenuScene] Menu music autoplay was blocked.', error);
    }
  }

  stopMenuAndGameMusic() {
    const sounds = this.sound?.sounds ?? [];
    sounds.forEach((sound) => {
      if (!sound || !ALL_MUSIC_KEYS.has(sound.key)) {
        return;
      }
      try { sound.stop?.(); } catch {}
      try { sound.destroy?.(); } catch {}
    });
  }

  enableAudioFromGesture() {
    this.unlockAudioOnUserGesture();
    this.hideSoundPrompt();
    this.tryStartMenuMusic();
  }

  unlockAudioOnUserGesture() {
    const soundManager = this.sound;

    if (!soundManager) {
      return;
    }

    try {
      soundManager.unlock?.();
    } catch (error) {
      console.warn('[Audio] Could not unlock Phaser sound manager.', error);
    }

    const audioContext = soundManager.context;
    if (audioContext?.state === 'suspended') {
      const resumePromise = audioContext.resume?.();
      if (resumePromise?.catch) {
        resumePromise.catch((error) => {
          console.warn('[Audio] Could not resume WebAudio context.', error);
        });
      }
    }

    unlockSfxAudio(this);
  }

  scheduleForestMusicFromMenu() {
    const soundManager = this.sound;
    const cache = this.cache;
    window.clearTimeout?.(window.__buioForestMusicTimer);
    window.__buioForestMusicTimer = window.setTimeout(() => {
      if (!soundManager || soundManager.locked || !cache?.audio?.exists('music-forest-initial')) {
        return;
      }

      try {
        const existing = soundManager.sounds?.find((sound) => sound?.key === 'music-forest-initial' && sound.isPlaying);
        if (existing) {
          return;
        }
        const music = soundManager.add('music-forest-initial', { loop: true, volume: 0 });
        music.play();
        music.setVolume?.(FOREST_VOLUME);
      } catch (error) {
        console.warn('[MenuScene] Could not start forest music from menu handoff.', error);
      }
    }, FOREST_MUSIC_DELAY);
  }

  safeStartGame(source = 'keyboard') {
    if (this.starting) {
      return;
    }

    this.starting = true;
    const patchesReady = loadRuntimePatches();
    this.enableAudioFromGesture();
    if (source !== 'button') {
      playSfx(this, 'start');
    }

    this.stopMenuAndGameMusic();
    this.time.delayedCall(80, () => this.stopMenuAndGameMusic());
    this.scheduleForestMusicFromMenu();

    this.startButton?.hitZone?.disableInteractive?.();
    this.startButton?.disableInteractive?.();
    this.tweens.add({ targets: [this.startButton, this.soundPrompt].filter(Boolean), alpha: 0, duration: 260, ease: 'Sine.easeOut' });

    const { width, height } = this.scale;
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(9999);

    let sceneStarted = false;
    const startForest = () => {
      if (sceneStarted) {
        return;
      }
      sceneStarted = true;
      Promise.race([
        patchesReady,
        new Promise((resolve) => window.setTimeout(resolve, 360))
      ]).finally(() => this.scene.start('ForestScene'));
    };

    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: START_FADE_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: startForest
    });
    this.time.delayedCall(START_FADE_DURATION + 360, startForest);
  }
}
