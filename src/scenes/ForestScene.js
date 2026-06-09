import Phaser from 'phaser';
import { dialogues } from '../data/dialogues.js';
import { DialogueManager } from '../systems/DialogueManager.js';
import { GameState } from '../systems/GameState.js';

// Gli asset restano in src/assets: Vite li trasforma in URL sicuri.
import backgroundUrl from '../assets/backgrounds/background_01.png?url';
import romyWalk01Url from '../assets/sprites/characters/romy/romy_walk_01.png?url';
import romyWalk02Url from '../assets/sprites/characters/romy/romy_walk_02.png?url';
import romyWalk03Url from '../assets/sprites/characters/romy/romy_walk_03.png?url';
import romyWalk04Url from '../assets/sprites/characters/romy/romy_walk_04.png?url';

const PLAYER_SPEED = 220;
const ROMY_FRAME_RATE = 8;
const GROUND_OFFSET_FROM_BOTTOM = 80;
const PLAYER_START_X = 120;
const INTERACTION_DISTANCE = 110;
const HINT_TEXT = 'Premi E per interagire';

const AREA_SPAWN_X = {
  forest: PLAYER_START_X,
  madama: 1680,
  sposine: 2180,
  pittore: 2680
};

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
    this.groundY = this.scale.height - GROUND_OFFSET_FROM_BOTTOM;
    this.worldWidth = this.scale.width;
    this.isTransitioning = false;

    this.createBackground();
    this.createRomy();
    this.createNpcPlaceholders();
    this.createCamera();
    this.createUi();
    this.createDialogueManager();
    this.createInput();
  }

  update() {
    this.moveRomy();
    this.updateNpcVisibility();
    this.updateInteractionHint();
    this.cameras.main.scrollY = 0;
  }

  createBackground() {
    const { width, height } = this.scale;

    // Lo sfondo è un panorama orizzontale: parte da sinistra e viene scalato solo per coprire l'altezza del canvas.
    this.background = this.add.image(0, 0, 'background-01').setOrigin(0, 0).setDepth(0);
    const scale = height / this.background.height;
    this.background.setScale(scale);

    this.worldWidth = Math.max(width, this.background.displayWidth);
    this.physics.world.setBounds(0, 0, this.worldWidth, height);
  }

  createRomy() {
    this.romy = this.physics.add.sprite(PLAYER_START_X, this.groundY, 'romy-walk-01');
    this.romy.setDepth(20);
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

  createNpcPlaceholders() {
    this.interactables = [
      {
        id: 'daisy',
        label: 'Daisy',
        x: 350,
        color: 0xf6f2a4,
        dialogueKey: 'daisy_picked',
        isAvailable: () => !GameState.hasDaisy,
        onInteract: () => {
          GameState.hasDaisy = true;
        }
      },
      {
        id: 'onofrio',
        label: 'Onofrio',
        x: 720,
        color: 0xb28cff,
        dialogueKey: 'onofrio',
        isAvailable: () => GameState.hasDaisy && !GameState.onofrioCompleted
      },
      {
        id: 'cappellaio',
        label: 'Cappellaio',
        x: 1160,
        color: 0xff9a64,
        dialogueKey: 'crossroad_cappellaio',
        isAvailable: () => GameState.onofrioCompleted && !GameState.crossroadStarted,
        onInteract: () => {
          GameState.crossroadStarted = true;
        }
      },
      {
        id: 'madama',
        label: 'Madama',
        x: AREA_SPAWN_X.madama + 180,
        color: 0xf38bd5,
        dialogueKey: 'madama_intro',
        isAvailable: () => GameState.currentArea === 'madama' && !GameState.madamaStarted,
        onInteract: () => {
          GameState.madamaStarted = true;
        }
      },
      {
        id: 'sposine',
        label: 'Sposine',
        x: AREA_SPAWN_X.sposine + 180,
        color: 0xffffff,
        dialogueKey: 'sposine_intro',
        isAvailable: () => GameState.currentArea === 'sposine' && !GameState.sposineStarted,
        onInteract: () => {
          GameState.sposineStarted = true;
        }
      },
      {
        id: 'pittore',
        label: 'Pittore',
        x: AREA_SPAWN_X.pittore + 180,
        color: 0x8bd3ff,
        dialogueKey: 'pittore_intro',
        isAvailable: () => GameState.currentArea === 'pittore' && !GameState.pittoreStarted,
        onInteract: () => {
          GameState.pittoreStarted = true;
        }
      }
    ];

    this.interactables.forEach((interactable) => {
      interactable.container = this.createPlaceholder(interactable.x, this.groundY, interactable.label, interactable.color);
    });
  }

  createPlaceholder(x, y, label, color) {
    const container = this.add.container(x, y).setDepth(10);
    const body = this.add
      .rectangle(0, -42, 74, 84, color, 0.82)
      .setStrokeStyle(3, 0x1a1a1a);
    const name = this.add
      .text(0, -100, label, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 }
      })
      .setOrigin(0.5);

    container.add([body, name]);
    return container;
  }

  createCamera() {
    const { width, height } = this.scale;
    this.cameras.main.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.scrollX = 0;
    this.cameras.main.scrollY = 0;
    this.cameras.main.startFollow(this.romy, true, 0.12, 0, 0, 0);
    this.cameras.main.setDeadzone(Math.round(width * 0.35), height);
  }

  createUi() {
    const { width, height } = this.scale;

    this.interactHint = this.add
      .text(width / 2, height - 32, HINT_TEXT, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 12, y: 6 }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(900)
      .setVisible(false);
  }

  createDialogueManager() {
    this.dialogueManager = new DialogueManager(this);
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.dialogueManager.nextLine();
    });

    this.input.keyboard.on('keydown-UP', () => {
      this.dialogueManager.handleChoiceInput(-1);
    });

    this.input.keyboard.on('keydown-W', () => {
      this.dialogueManager.handleChoiceInput(-1);
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.dialogueManager.handleChoiceInput(1);
    });

    this.input.keyboard.on('keydown-S', () => {
      this.dialogueManager.handleChoiceInput(1);
    });

    this.input.keyboard.on('keydown-E', () => {
      if (this.dialogueManager.isChoosing()) {
        this.dialogueManager.confirmChoice();
        return;
      }

      if (!this.dialogueManager.isActive()) {
        this.interactWithNearest();
      }
    });
  }

  moveRomy() {
    if (this.dialogueManager?.isActive() || this.isTransitioning) {
      this.stopRomy();
      return;
    }

    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;
    const velocityX = (Number(right) - Number(left)) * PLAYER_SPEED;

    this.romy.y = this.groundY;
    this.romy.setVelocity(velocityX, 0);

    if (velocityX !== 0) {
      this.romy.anims.play('romy-walk', true);
      this.romy.setFlipX(velocityX < 0);
    } else {
      this.romy.anims.stop();
      this.romy.setTexture('romy-walk-01');
    }
  }

  stopRomy() {
    if (!this.romy) {
      return;
    }

    this.romy.y = this.groundY;
    this.romy.setVelocity(0, 0);
    this.romy.anims.stop();
    this.romy.setTexture('romy-walk-01');
  }

  updateNpcVisibility() {
    this.interactables.forEach((interactable) => {
      interactable.container.setVisible(this.isNpcVisible(interactable));
    });
  }

  isNpcVisible(interactable) {
    if (interactable.id === 'daisy') {
      return !GameState.hasDaisy;
    }

    if (['madama', 'sposine', 'pittore'].includes(interactable.id)) {
      return GameState.currentArea === interactable.id;
    }

    return true;
  }

  updateInteractionHint() {
    this.nearestInteractable = this.getNearestAvailableInteractable();
    this.interactHint.setVisible(Boolean(this.nearestInteractable));
  }

  getNearestAvailableInteractable() {
    if (this.dialogueManager?.isActive() || this.isTransitioning) {
      return null;
    }

    return this.interactables.find((interactable) => {
      if (!this.isNpcVisible(interactable) || !interactable.isAvailable()) {
        return false;
      }

      return Math.abs(this.romy.x - interactable.x) <= INTERACTION_DISTANCE;
    }) ?? null;
  }

  interactWithNearest() {
    const interactable = this.nearestInteractable ?? this.getNearestAvailableInteractable();

    if (!interactable || !dialogues[interactable.dialogueKey]) {
      return;
    }

    interactable.onInteract?.();
    this.interactHint.setVisible(false);
    this.dialogueManager.startDialogue(interactable.dialogueKey);
  }

  transitionToArea(area) {
    const targetX = AREA_SPAWN_X[area];

    if (!targetX) {
      return;
    }

    this.isTransitioning = true;
    GameState.currentArea = area;
    GameState.currentPath = area;
    this.interactHint.setVisible(false);
    this.stopRomy();

    this.cameras.main.fadeOut(260, 0, 0, 0);
    this.time.delayedCall(260, () => {
      this.romy.setPosition(targetX, this.groundY);
      this.cameras.main.scrollY = 0;
      this.cameras.main.centerOnX(targetX);
      this.updateNpcVisibility();
      this.cameras.main.fadeIn(260, 0, 0, 0);
      this.time.delayedCall(260, () => {
        this.isTransitioning = false;
      });
    });
  }
}
