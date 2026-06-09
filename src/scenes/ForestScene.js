import Phaser from 'phaser';
import { dialogues } from '../data/dialogues.js';
import { DialogueManager } from '../systems/DialogueManager.js';
import { GameState } from '../systems/GameState.js';

// Gli asset restano in src/assets: Vite li trasforma in URL sicuri.
import backgroundUrl from '../assets/backgrounds/background_01.png?url';

const characterAssetUrls = import.meta.glob('../assets/sprites/characters/**/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
});

const frame = (key, character, file) => ({
  key,
  file,
  url: characterAssetUrls[`../assets/sprites/characters/${character}/${file}`]
});

const existingFrames = (frames) => frames.filter(({ url }) => Boolean(url));

const ROMY_IDLE_FRAMES = existingFrames([
  frame('romy-idle-01', 'romy', 'romy_idle_01.png'),
  frame('romy-idle-02', 'romy', 'romy_idle_02.png'),
  frame('romy-idle-03', 'romy', 'romy_idle_03.png')
]);

const ROMY_WALK_FRAMES = existingFrames([
  frame('romy-walk-01', 'romy', 'romy_walk_01.png'),
  frame('romy-walk-02', 'romy', 'romy_walk_02.png'),
  frame('romy-walk-03', 'romy', 'romy_walk_03.png'),
  frame('romy-walk-04', 'romy', 'romy_walk_04.png')
]);

const ROMY_WAKE_FRAMES = existingFrames([
  frame('romy-wake-01', 'romy', 'romy_wake_01.png'),
  frame('romy-wake-02', 'romy', 'romy_wake_02.png'),
  frame('romy-wake-03', 'romy', 'romy_wake_03.png'),
  frame('romy-wake-04', 'romy', 'romy_wake_04.png')
]);

const CAT_WALK_FRAMES = existingFrames([
  frame('cat-walk-1', 'cat', 'cat_walk_01.png'),
  frame('cat-walk-2', 'cat', 'cat_walk_02.png'),
  frame('cat-walk-3', 'cat', 'cat_walk_03.png'),
  frame('cat-walk-4', 'cat', 'cat_walk_04.png')
]);

const CAT_IDLE_FRAMES = existingFrames([
  frame('cat-idle-1', 'cat', 'cat_idle_01.png'),
  frame('cat-idle-2', 'cat', 'cat_idle_02.png'),
  frame('cat-idle-3', 'cat', 'cat_idle_03.png')
]);

const CAT_HAS_COMPLETE_WALK = CAT_WALK_FRAMES.length === 4;
const CAT_SPRITE_FRAMES = CAT_HAS_COMPLETE_WALK ? CAT_WALK_FRAMES : [...CAT_IDLE_FRAMES, ...CAT_WALK_FRAMES].slice(0, 1);

const DAISY_IDLE_FRAMES = existingFrames([
  frame('daisy-idle-1', 'daisy', 'daisy_sprite_1.png'),
  frame('daisy-idle-2', 'daisy', 'daisy_sprite_2.png'),
  frame('daisy-idle-3', 'daisy', 'daisy_sprite_3.png'),
  frame('daisy-idle-4', 'daisy', 'daisy_sprite_4.png')
]);

const ONOFRIO_IDLE_FRAMES = existingFrames([
  frame('onofrio-idle-1', 'onofrio', 'onofrio_sprite_01.png'),
  frame('onofrio-idle-2', 'onofrio', 'onofrio_sprite_02.png'),
  frame('onofrio-idle-3', 'onofrio', 'onofrio_sprite_03.png')
]);

const loadFrames = (scene, frames) => {
  frames.forEach(({ key, url }) => {
    scene.load.image(key, url);
  });
};

const phaserFrames = (frames) => frames.map(({ key }) => ({ key }));

