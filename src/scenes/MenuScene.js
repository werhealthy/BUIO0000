import Phaser from 'phaser';
import backgroundUrl from '../assets/backgrounds/background_01.png?url';

const TITLE = 'Il Bosco delle Mille Direzioni';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('menu-background-01', backgroundUrl);
  }

  create() {
    const { width, height } = this.scale;

    const background = this.add.image(0, 0, 'menu-background-01').setOrigin(0, 0);
    background.setScale(height / background.height);

    this.add.rectangle(0, 0, width, height, 0x06121c, 0.5).setOrigin(0, 0);
    this.add.rectangle(0, 0, width, height, 0x000000, 0.22).setOrigin(0, 0);

    this.add
      .text(width / 2, height * 0.22, TITLE, {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '44px',
        color: '#fff4c8',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#1b1026',
        strokeThickness: 7,
        shadow: { offsetX: 0, offsetY: 5, color: '#000000', blur: 10, fill: true }
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.34, 'Una piccola avventura tra scelte, funghi e strade testarde.', {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '18px',
        color: '#d6eadf',
        align: 'center',
        wordWrap: { width: width * 0.72 }
      })
      .setOrigin(0.5);

    this.createButton(width / 2, height * 0.55, 'Inizia', true, () => {
      this.cameras.main.fadeOut(420, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('ForestScene');
      });
    });

    this.createButton(width / 2, height * 0.68, 'Continua', false);

    this.add
      .text(width / 2, height - 30, 'SPACE / E su Inizia oppure clic del mouse', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#b8cbc4'
      })
      .setOrigin(0.5)
      .setAlpha(0.78);

    this.input.keyboard.on('keydown-SPACE', () => this.scene.start('ForestScene'));
    this.input.keyboard.on('keydown-E', () => this.scene.start('ForestScene'));
  }

  createButton(x, y, label, enabled, onClick = () => {}) {
    const width = 250;
    const height = 54;
    const container = this.add.container(x, y);
    const fill = enabled ? 0x142a31 : 0x1a1e24;
    const stroke = enabled ? 0xf2dc9a : 0x566063;
    const alpha = enabled ? 0.92 : 0.56;
    const box = this.add
      .rectangle(0, 0, width, height, fill, alpha)
      .setStrokeStyle(2, stroke, enabled ? 0.86 : 0.38);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '23px',
        color: enabled ? '#fff5cf' : '#8d9896',
        fontStyle: enabled ? 'bold' : 'normal'
      })
      .setOrigin(0.5);

    container.add([box, text]);

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
      box.setFillStyle(0x203d3c, 0.98);
      box.setStrokeStyle(2, 0xffedb0, 1);
      text.setColor('#ffffff');
    });
    box.on('pointerout', () => {
      box.setFillStyle(fill, alpha);
      box.setStrokeStyle(2, stroke, 0.86);
      text.setColor('#fff5cf');
    });
    box.on('pointerdown', onClick);

    return container;
  }
}
