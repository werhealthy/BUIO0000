import Phaser from 'phaser';
import { playSfx, unlockSfxAudio } from '../systems/SfxPatch.js';

const runtimePatchLoaders = [
  () => import('../systems/AmbientFxPatch.js'),
  () => import('../systems/AmbientCameraRefreshPatch.js'),
  () => import('../systems/ForestAmbiencePatch.js'),
  () => import('../systems/RuntimeAudioSafetyPatch.js'),
  () => import('../systems/FinalCreditsRollPatch.js'),
  () => import('../systems/DialogueContentPatch.js')
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
    this.tryStartMenuMusic();

    this.scale.on('resize', () => {
      this.fitBackgroundCover();
      this.createMenuParticles();
      this.layoutSoundPrompt();
      this.layoutStartButton();
    });

    this.input.once('pointerdown', () => this.enableAudioFromGesture());
    this.input.keyboard?.once('keydown', () => this.enableAudioFromGesture());

    loadRuntimePatches().finally(() => {
      if (!this.scene?.isActive?.('MenuScene')) {
        return;
      }

      // Instance-level start flow: this wins over older prototype patches and keeps
      // the visual progression independent from the audio unlock state.
      this.startGame = this.safeStartGame.bind(this);
      this.startButton = this.createButton(width / 2, height * 0.72, 'Inizia', true, () => this.startGame('button'));
      this.input.keyboard.on('keydown-SPACE', () => this.startGame('keyboard'));
      this.input.keyboard.on('keydown-E', () => this.startGame('keyboard'));
      this.layoutStartButton();
    });
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
        scale: { from: 0.85, to: 1.28 },
        alpha: { from: alpha * 0.35, to: alpha },
        duration: Phaser.Math.Between(1800, 4800),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.menuParticles.push(particle);
      return particle;
    };

    for (let index = 0; index < 34; index += 1) {
      const x = Phaser.Math.Between(18, Math.max(18, width - 18));
      const y = Phaser.Math.Between(20, Math.max(20, height - 20));
      const radius = Phaser.Math.FloatBetween(1.2, 3.8);
      const color = Phaser.Math.RND.pick([0xfff4ba, 0xcaffd9, 0xb7f4ff, 0xffffff]);
      const alpha = Phaser.Math.FloatBetween(0.15, 0.44);
      createGlow(x, y, radius, color, alpha, -6, 26);
    }

    for (let index = 0; index < 8; index += 1) {
      const mist = this.add.ellipse(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(Math.round(height * 0.18), Math.round(height * 0.82)),
        Phaser.Math.Between(90, 180),
        Phaser.Math.Between(12, 26),
        0xd9fff0,
        Phaser.Math.FloatBetween(0.025, 0.06)
      )
        .setScrollFactor(0)
        .setDepth(-14)
        .setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: mist,
        x: mist.x + Phaser.Math.Between(-50, 50),
        alpha: { from: mist.alpha * 0.4, to: mist.alpha },
        duration: Phaser.Math.Between(5600, 9200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.menuParticles.push(mist);
    }

    const halo = this.add.circle(width / 2, height * 0.54, Math.max(width, height) * 0.18, 0xd7ffe6, 0.055)
      .setScrollFactor(0)
      .setDepth(-18)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: halo,
      scale: { from: 0.92, to: 1.08 },
      alpha: { from: 0.035, to: 0.075 },
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
    const bg = this.add.rectangle(0, 0, 300, 34, 0x061b1f, 0.58)
      .setStrokeStyle(1, 0xbde8d0, 0.42)
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
      alpha: { from: 0.55, to: 0.95 },
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

  createButton(x, y, label, primary, onClick) {
    const width = primary ? 214 : 168;
    const height = 62;
    const container = this.add.container(x, y).setDepth(24);

    const glow = this.add.rectangle(0, 4, width + 22, height + 20, 0xb6fff0, 0.08)
      .setStrokeStyle(1, 0xd7fff3, 0.18)
      .setOrigin(0.5);
    const shadow = this.add.rectangle(0, 8, width, height, 0x020809, 0.46).setOrigin(0.5);
    const background = this.add.rectangle(0, 0, width, height, primary ? 0x123238 : 0x182a2e, primary ? 0.96 : 0.86)
      .setStrokeStyle(3, primary ? 0xe3c67a : 0x9aa895, 0.96)
      .setOrigin(0.5);
    const inner = this.add.rectangle(0, 0, width - 14, height - 12, primary ? 0x1e4a4d : 0x243638, 0.72)
      .setStrokeStyle(1, 0xf9efbd, 0.28)
      .setOrigin(0.5);

    const leftRune = this.add.text(-width / 2 + 18, 0, '✦', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '16px',
      color: '#f5d98c'
    }).setOrigin(0.5);
    const rightRune = this.add.text(width / 2 - 18, 0, '✦', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '16px',
      color: '#f5d98c'
    }).setOrigin(0.5);

    const text = this.add.text(0, -1, label, {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '25px',
      fontStyle: 'bold',
      color: '#fff2bf',
      shadow: { offsetX: 0, offsetY: 2, color: '#071215', blur: 0, fill: true }
    }).setOrigin(0.5).setPadding(0, 0, 0, 8);

    container.add([glow, shadow, background, inner, leftRune, rightRune, text]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      playSfx(this, 'ui-hover');
      this.tweens.add({ targets: container, scale: 1.045, duration: 120, ease: 'Sine.easeOut' });
      background.setFillStyle(primary ? 0x1b4a4e : 0x243638, 1);
      glow.setAlpha(0.18);
    });

    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 140, ease: 'Sine.easeOut' });
      background.setFillStyle(primary ? 0x123238 : 0x182a2e, primary ? 0.96 : 0.86);
      glow.setAlpha(0.08);
    });

    container.on('pointerdown', () => {
      playSfx(this, primary ? 'start' : 'ui-click');
      this.tweens.add({ targets: container, scale: 0.97, duration: 70, yoyo: true, ease: 'Sine.easeInOut' });
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
      const music = this.sound.add('title-screen', { loop: true, volume: 0.16 });
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

  safeStartGame(source = 'keyboard') {
    if (this.starting) {
      return;
    }

    this.starting = true;
    this.enableAudioFromGesture();
    if (source !== 'button') {
      playSfx(this, 'start');
    }

    this.stopMenuAndGameMusic();
    this.time.delayedCall(60, () => this.stopMenuAndGameMusic());

    let sceneStarted = false;
    const startForest = () => {
      if (sceneStarted) {
        return;
      }
      sceneStarted = true;
      this.scene.start('ForestScene');
    };

    this.cameras.main.fadeOut(420, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, startForest);
    this.time.delayedCall(560, startForest);
  }
}
