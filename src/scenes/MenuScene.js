import Phaser from 'phaser';
import { playSfx, unlockSfxAudio } from '../systems/SfxPatch.js';
import '../systems/AmbientFxPatch.js';
import '../systems/MusicFadePatch.js';

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

  fitBackgroundCover() {
    if (!this.background) {
      return;
    }
    const { width, height } = this.scale;
    const scale = Math.max(width / this.background.width, height / this.background.height);
    this.background.setPosition(width / 2, height / 2).setScale(scale);
  }

  createMenuParticles() {
    const { width, height } = this.scale;
    this.menuParticles?.destroy(true);
    this.menuParticles = this.add.container(0, 0).setDepth(2);

    for (let i = 0; i < 34; i += 1) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(24, height - 24),
        Phaser.Math.FloatBetween(1.2, 3.4),
        Phaser.Utils.Array.GetRandom([0xfff1a8, 0x9fd7ff, 0xffffff]),
        Phaser.Math.FloatBetween(0.12, 0.34)
      ).setScrollFactor(0);
      this.menuParticles.add(particle);
      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-28, 28),
        y: particle.y + Phaser.Math.Between(-18, 18),
        alpha: { from: particle.alpha * 0.45, to: particle.alpha },
        duration: Phaser.Math.Between(3200, 7200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1600)
      });
    }
  }

  createButton(x, y, label, enabled, onClick = () => {}) {
    const width = 220;
    const height = 58;
    const container = this.add.container(x, y).setDepth(5);
    const fill = enabled ? 0x4b2f24 : 0x1a1e24;
    const stroke = enabled ? 0xffe0a3 : 0x566063;
    const alpha = enabled ? 0.88 : 0.56;
    const box = this.add
      .rectangle(0, 0, width, height, fill, alpha)
      .setStrokeStyle(2, stroke, enabled ? 0.86 : 0.38);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '25px',
        color: enabled ? '#fff5cf' : '#8d9896',
        fontStyle: enabled ? 'bold' : 'normal'
      })
      .setOrigin(0.5);

    container.add([box, text]);

    if (enabled) {
      this.tweens.add({
        targets: container,
        scaleX: 1.035,
        scaleY: 1.035,
        alpha: 0.92,
        duration: 1650,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    if (!enabled) {
      this.add
        .text(x, y + 38, 'salvataggio non disponibile nel prototipo', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          color: '#9fb0ab'
        })
        .setOrigin(0.5)
        .setAlpha(0.72);
      return container;
    }

    box.setInteractive({ useHandCursor: true });
    box.on('pointerover', () => {
      playSfx(this, 'ui-hover');
      box.setFillStyle(0x203d3c, 0.98);
      box.setStrokeStyle(2, 0xffedb0, 1);
      text.setColor('#ffffff');
    });
    box.on('pointerout', () => {
      box.setFillStyle(fill, alpha);
      box.setStrokeStyle(2, stroke, 0.86);
      text.setColor('#fff5cf');
    });
    box.on('pointerdown', () => {
      this.unlockAudioOnUserGesture();
      playSfx(this, label === 'Inizia' ? 'start' : 'ui-click');
      onClick();
    });

    return container;
  }
}