const PLAYER_SPEED = 220;
const ROMY_FRAME_RATE = 5;
const ROMY_IDLE_FRAME_RATE = 3;
const CAT_FRAME_RATE = 4;
const DAISY_FRAME_RATE = 3;
const ROAD_Y = (canvasHeight) => canvasHeight - 140;
const ROMY_DISPLAY_HEIGHT = 145;
const CAT_DISPLAY_HEIGHT = 75;
const DAISY_DISPLAY_HEIGHT = 48;
const ONOFRIO_DISPLAY_HEIGHT = 220;
const SIGN_SCALE = 0.9;
const PLAYER_START_X = 260;
const CAT_TARGET_X = 430;
const DAISY_X = 760;
const ONOFRIO_X = 1650;
const SIGN_X = 2520;
const NEXT_SCENE_MARGIN = 180;
const INTERACTION_DISTANCE = 110;
const HINT_TEXT = 'Premi E per interagire';
const ROMY_FRAME_COUNT = 4;
const ATMOSPHERE_ALPHA = 0.08;

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
    loadFrames(this, ROMY_IDLE_FRAMES);
    loadFrames(this, ROMY_WALK_FRAMES);
    loadFrames(this, ROMY_WAKE_FRAMES);
    loadFrames(this, CAT_SPRITE_FRAMES);
    loadFrames(this, DAISY_IDLE_FRAMES);
    loadFrames(this, ONOFRIO_IDLE_FRAMES);
  }

  create() {
    GameState.resetForNewRun?.();
    this.isTransitioning = false;
    this.catIntroStarted = false;
    this.daisyRevealed = false;
    this.isWakingUp = false;
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

    // Lo sfondo 5502x1024 parte da sinistra e viene scalato sull'altezza del canvas.
    this.background = this.add.image(0, 0, 'background-01').setOrigin(0, 0).setDepth(0);
    this.backgroundScale = height / this.background.height;
    this.background.setScale(this.backgroundScale);

    this.worldWidth = Math.max(width, this.background.displayWidth);
    this.roadY = ROAD_Y(height);
    this.groundY = this.roadY;
    this.physics.world.setBounds(0, 0, this.worldWidth, height);
  }

  createRomy() {
    this.romy = this.physics.add.sprite(PLAYER_START_X, this.getRomyY(), 'romy-wake-01');
    this.romy.setName('Romy');
    this.romy.setDepth(20);
    this.romy.setOrigin(0.5, 1);
    this.setSpriteDisplayHeight(this.romy, ROMY_DISPLAY_HEIGHT);
    this.romy.setCollideWorldBounds(true);

    // Corpo fisico compatto: il movimento resta solo orizzontale e la base resta su ROAD_Y.
    const bodyWidth = 48 / this.romy.scaleX;
    const bodyHeight = ROMY_DISPLAY_HEIGHT / this.romy.scaleY;
    this.romy.body.setSize(bodyWidth, bodyHeight);
    this.romy.body.setOffset((this.romy.width - bodyWidth) / 2, this.romy.height - bodyHeight);
    this.romyShadow = this.createContactShadow(this.romy, { width: 64, height: 14, alpha: 0.34, depth: 19 });

    if (ROMY_IDLE_FRAMES.length > 1) {
      this.anims.create({
        key: 'romy-idle',
        frames: phaserFrames(ROMY_IDLE_FRAMES),
        frameRate: ROMY_IDLE_FRAME_RATE,
        repeat: -1
      });
    }

    const romyFrames = ROMY_WALK_FRAMES.slice(0, ROMY_FRAME_COUNT);

    if (romyFrames.length > 1) {
      this.anims.create({
        key: 'romy-walk',
        frames: phaserFrames(romyFrames),
        frameRate: ROMY_FRAME_RATE,
        repeat: -1
      });
    }
  }

  createNpcPlaceholders() {
    this.interactables = [
      {
        id: 'onofrio',
        objectName: 'Trigger_Onofrio',
        label: 'Onofrio',
        x: ONOFRIO_X,
        color: 0xb28cff,
        width: 58,
        height: 84,
        dialogueKey: 'onofrio',
        isAvailable: () => GameState.hasDaisy && !GameState.onofrioCompleted
      },
      {
        id: 'cat',
        objectName: 'Trigger_CatIntro',
        label: 'Gatto',
        x: CAT_TARGET_X,
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
        x: DAISY_X,
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
        x: SIGN_X,
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
    const { color, scale = 1, width = 74, height = 84 } = interactable;
    const container = this.add.container(x, y).setDepth(10).setScale(scale);
    const body = this.add
      .rectangle(0, -height / 2, width, height, color, 0.82)
      .setStrokeStyle(3, 0x1a1a1a);
    container.add([body]);
    interactable.shadow = this.createContactShadow(container, { width: width * scale, height: 18 * scale, alpha: 0.28, depth: 9 });
    return container;
  }

  createOnofrio(x, y, interactable) {
    const container = this.add.container(x, y).setDepth(13);
    const onofrio = this.add.sprite(0, 0, 'onofrio-idle-1').setOrigin(0.5, 1);
    this.setSpriteDisplayHeight(onofrio, ONOFRIO_DISPLAY_HEIGHT);

    if (ONOFRIO_IDLE_FRAMES.length > 1) {
      this.anims.create({
        key: 'onofrio-idle',
        frames: phaserFrames(ONOFRIO_IDLE_FRAMES),
        frameRate: 2,
        repeat: -1
      });

      onofrio.anims.play('onofrio-idle');
    }
    container.add([onofrio]);
    interactable.sprite = onofrio;
    interactable.shadow = this.createContactShadow(container, { width: 108, height: 24, alpha: 0.3, depth: 12 });
    return container;
  }

  createCat(x, y, interactable) {
    const container = this.add.container(x, y).setDepth(11);
    if (CAT_SPRITE_FRAMES.length === 0) {
      const placeholder = this.add
        .rectangle(0, -CAT_DISPLAY_HEIGHT / 2, 56, CAT_DISPLAY_HEIGHT, interactable.color, 0.88)
        .setStrokeStyle(3, 0x1a1a1a);
      container.add([placeholder]);
      interactable.sprite = null;
      interactable.shadow = this.createContactShadow(container, { width: 36, height: 9, alpha: 0.3, depth: 10 });
      return container;
    }

    const catTextureKey = CAT_SPRITE_FRAMES[0].key;
    const cat = this.add.sprite(0, 0, catTextureKey).setOrigin(0.5, 1);
    this.setSpriteDisplayHeight(cat, CAT_DISPLAY_HEIGHT);

    if (CAT_HAS_COMPLETE_WALK) {
      this.anims.create({
        key: 'cat-walk',
        frames: phaserFrames(CAT_WALK_FRAMES),
        frameRate: CAT_FRAME_RATE,
        repeat: -1
      });
      interactable.animationKey = 'cat-walk';
    }

    container.add([cat]);
    interactable.sprite = cat;
    interactable.textureKey = catTextureKey;
    interactable.shadow = this.createContactShadow(container, { width: 36, height: 9, alpha: 0.3, depth: 10 });
    return container;
  }

  createDaisy(x, y, interactable) {
    const container = this.add.container(x, y).setDepth(11);
    const daisy = this.add.sprite(0, 0, 'daisy-idle-1').setOrigin(0.5, 1);
    this.setSpriteDisplayHeight(daisy, DAISY_DISPLAY_HEIGHT);

    if (DAISY_IDLE_FRAMES.length > 1) {
      this.anims.create({
        key: 'daisy-idle',
        frames: phaserFrames(DAISY_IDLE_FRAMES),
        frameRate: DAISY_FRAME_RATE,
        repeat: -1
      });

      daisy.anims.play('daisy-idle');
    }
    container.add([daisy]);
    interactable.sprite = daisy;
    interactable.shadow = this.createContactShadow(container, { width: 22, height: 6, alpha: 0.28, depth: 10 });
    return container;
  }

  createNarrativeTriggers() {
    this.narrativeTriggers = {
      Trigger_Onofrio: ONOFRIO_X,
      Trigger_CatIntro: 0,
      Trigger_DaisyIntro: DAISY_X,
      Trigger_DirectionsSign: SIGN_X,
      Trigger_NextScene: Math.max(SIGN_X + 180, this.worldWidth - NEXT_SCENE_MARGIN)
    };

    this.BlackTransition = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(950)
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
    this.cameras.main.startFollow(this.romy, true, 0.12, 0, 0, 0);
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


  setSpriteDisplayHeight(sprite, targetHeight) {
    if (!sprite || !targetHeight || sprite.height === 0) {
      return sprite;
    }

    const uniformScale = targetHeight / sprite.height;
    sprite.setScale(uniformScale);
    return sprite;
  }

  moveRomy() {
    if (this.isWakingUp || this.dialogueManager?.isActive() || this.isTransitioning) {
      this.romy.y = this.getRomyY();
      this.romy.setVelocity(0, 0);
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
      this.romy.anims.play('romy-idle', true);
    }
  }

  stopRomy() {
    if (!this.romy) {
      return;
    }

    this.romy.y = this.getRomyY();
    this.romy.setVelocity(0, 0);
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
      if (cat.animationKey) {
        cat.sprite.anims.play(cat.animationKey, true);
      }
      cat.entranceTween = this.tweens.add({
        targets: cat.container,
        x: CAT_TARGET_X,
        duration: 3600,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          cat.sprite.anims.stop();
          cat.sprite.setTexture(cat.textureKey);
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
    this.dialogueManager.hideUi();
    this.tweens.add({
      targets: this.BlackTransition,
      alpha: 0,
      duration: 900,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.BlackTransition?.setVisible(false);
        this.setRomyPose('wake_01');
        this.isTransitioning = false;
        this.dialogueManager.startDialogue('main_intro');
      }
    });
  }

  setRomyPose(pose) {
    if (!this.romy) {
      return;
    }

    const poseTextures = {
      wake_01: 'romy-wake-01',
      wake_02: 'romy-wake-02',
      wake_03: 'romy-wake-03',
      wake_04: 'romy-wake-04'
    };

    this.romy.y = this.getRomyY();
    this.romy.setVelocity(0, 0);

    if (pose === 'idle') {
      this.isWakingUp = false;
      this.romy.anims.play('romy-idle', true);
      return;
    }

    const texture = poseTextures[pose];

    if (!texture) {
      return;
    }

    this.isWakingUp = true;
    this.romy.anims.stop();
    this.romy.setTexture(texture);
    this.setSpriteDisplayHeight(this.romy, ROMY_DISPLAY_HEIGHT);
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
