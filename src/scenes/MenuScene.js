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

setTimeout(() => {
  loadRuntimePatches();
}, 0);

const backgroundAssets = import.meta.glob('../assets/backgrounds/background_menu_final.png', {
  eager: true,
  query: '?url',
  import: 'default'
});
const menuFinalBackgroundUrl = backgroundAssets['../assets/backgrounds/background_menu_final.png'];

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('menu-background-01', menuFinalBackgroundUrl);
  }

  create() {
    loadRuntimePatches();

    const { width, height } = this.scale;

    this.background = this.add.image(width / 2, height / 2, 'menu-background-01').setOrigin(0.5);
    this.fitBackgroundCover();
    this.createMenuParticles();

    this.createButton(width / 2, height * 0.72, 'Inizia', true, () => this.startGame('button'));

    this.input.keyboard.on('keydown-SPACE', () => this.startGame('keyboard'));
    this.input.keyboard.on('keydown-E', () => this.startGame('keyboard'));
    this.scale.on('resize', () => {
      this.fitBackgroundCover();
      this.createMenuParticles();
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
      .setDepth(-20);
  }

  createMenuParticles() {
    this.menuParticles?.forEach((item) => item.destroy?.());
    this.menuParticles = [];

    const { width, height } = this.scale;
    const count = 18;

    for (let index = 0; index < count; index += 1) {
      const x = Phaser.Math.Between(24, Math.max(24, width - 24));
      const y = Phaser.Math.Between(24, Math.max(24, height - 24));
      const radius = Phaser.Math.FloatBetween(1.5, 4.5);
      const alpha = Phaser.Math.FloatBetween(0.16, 0.38);
      const particle = this.add.circle(x, y, radius, 0xfff0b8, alpha)
        .setScrollFactor(0)
        .setDepth(-5);

      this.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-20, 20),
        y: y + Phaser.Math.Between(-18, 18),
        alpha: { from: alpha * 0.55, to: alpha },
        duration: Phaser.Math.Between(2200, 5200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.menuParticles.push(particle);
    }
  }

  createButton(x, y, label, primary, onClick) {
    const width = primary ? 196 : 168;
    const height = 56;
    const container = this.add.container(x, y).setDepth(20);
    const background = this.add.rectangle(0, 0, width, height, primary ? 0xf7e5a1 : 0xffffff, primary ? 0.92 : 0.78)
      .setStrokeStyle(2, primary ? 0x3a2816 : 0x2b2b2b, 0.95)
      .setOrigin(0.5);
    const text = this.add.text(0, 0, label, {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#1f160d'
    }).setOrigin(0.5);

    container.add([background, text]);
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      playSfx(this, 'ui-hover');
      this.tweens.add({ targets: container, scale: 1.045, duration: 120, ease: 'Sine.easeOut' });
      background.setFillStyle(primary ? 0xffefb5 : 0xffffff, 1);
    });

    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 140, ease: 'Sine.easeOut' });
      background.setFillStyle(primary ? 0xf7e5a1 : 0xffffff, primary ? 0.92 : 0.78);
    });

    container.on('pointerdown', () => {
      playSfx(this, primary ? 'start' : 'ui-click');
      onClick?.();
    });

    return container;
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

  startGame(source = 'keyboard') {
    if (this.starting) {
      return;
    }
    this.starting = true;
    this.unlockAudioOnUserGesture();
    if (source !== 'button') {
      playSfx(this, 'start');
    }
    this.cameras.main.fadeOut(420, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('ForestScene');
    });
  }
}
