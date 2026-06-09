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
import daisySprite1Url from '../assets/sprites/characters/daisy/daisy_sprite_1.png?url';
import daisySprite2Url from '../assets/sprites/characters/daisy/daisy_sprite_2.png?url';
import daisySprite3Url from '../assets/sprites/characters/daisy/daisy_sprite_3.png?url';
import daisySprite4Url from '../assets/sprites/characters/daisy/daisy_sprite_4.png?url';
import onofrioSprite1Url from '../assets/sprites/characters/onofrio/Onofrio_sprite_1.png?url';
import onofrioSprite2Url from '../assets/sprites/characters/onofrio/Onofrio_sprite_2.png?url';
import onofrioSprite3Url from '../assets/sprites/characters/onofrio/Onofrio_sprite_3.png?url';
import onofrioSprite4Url from '../assets/sprites/characters/onofrio/Onofrio_sprite_4.png?url';

const PLAYER_SPEED = 220;
const ROMY_FRAME_RATE = 8;
const CAT_FRAME_RATE = 7;
const DAISY_FRAME_RATE = 5;
const ROAD_OFFSET_FROM_BOTTOM = 80;
const ROMY_SCALE = 1.02;
const CAT_SCALE = 0.56;
const DAISY_SCALE = 0.34;
const ONOFRIO_SCALE = 1.12;
const SIGN_SCALE = 0.9;
const BACKGROUND_SCALE = 1.69;
const PLAYER_START_X = 150;
const CAT_INTRO_TARGET_OFFSET = 150;
const TRIGGER_NEXT_SCENE_X = 3230;
const INTERACTION_DISTANCE = 110;
const HINT_TEXT = 'Premi E per interagire';
const ROMY_FRAME_COUNT = 4;
const ATMOSPHERE_ALPHA = 0.1;

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
    // Romy ha quattro frame disponibili nel progetto: li carichiamo senza crearne di fittizi.
    this.load.image('background-01', backgroundUrl);
    this.load.image('romy-walk-01', romyWalk01Url);
    this.load.image('romy-walk-02', romyWalk02Url);
    this.load.image('romy-walk-03', romyWalk03Url);
    this.load.image('romy-walk-04', romyWalk04Url);
    this.load.image('cat-walk-1', catWalk1Url);
    this.load.image('cat-walk-2', catWalk2Url);
    this.load.image('cat-walk-3', catWalk3Url);
    this.load.image('cat-walk-4', catWalk4Url);
    this.load.image('daisy-idle-1', daisySprite1Url);
    this.load.image('daisy-idle-2', daisySprite2Url);
    this.load.image('daisy-idle-3', daisySprite3Url);
    this.load.image('daisy-idle-4', daisySprite4Url);
    this.load.image('onofrio-idle-1', onofrioSprite1Url);
    this.load.image('onofrio-idle-2', onofrioSprite2Url);
    this.load.image('onofrio-idle-3', onofrioSprite3Url);
    this.load.image('onofrio-idle-4', onofrioSprite4Url);
  }

  create() {
    GameState.resetForNewRun?.();
    this.isTransitioning = false;
    this.catIntroStarted = false;
    this.daisyRevealed = false;
    this.contactShadows = [];

    this.createBackground();
    this.createRomy();
    this.createNpcPlaceholders();
    this.createAtmosphereOverlay();
    this.createNarrativeTriggers();
    this.createCamera();
    this.createUi();
    this.createDialogueManager();
    this.createInput();
    this.updateNpcVisibility();
    this.startInitialIntro();
  }

  update() {
    this.moveRomy();
    this.updateNpcVisibility();
    this.updateCatIntro();
    this.updateNextSceneTrigger();
    this.updateContactShadows();
    this.updateInteractionHint();
    this.cameras.main.scrollY = 0;
  }

  createBackground() {
    const { width, height } = this.scale;

    // Lo sfondo 2293x320 viene scalato in modo uniforme: niente stretching e meno zoom del vecchio moltiplicatore 1.28.
    this.background = this.add.image(0, 0, 'background-01').setOrigin(0, 0).setDepth(0);
    this.background.setScale(BACKGROUND_SCALE);

    this.worldWidth = Math.max(width, this.background.displayWidth);
    this.roadY = height - ROAD_OFFSET_FROM_BOTTOM;
    this.groundY = this.roadY;
    this.physics.world.setBounds(0, 0, this.worldWidth, height);
  }

  createRomy() {
    this.romy = this.physics.add.sprite(PLAYER_START_X, this.getRomyY(), 'romy-walk-01');
    this.romy.setName('Romy');
    this.romy.setDepth(20);
    this.romy.setOrigin(0.5, 1);
    this.romy.setScale(ROMY_SCALE);
    this.romy.setCollideWorldBounds(true);

    // Corpo fisico allineato al corpo visibile e non all'intero canvas trasparente 128x128.
    this.romy.body.setSize(40, 80);
    this.romy.body.setOffset(44, 36);
    this.romyShadow = this.createContactShadow(this.romy, { width: 70, height: 18, alpha: 0.34, depth: 19 });

    const romyFrames = [
      { key: 'romy-walk-01' },
      { key: 'romy-walk-02' },
      { key: 'romy-walk-03' },
      { key: 'romy-walk-04' }
    ].slice(0, ROMY_FRAME_COUNT);

    this.anims.create({
      key: 'romy-walk',
      frames: romyFrames,
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
        x: 820,
        color: 0xb28cff,
        scale: ONOFRIO_SCALE,
        width: 58,
        height: 84,
        dialogueKey: 'onofrio',
        isAvailable: () => GameState.hasDaisy && !GameState.onofrioCompleted
      },
      {
        id: 'cat',
        objectName: 'Trigger_CatIntro',
        label: 'Gatto',
        x: 1500,
        color: 0x7fd1ff,
        dialogueKey: 'cat_intro',
        isAvailable: () => false,
        onInteract: () => {
          GameState.catIntroSeen = true;
        }
      },
      {
        id: 'daisy',
        objectName: 'Trigger_DaisyIntro',
        label: 'Daisy',
        x: 430,
        color: 0xf6f2a4,
        dialogueKey: 'daisy_picked',
        isAvailable: () => this.daisyRevealed && !GameState.hasDaisy,
        onInteract: () => {
          GameState.hasDaisy = true;
        }
      },
      {
        id: 'sign_directions',
        objectName: 'Trigger_DirectionsSign',
        label: 'Tre direzioni',
        x: 2860,
        color: 0xd39b58,
        width: 112,
        height: 96,
        scale: SIGN_SCALE,
        dialogueKey: 'crossroad_cappellaio',
        isAvailable: () => GameState.hasSpruzzino && !GameState.crossroadStarted,
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
      if (interactable.id === 'onofrio') {
        interactable.container = this.createOnofrio(interactable.x, this.groundY, interactable);
        return;
      }

      if (interactable.id === 'cat') {
        interactable.container = this.createCat(interactable.x, this.groundY, interactable);
        return;
      }

      if (interactable.id === 'daisy') {
        interactable.container = this.createDaisy(interactable.x, this.groundY, interactable);
        return;
      }

      interactable.container = this.createPlaceholder(interactable.x, this.groundY, interactable);
    });
  }

  createAtmosphereOverlay() {
    this.atmosphereOverlay = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x071226, ATMOSPHERE_ALPHA)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(850);
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
    interactable.shadow = this.createContactShadow(container, { width: width * scale, height: 18 * scale, alpha: 0.28, depth: 9 });
    return container;
  }

  createOnofrio(x, y, interactable) {
    const container = this.add.container(x, y).setDepth(13);
    const onofrio = this.add.sprite(0, 0, 'onofrio-idle-1').setOrigin(0.5, 1).setScale(interactable.scale);
    const name = this.add
      .text(0, -118, interactable.label, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 }
      })
      .setOrigin(0.5);

    this.anims.create({
      key: 'onofrio-idle',
      frames: [
        { key: 'onofrio-idle-1' },
        { key: 'onofrio-idle-2' },
        { key: 'onofrio-idle-3' },
        { key: 'onofrio-idle-4' }
      ],
      frameRate: 4,
      repeat: -1
    });

    onofrio.anims.play('onofrio-idle');
    container.add([onofrio, name]);
    interactable.sprite = onofrio;
    interactable.shadow = this.createContactShadow(container, { width: 92, height: 24, alpha: 0.3, depth: 12 });
    return container;
  }

  createCat(x, y, interactable) {
    const container = this.add.container(x, y).setDepth(11);
    const cat = this.add.sprite(0, 0, 'cat-walk-1').setOrigin(0.5, 1).setScale(CAT_SCALE);
    const name = this.add
      .text(0, -68, interactable.label, {
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
    interactable.shadow = this.createContactShadow(container, { width: 42, height: 12, alpha: 0.3, depth: 10 });
    return container;
  }

  createDaisy(x, y, interactable) {
    const container = this.add.container(x, y).setDepth(11);
    const daisy = this.add.sprite(0, 0, 'daisy-idle-1').setOrigin(0.5, 1).setScale(DAISY_SCALE);
    const name = this.add
      .text(0, -88, interactable.label, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 6, y: 3 }
      })
      .setOrigin(0.5);

    this.anims.create({
      key: 'daisy-idle',
      frames: [
        { key: 'daisy-idle-1' },
        { key: 'daisy-idle-2' },
        { key: 'daisy-idle-3' },
        { key: 'daisy-idle-4' }
      ],
      frameRate: DAISY_FRAME_RATE,
      repeat: -1
    });

    daisy.anims.play('daisy-idle');
    container.add([daisy, name]);
    interactable.sprite = daisy;
    interactable.shadow = this.createContactShadow(container, { width: 24, height: 8, alpha: 0.28, depth: 10 });
    return container;
  }

  createNarrativeTriggers() {
    this.narrativeTriggers = {
      Trigger_Onofrio: 760,
      Trigger_CatIntro: 0,
      Trigger_DaisyIntro: 430,
      Trigger_DirectionsSign: 2860,
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

  startInitialIntro() {
    this.stopRomy();
    this.BlackTransition?.setVisible(true).setAlpha(1);
    this.dialogueManager.startDialogue('intro_black');
  }

  createCamera() {
    const { width, height } = this.scale;
    this.cameras.main.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.scrollX = 0;
    this.cameras.main.scrollY = 0;
    this.cameras.main.setZoom(1);
    this.cameras.main.startFollow(this.romy, true, 0.12, 1, 0, 0);
    this.cameras.main.setDeadzone(Math.round(width * 0.4), height);
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
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      fullscreen: Phaser.Input.Keyboard.KeyCodes.F
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

    this.input.keyboard.on('keydown-F', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
        return;
      }

      this.scale.startFullscreen();
    });
  }

  getRomyY() {
    return this.roadY;
  }

  moveRomy() {
    if (this.dialogueManager?.isActive() || this.isTransitioning) {
      this.stopRomy();
      return;
    }

    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;
    const velocityX = (Number(right) - Number(left)) * PLAYER_SPEED;

    this.romy.y = this.getRomyY();
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

    this.romy.y = this.getRomyY();
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
      return GameState.currentArea === 'forest' && this.catIntroStarted;
    }

    if (interactable.id === 'daisy') {
      return GameState.currentArea === 'forest' && this.daisyRevealed && !GameState.hasDaisy;
    }

    if (interactable.id === 'sign_directions') {
      return GameState.currentArea === 'forest' && GameState.hasSpruzzino;
    }

    if (['madama', 'sposine', 'pittore'].includes(interactable.id)) {
      return GameState.currentArea === interactable.id;
    }

    return true;
  }

  updateCatIntro() {
    const cat = this.interactables?.find((interactable) => interactable.id === 'cat');

    if (!cat?.sprite || !cat.container.visible || cat.entranceComplete) {
      return;
    }

    if (!cat.entranceTween && this.catIntroStarted) {
      cat.sprite.setFlipX(true);
      cat.sprite.anims.play('cat-walk', true);
      cat.entranceTween = this.tweens.add({
        targets: cat.container,
        x: PLAYER_START_X + CAT_INTRO_TARGET_OFFSET,
        duration: 2400,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          cat.sprite.anims.stop();
          cat.sprite.setTexture('cat-walk-1');
          cat.entranceComplete = true;
        }
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

      const targetX = interactable.container?.x ?? interactable.x;
      return Math.abs(this.romy.x - targetX) <= INTERACTION_DISTANCE;
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

  revealForestIntro() {
    this.isTransitioning = true;
    this.interactHint.setVisible(false);
    this.tweens.add({
      targets: this.BlackTransition,
      alpha: 0,
      duration: 650,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.BlackTransition?.setVisible(false);
        this.isTransitioning = false;
        this.dialogueManager.startDialogue('main_intro');
      }
    });
  }

  startCatEntrance() {
    const cat = this.interactables?.find((interactable) => interactable.id === 'cat');

    if (!cat) {
      return;
    }

    this.catIntroStarted = true;
    cat.container.setPosition(this.cameras.main.scrollX + this.scale.width + 80, this.getRomyY());
    cat.x = cat.container.x;
    this.updateNpcVisibility();
  }

  revealDaisy() {
    this.daisyRevealed = true;
    this.updateNpcVisibility();
  }

  finishMainIntro() {
    GameState.catIntroSeen = true;
    this.revealDaisy();
  }

  createContactShadow(target, options = {}) {
    const shadow = this.add
      .ellipse(target.x, target.y - (options.offsetY ?? 4), options.width ?? 56, options.height ?? 14, options.color ?? 0x020815, options.alpha ?? 0.32)
      .setDepth(options.depth ?? Math.max(1, (target.depth ?? 10) - 1));

    shadow.trackedTarget = target;
    shadow.offsetY = options.offsetY ?? 4;
    this.contactShadows.push(shadow);
    return shadow;
  }

  updateContactShadows() {
    this.contactShadows.forEach((shadow) => {
      const target = shadow.trackedTarget;

      if (!target) {
        return;
      }

      shadow.setPosition(target.x, target.y - shadow.offsetY);
      shadow.setVisible(target.visible);
    });
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
        this.romy.setPosition(targetX, this.getRomyY());
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
