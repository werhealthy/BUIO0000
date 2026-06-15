import Phaser from 'phaser';
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

    const background = this.add.image(width / 2, height / 2, 'menu-background-01').setOrigin(0.5);
    const scale = Math.max(width / background.width, height / background.height);
    background.setScale(scale);

    this.createButton(width / 2, height * 0.72, 'Inizia', true, () => this.startGame());


    this.input.keyboard.on('keydown-SPACE', () => this.startGame());
    this.input.keyboard.on('keydown-E', () => this.startGame());
  }

  startGame() {
    if (this.starting) {
      return;
    }
    this.starting = true;
    this.cameras.main.fadeOut(420, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('ForestScene');
    });
  }

  createButton(x, y, label, enabled, onClick = () => {}) {
    const width = 220;
    const height = 58;
    const container = this.add.container(x, y);
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
