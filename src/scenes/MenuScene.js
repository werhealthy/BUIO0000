import Phaser from 'phaser';
import { playSfx, unlockSfxAudio } from '../systems/SfxPatch.js';
import '../systems/AmbientFxPatch.js';
import '../systems/AmbientCameraRefreshPatch.js';
import '../systems/ForestAmbiencePatch.js';
import '../systems/RuntimeAudioSafetyPatch.js';
import '../systems/FinalCreditsRollPatch.js';
import '../systems/DialogueContentPatch.js';

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
}