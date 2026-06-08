import Phaser from 'phaser';

// Gli asset restano nella cartella originale: Vite li trasforma in URL sicuri.
import backgroundUrl from '../../Assets/Sprites/Assets/Backgrounds/background_01.png?url';
import romyWalk01Url from '../../Assets/Sprites/Characters/Romy/romy_walk_01.png.png?url';
import romyWalk02Url from '../../Assets/Sprites/Characters/Romy/romy_walk_02.png.png.png?url';
import romyWalk03Url from '../../Assets/Sprites/Characters/Romy/romy_walk_03.png.png.png?url';
import romyWalk04Url from '../../Assets/Sprites/Characters/Romy/romy_walk_04.png.png.png?url';

const PLAYER_SPEED = 220;
const ROMY_FRAME_RATE = 8;

export class ForestScene extends Phaser.Scene {
  constructor() {
    super('ForestScene');
  }

  preload() {
    // Carichiamo lo sfondo e i quattro frame della camminata di Romy senza modificarli.
    this.load.image('background-01', backgroundUrl);
    this.load.image('romy-walk-01', romyWalk01Url);
    this.load.image('romy-walk-02', romyWalk02Url);
    this.load.image('romy-walk-03', romyWalk03Url);
    this.load.image('romy-walk-04', romyWalk04Url);
  }

  create() {
    this.createBackground();
    this.createRomy();
    this.createInput();
  }

  update() {
    this.moveRomy();
  }

  createBackground() {
    const { width, height } = this.scale;

    // Lo sfondo viene scalato quanto basta per coprire tutto il canvas del browser.
    const background = this.add.image(width / 2, height / 2, 'background-01');
    const scale = Math.max(width / background.width, height / background.height);
    background.setScale(scale).setDepth(0);
  }

  createRomy() {
    const { width, height } = this.scale;

    // Romy parte esattamente al centro dello schermo.
    this.romy = this.physics.add.sprite(width / 2, height / 2, 'romy-walk-01');
    this.romy.setDepth(1);
    this.romy.setCollideWorldBounds(true);

    // Il corpo fisico è leggermente più piccolo del frame per un movimento più naturale.
    this.romy.body.setSize(54, 84);
    this.romy.body.setOffset(37, 34);

    // Animazione semplice: i 4 frame vanno in loop quando Romy cammina.
    this.anims.create({
      key: 'romy-walk',
      frames: [
        { key: 'romy-walk-01' },
        { key: 'romy-walk-02' },
        { key: 'romy-walk-03' },
        { key: 'romy-walk-04' }
      ],
      frameRate: ROMY_FRAME_RATE,
      repeat: -1
    });
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  moveRomy() {
    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;
    const up = this.cursors.up.isDown || this.keys.up.isDown;
    const down = this.cursors.down.isDown || this.keys.down.isDown;

    const direction = new Phaser.Math.Vector2(
      Number(right) - Number(left),
      Number(down) - Number(up)
    );

    if (direction.lengthSq() > 0) {
      // Normalizziamo per evitare che il movimento diagonale sia più veloce.
      direction.normalize().scale(PLAYER_SPEED);
      this.romy.setVelocity(direction.x, direction.y);
      this.romy.anims.play('romy-walk', true);

      if (direction.x !== 0) {
        this.romy.setFlipX(direction.x < 0);
      }
    } else {
      this.romy.setVelocity(0, 0);
      this.romy.anims.stop();
      this.romy.setTexture('romy-walk-01');
    }
  }
}
