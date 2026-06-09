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
import catWalk1Url from '../assets/sprites/characters/cat/cat_walk_1.png?url';
import catWalk2Url from '../assets/sprites/characters/cat/cat_walk_2.png?url';
import catWalk3Url from '../assets/sprites/characters/cat/cat_walk_3.png?url';
import catWalk4Url from '../assets/sprites/characters/cat/cat_walk_4.png?url';

const PLAYER_SPEED = 220;
const ROMY_FRAME_RATE = 8;
const CAT_FRAME_RATE = 7;
const ROMY_SCALE = 1.35;
const GROUND_OFFSET_FROM_BOTTOM = 58;
const PLAYER_START_X = 120;
const BACKGROUND_SCALE_MULTIPLIER = 1.28;
const CAT_PATROL_DISTANCE = 260;
const TRIGGER_NEXT_SCENE_X = 3230;
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
    this.load.image('cat-walk-1', catWalk1Url);
    this.load.image('cat-walk-2', catWalk2Url);
    this.load.image('cat-walk-3', catWalk3Url);
    this.load.image('cat-walk-4', catWalk4Url);
  }

  create() {
    this.groundY = this.scale.height - GROUND_OFFSET_FROM_BOTTOM;
    this.worldWidth = this.scale.width;
    this.isTransitioning = false;

    this.createBackground();
    this.createRomy();
    this.createNpcPlaceholders();
    this.createNarrativeTriggers();
    this.createCamera();
    this.createUi();
    this.createDialogueManager();
    this.createInput();
  }

  update() {
    this.moveRomy();
    this.updateNpcVisibility();
    this.updateCatIntro();
    this.updateNextSceneTrigger();
    this.updateInteractionHint();
    this.cameras.main.scrollY = 0;
  }

  createBackground() {
    const { width, height } = this.scale;

    // Lo sfondo viene ingrandito e ancorato in basso: così la camera taglia parte del cielo e rende il terreno più leggibile.
    this.background = this.add.image(0, height, 'background-01').setOrigin(0, 1).setDepth(0);
    const scale = (height / this.background.height) * BACKGROUND_SCALE_MULTIPLIER;
    this.background.setScale(scale);

    this.worldWidth = Math.max(width, this.background.displayWidth);
    this.physics.world.setBounds(0, 0, this.worldWidth, height);
  }

  createRomy() {
    this.romy = this.physics.add.sprite(PLAYER_START_X, this.groundY, 'romy-walk-01');
    this.romy.setDepth(20);
    this.romy.setScale(ROMY_SCALE);
    this.romy.setCollideWorldBounds(true);

    // Il corpo fisico resta proporzionato alla nuova scala, ma leggermente più piccolo del frame.
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
        id: 'onofrio',
        objectName: 'Trigger_Onofrio',
        label: 'Onofrio',
        x: 920,
        color: 0xb28cff,
        scale: 0.82,
        dialogueKey: 'onofrio',
        isAvailable: () => !GameState.onofrioCompleted
      },
      {
        id: 'cat',
        objectName: 'Trigger_CatIntro',
        label: 'Gatto',
        x: 1510,
        color: 0x7fd1ff,
        dialogueKey: 'cat_intro',
        isAvailable: () => GameState.onofrioCompleted && !GameState.catIntroSeen,
        onInteract: () => {
          GameState.catIntroSeen = true;
        }
      },
      {
        id: 'daisy',
        objectName: 'Trigger_DaisyIntro',
        label: 'Daisy',
        x: 2050,
        color: 0xf6f2a4,
        dialogueKey: 'daisy_picked',
        isAvailable: () => GameState.catIntroSeen && !GameState.hasDaisy,
        onInteract: () => {
          GameState.hasDaisy = true;
        }
      },
      {
        id: 'sign_directions',
        objectName: 'Sign_Directions',
        label: 'Tre direzioni',
        x: 2860,
        color: 0xd39b58,
        width: 112,
        height: 96,
        dialogueKey: 'crossroad_cappellaio',
        isAvailable: () => GameState.hasDaisy && GameState.onofrioCompleted && !GameState.crossroadStarted,
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
      interactable.container = interactable.id === 'cat'
        ? this.createCat(interactable.x, this.groundY, interactable)
        : this.createPlaceholder(interactable.x, this.groundY, interactable);
    });
  }

  createPlaceholder(x, y, interactable) {
    const { label, color, scale = 1, width = 74, height = 84 } = interactable;
    const container = this.add.container(x, y).setDepth(10).setScale(scale);
    const body = this.add
      .rectangle(0, -height / 2, width, height, color, 0.82)
      .setStrokeStyle(3, 0x1a1a1a);
    const name = this.add
      .text(0, -height - 16, label, {
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

  createCat(x, y, interactable) {
    const container = this.add.container(x, y).setDepth(11);
    const cat = this.add.sprite(0, -34, 'cat-walk-1').setScale(0.72);
    const name = this.add
      .text(0, -98, interactable.label, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 }
      })
      .setOrigin(0.5);

    this.anims.create({
      key: 'cat-walk',
      frames: [
        { key: 'cat-walk-1' },
        { key: 'cat-walk-2' },
        { key: 'cat-walk-3' },
        { key: 'cat-walk-4' }
      ],
      frameRate: CAT_FRAME_RATE,
      repeat: -1
    });

    container.add([cat, name]);
    interactable.sprite = cat;
    return container;
  }

  createNarrativeTriggers() {
    this.narrativeTriggers = {
      Trigger_Onofrio: 720,
      Trigger_CatIntro: 1320,
      Trigger_DaisyIntro: 1880,
      Trigger_NextScene: TRIGGER_NEXT_SCENE_X
    };

    this.BlackTransition = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1200)
      .setAlpha(0)
      .setVisible(false);
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
    if (interactable.id === 'onofrio') {
      return GameState.currentArea === 'forest' && !GameState.onofrioCompleted;
    }

    if (interactable.id === 'cat') {
      return GameState.currentArea === 'forest' && GameState.onofrioCompleted && !GameState.catIntroSeen;
    }

    if (interactable.id === 'daisy') {
      return GameState.currentArea === 'forest' && GameState.catIntroSeen && !GameState.hasDaisy;
    }

    if (interactable.id === 'sign_directions') {
      return GameState.currentArea === 'forest' && GameState.hasDaisy && GameState.onofrioCompleted;
    }

    if (['madama', 'sposine', 'pittore'].includes(interactable.id)) {
      return GameState.currentArea === interactable.id;
    }

    return true;
  }

  updateCatIntro() {
    const cat = this.interactables?.find((interactable) => interactable.id === 'cat');

    if (!cat?.sprite || !cat.container.visible) {
      return;
    }

    if (this.romy.x >= this.narrativeTriggers.Trigger_CatIntro && !cat.patrolTween) {
      cat.sprite.anims.play('cat-walk', true);
      cat.patrolTween = this.tweens.add({
        targets: cat.container,
        x: cat.x + CAT_PATROL_DISTANCE,
        duration: 3600,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        onYoyo: () => cat.sprite.setFlipX(true),
        onRepeat: () => cat.sprite.setFlipX(false)
      });
    }
  }

  updateNextSceneTrigger() {
    if (this.isTransitioning || GameState.currentArea !== 'forest' || !GameState.crossroadStarted || !GameState.currentPath) {
      return;
    }

    if (this.romy.x >= this.narrativeTriggers.Trigger_NextScene) {
      this.transitionToArea(GameState.currentPath);
    }
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

    this.BlackTransition?.setVisible(true).setAlpha(0);
    this.tweens.add({
      targets: this.BlackTransition,
      alpha: 1,
      duration: 360,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.romy.setPosition(targetX, this.groundY);
        this.cameras.main.scrollY = 0;
        this.cameras.main.centerOnX(targetX);
        this.updateNpcVisibility();

        this.tweens.add({
          targets: this.BlackTransition,
          alpha: 0,
          duration: 360,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            this.BlackTransition?.setVisible(false);
            this.isTransitioning = false;
          }
        });
      }
    });
  }
}
