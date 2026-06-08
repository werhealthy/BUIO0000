import Phaser from 'phaser';
import { DialogueManager } from '../systems/DialogueManager.js';
import { GameState } from '../systems/GameState.js';

const WORLD_WIDTH = 1800;
const GROUND_Y = 390;
const INTERACTION_DISTANCE = 72;

export class ForestScene extends Phaser.Scene {
  constructor() {
    super('ForestScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#23381f');
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, 480);

    this.createWorldPlaceholders();
    this.createPlayer();
    this.createNpcsAndTriggers();
    this.createInput();
    this.createDebugText();

    this.dialogueManager = new DialogueManager(this);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, 480);
  }

  update() {
    this.updateDebugText();
    this.playerLabel.setPosition(this.player.x - 22, this.player.y - 52);
    this.handleMovement();
    this.checkCrossroadTrigger();
  }

  createWorldPlaceholders() {
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + 50, WORLD_WIDTH, 180, 0x2f5628);
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + 4, WORLD_WIDTH, 8, 0x8fd16a);

    for (let x = 80; x < WORLD_WIDTH; x += 170) {
      this.add.rectangle(x, GROUND_Y - 70, 22, 120, 0x4b2d18);
      this.add.circle(x, GROUND_Y - 130, 52, 0x335f2d);
    }

    this.add.text(32, 28, 'Il Bosco delle Mille Direzioni', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#f8ffd0'
    });
  }

  createPlayer() {
    this.player = this.add.rectangle(120, GROUND_Y - 28, 32, 56, 0xf5d06f);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(32, 56);

    this.playerLabel = this.add.text(this.player.x - 22, this.player.y - 52, 'Romy', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff'
    });
  }

  createNpcsAndTriggers() {
    this.daisy = this.add.circle(250, GROUND_Y - 16, 16, 0xffffff).setStrokeStyle(4, 0xffe45c);
    this.add.text(222, GROUND_Y - 58, 'Daisy', this.labelStyle());

    this.onofrio = this.add.ellipse(620, GROUND_Y - 28, 54, 58, 0xa67ac9).setStrokeStyle(3, 0xf5e9ff);
    this.add.text(584, GROUND_Y - 78, 'Onofrio', this.labelStyle());

    this.crossroadTrigger = this.add.zone(1040, GROUND_Y - 40, 110, 140);
    this.physics.add.existing(this.crossroadTrigger, true);

    this.hatter = this.add.rectangle(1250, GROUND_Y - 38, 44, 76, 0x5aa1ff).setStrokeStyle(3, 0xffef8a);
    this.add.rectangle(1250, GROUND_Y - 88, 74, 18, 0xff5a7a);
    this.add.text(1200, GROUND_Y - 132, 'Cappellaio', this.labelStyle());
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      debug: Phaser.Input.Keyboard.KeyCodes.F1
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.dialogueManager.isActive() && !this.dialogueManager.isChoosing()) {
        this.dialogueManager.nextLine();
      }
    });

    this.input.keyboard.on('keydown-E', () => {
      if (this.dialogueManager.isChoosing()) {
        this.dialogueManager.confirmChoice();
        return;
      }

      if (!this.dialogueManager.isActive()) {
        this.tryInteract();
      }
    });

    this.input.keyboard.on('keydown-UP', () => this.dialogueManager.handleChoiceInput(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.dialogueManager.handleChoiceInput(1));
    this.input.keyboard.on('keydown-LEFT', () => this.dialogueManager.handleChoiceInput(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.dialogueManager.handleChoiceInput(1));

    this.input.keyboard.on('keydown-F1', (event) => {
      event.preventDefault();
      this.debugVisible = !this.debugVisible;
      this.debugText.setVisible(this.debugVisible);
    });
  }

  createDebugText() {
    this.debugVisible = true;
    this.debugText = this.add
      .text(12, 12, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: '#00000099',
        padding: { x: 8, y: 6 }
      })
      .setScrollFactor(0)
      .setDepth(900);
  }

  handleMovement() {
    if (this.dialogueManager.isActive()) {
      this.player.body.setVelocityX(0);
      return;
    }

    const movingLeft = this.cursors.left.isDown || this.keys.left.isDown;
    const movingRight = this.cursors.right.isDown || this.keys.right.isDown;

    if (movingLeft) {
      this.player.body.setVelocityX(-180);
    } else if (movingRight) {
      this.player.body.setVelocityX(180);
    } else {
      this.player.body.setVelocityX(0);
    }
  }

  tryInteract() {
    if (this.isNear(this.daisy) && !GameState.hasDaisy) {
      GameState.hasDaisy = true;
      this.dialogueManager.startDialogue('daisy_picked');
      return;
    }

    if (this.isNear(this.onofrio) && GameState.hasDaisy && !GameState.onofrioCompleted) {
      this.dialogueManager.startDialogue('onofrio');
    }
  }

  checkCrossroadTrigger() {
    if (
      GameState.hasSpruzzino &&
      !GameState.crossroadStarted &&
      !this.dialogueManager.isActive() &&
      Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.crossroadTrigger.getBounds())
    ) {
      GameState.crossroadStarted = true;
      this.dialogueManager.startDialogue('crossroad_cappellaio');
    }
  }

  updateDebugText() {
    this.debugText.setText([
      `hasDaisy: ${GameState.hasDaisy}`,
      `hasSpruzzino: ${GameState.hasSpruzzino}`,
      `onofrioCompleted: ${GameState.onofrioCompleted}`,
      `crossroadStarted: ${GameState.crossroadStarted}`,
      `currentPath: ${GameState.currentPath ?? 'nessuno'}`,
      `calore / ritmo / quiete: ${GameState.calore} / ${GameState.ritmo} / ${GameState.quiete}`
    ]);
  }

  isNear(target) {
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y) <= INTERACTION_DISTANCE;
  }

  labelStyle() {
    return {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff'
    };
  }
}
