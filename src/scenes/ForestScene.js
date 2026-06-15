import Phaser from 'phaser';
import { dialogues } from '../data/dialogues.js';
import { DialogueManager } from '../systems/DialogueManager.js';
import { GameState } from '../systems/GameState.js';

// Gli asset restano in src/assets: Vite li trasforma in URL sicuri.
import backgroundUrl from '../assets/backgrounds/background_01.png?url';
import backgroundGioielliUrl from '../assets/backgrounds/background_gioielli.png?url';
import backgroundSposineUrl from '../assets/backgrounds/background_sposine.png?url';
import romyIdle01Url from '../assets/sprites/characters/romy/romy_idle_01.png?url';
import romyIdle02Url from '../assets/sprites/characters/romy/romy_idle_02.png?url';
import romyIdle03Url from '../assets/sprites/characters/romy/romy_idle_03.png?url';
import romyWake01Url from '../assets/sprites/characters/romy/romy_wake_01.png?url';
import romyWake02Url from '../assets/sprites/characters/romy/romy_wake_02.png?url';
import romyWake03Url from '../assets/sprites/characters/romy/romy_wake_03.png?url';
import romyWake04Url from '../assets/sprites/characters/romy/romy_wake_04.png?url';
import romyWalk01Url from '../assets/sprites/characters/romy/romy_walk_01.png?url';
import romyWalk02Url from '../assets/sprites/characters/romy/romy_walk_02.png?url';
import romyWalk03Url from '../assets/sprites/characters/romy/romy_walk_03.png?url';
import romyWalk04Url from '../assets/sprites/characters/romy/romy_walk_04.png?url';
import romyDaisyIdle01Url from '../assets/sprites/characters/romy/romy_daisy_idle_01.png?url';
import romyDaisyIdle02Url from '../assets/sprites/characters/romy/romy_daisy_idle_02.png?url';
import romyDaisyIdle03Url from '../assets/sprites/characters/romy/romy_daisy_idle_03.png?url';
import romyDaisyWalk01Url from '../assets/sprites/characters/romy/romy_daisy_walk_01.png?url';
import romyDaisyWalk02Url from '../assets/sprites/characters/romy/romy_daisy_walk_02.png?url';
import romyDaisyWalk03Url from '../assets/sprites/characters/romy/romy_daisy_walk_03.png?url';
import romyDaisyWalk04Url from '../assets/sprites/characters/romy/romy_daisy_walk_04.png?url';
import catIdle01Url from '../assets/sprites/characters/cat/cat_idle_01.png?url';
import catIdle02Url from '../assets/sprites/characters/cat/cat_idle_02.png?url';
import catIdle03Url from '../assets/sprites/characters/cat/cat_idle_03.png?url';
import catWalk01Url from '../assets/sprites/characters/cat/cat_walk_01.png?url';
import catWalk02Url from '../assets/sprites/characters/cat/cat_walk_02.png?url';
import catWalk03Url from '../assets/sprites/characters/cat/cat_walk_03.png?url';
import catWalk04Url from '../assets/sprites/characters/cat/cat_walk_04.png?url';
import daisyIdle01Url from '../assets/sprites/characters/daisy/daisy_idle_01.png?url';
import daisyIdle02Url from '../assets/sprites/characters/daisy/daisy_idle_02.png?url';
import daisyIdle03Url from '../assets/sprites/characters/daisy/daisy_idle_03.png?url';
import onofrioIdle01Url from '../assets/sprites/characters/onofrio/onofrio_sprite_01.png?url';
import onofrioIdle02Url from '../assets/sprites/characters/onofrio/onofrio_sprite_02.png?url';
import onofrioIdle03Url from '../assets/sprites/characters/onofrio/onofrio_sprite_03.png?url';
import madamaIdle01Url from '../assets/sprites/characters/madama/madama_idle_01.png?url';
import madamaIdle02Url from '../assets/sprites/characters/madama/madama_idle_02.png?url';
import madamaIdle03Url from '../assets/sprites/characters/madama/madama_idle_03.png?url';
import madamaIdle04Url from '../assets/sprites/characters/madama/madama_idle_04.png?url';


const cappellaioAssets = import.meta.glob('../assets/sprites/characters/cappellaio/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
});
const cappellaioUrl = (fileName) => cappellaioAssets[`../assets/sprites/characters/cappellaio/${fileName}`];

const cavalloAssets = import.meta.glob('../assets/sprites/characters/cavallo/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
});
const cavalloUrl = (fileName) => cavalloAssets[`../assets/sprites/characters/cavallo/${fileName}`];

const sposeAssets = import.meta.glob('../assets/sprites/characters/{spose,sposine}/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
});
const sposeUrl = (fileName) => sposeAssets[`../assets/sprites/characters/spose/${fileName}`]
  ?? sposeAssets[`../assets/sprites/characters/sposine/${fileName}`];

const signpostAssets = import.meta.glob('../assets/objects/signpost/signpost_crossroad.png', {
  eager: true,
  query: '?url',
  import: 'default'
});
const signpostCrossroadUrl = signpostAssets['../assets/objects/signpost/signpost_crossroad.png'];

const frame = (key, url) => ({ key, url });

const ROMY_IDLE_FRAMES = [
  frame('romy-idle-01', romyIdle01Url),
  frame('romy-idle-02', romyIdle02Url),
  frame('romy-idle-03', romyIdle03Url)
];

const ROMY_WALK_FRAMES = [
  frame('romy-walk-01', romyWalk01Url),
  frame('romy-walk-02', romyWalk02Url),
  frame('romy-walk-03', romyWalk03Url),
  frame('romy-walk-04', romyWalk04Url)
];

const ROMY_WAKE_FRAMES = [
  frame('romy-wake-01', romyWake01Url),
  frame('romy-wake-02', romyWake02Url),
  frame('romy-wake-03', romyWake03Url),
  frame('romy-wake-04', romyWake04Url)
];

const ROMY_DAISY_IDLE_FRAMES = [
  frame('romy-daisy-idle-01', romyDaisyIdle01Url),
  frame('romy-daisy-idle-02', romyDaisyIdle02Url),
  frame('romy-daisy-idle-03', romyDaisyIdle03Url)
];

const ROMY_DAISY_WALK_FRAMES = [
  frame('romy-daisy-walk-01', romyDaisyWalk01Url),
  frame('romy-daisy-walk-02', romyDaisyWalk02Url),
  frame('romy-daisy-walk-03', romyDaisyWalk03Url),
  frame('romy-daisy-walk-04', romyDaisyWalk04Url)
];

const CAT_IDLE_FRAMES = [
  frame('cat-idle-01', catIdle01Url),
  frame('cat-idle-02', catIdle02Url),
  frame('cat-idle-03', catIdle03Url)
];

const CAT_WALK_FRAMES = [
  frame('cat-walk-01', catWalk01Url),
  frame('cat-walk-02', catWalk02Url),
  frame('cat-walk-03', catWalk03Url),
  frame('cat-walk-04', catWalk04Url)
];

const DAISY_IDLE_FRAMES = [
  frame('daisy-idle-01', daisyIdle01Url),
  frame('daisy-idle-02', daisyIdle02Url),
  frame('daisy-idle-03', daisyIdle03Url)
];

const ONOFRIO_IDLE_FRAMES = [
  frame('onofrio-idle-01', onofrioIdle01Url),
  frame('onofrio-idle-02', onofrioIdle02Url),
  frame('onofrio-idle-03', onofrioIdle03Url)
];


const CAPPELLAIO_IDLE_FRAMES = [
  frame('cappellaio_idle_01', cappellaioUrl('cappellaio_idle_01.png')),
  frame('cappellaio_idle_02', cappellaioUrl('cappellaio_idle_02.png')),
  frame('cappellaio_idle_03', cappellaioUrl('cappellaio_idle_03.png')),
  frame('cappellaio_idle_04', cappellaioUrl('cappellaio_idle_04.png'))
].filter(({ url }) => Boolean(url));

const CAPPELLAIO_WALK_FRAMES = [
  frame('cappellaio_walk_01', cappellaioUrl('cappellaio_walk_01.png')),
  frame('cappellaio_walk_02', cappellaioUrl('cappellaio_walk_02.png')),
  frame('cappellaio_walk_03', cappellaioUrl('cappellaio_walk_03.png')),
  frame('cappellaio_walk_04', cappellaioUrl('cappellaio_walk_04.png'))
].filter(({ url }) => Boolean(url));

const CAPPELLAIO_IDLE_COLOUR_FRAMES = [
  frame('cappellaio_idle_colour_01', cappellaioUrl('cappellaio_idle_colour_01.png')),
  frame('cappellaio_idle_colour_02', cappellaioUrl('cappellaio_idle_colour_02.png')),
  frame('cappellaio_idle_colour_03', cappellaioUrl('cappellaio_idle_colour_03.png')),
  frame('cappellaio_idle_colour_04', cappellaioUrl('cappellaio_idle_colour_04.png'))
].filter(({ url }) => Boolean(url));

const MADAMA_IDLE_FRAMES = [
  frame('madama-idle-01', madamaIdle01Url),
  frame('madama-idle-02', madamaIdle02Url),
  frame('madama-idle-03', madamaIdle03Url),
  frame('madama-idle-04', madamaIdle04Url)
];

const SPOSE_IDLE_FRAMES = [
  frame('spose-idle-01', sposeUrl('spose_idle_01.png')),
  frame('spose-idle-02', sposeUrl('spose_idle_02.png')),
  frame('spose-idle-03', sposeUrl('spose_idle_03.png')),
  frame('spose-idle-04', sposeUrl('spose_idle_04.png'))
].filter(({ url }) => Boolean(url));

const CAVALLO_IDLE_FRAMES = [
  frame('cavallo-idle-01', cavalloUrl('cavallo_idle_01.png')),
  frame('cavallo-idle-02', cavalloUrl('cavallo_idle_02.png')),
  frame('cavallo-idle-03', cavalloUrl('cavallo_idle_03.png'))
].filter(({ url }) => Boolean(url));

const loadFrames = (scene, frames) => {
  frames.forEach(({ key, url }) => {
    scene.load.image(key, url);
  });
};

const phaserFrames = (frames) => frames.map(({ key }) => ({ key }));

const PLAYER_SPEED = 220;
const ROMY_FRAME_RATE = 7;
const ROMY_IDLE_FRAME_RATE = 3;
const CAT_WALK_FRAME_RATE = 6;
const CAT_IDLE_FRAME_RATE = 3;
const DAISY_FRAME_RATE = 3;
const ONOFRIO_FRAME_RATE = 2;
const MADAMA_FRAME_RATE = 3;
const SPOSE_FRAME_RATE = 4;
const CAVALLO_FRAME_RATE = 3;
const CAPPELLAIO_IDLE_FRAME_RATE = 3;
const CAPPELLAIO_WALK_FRAME_RATE = 7;
const CAPPELLAIO_DISPLAY_HEIGHT = 210;
const ROAD_Y = (canvasHeight) => canvasHeight - 118;
const ROMY_DISPLAY_HEIGHT = 142;
const CAT_DISPLAY_HEIGHT = 82;
const DAISY_DISPLAY_HEIGHT = 56;
const ONOFRIO_DISPLAY_HEIGHT = 312;
const MADAMA_DISPLAY_HEIGHT = 230;
const SPOSE_DISPLAY_HEIGHT = 190;
const CAVALLO_DISPLAY_HEIGHT = 190;
const SIGN_SCALE = 0.58;
const PLAYER_START_X = 260;
const CAT_TARGET_X = 430;
const DAISY_X = 720;
const ONOFRIO_X = 920;
const SIGN_X = 2520;
const CAPPELLAIO_X = SIGN_X - 170;
const CAPPELLAIO_ENTRANCE_OFFSET = 140;
const RABBIT_X = 2440;
const FINAL_MEADOW_X = 3950;
const FINAL_DAISY_X = 4300;
const FINAL_RABBIT_START_OFFSET = -140;
const FINAL_RABBIT_END_X = 4850;
const NEXT_SCENE_MARGIN = 180;
const INTERACTION_DISTANCE = 110;
const CAT_FOLLOW_DISTANCE = 92;
const CAT_FOLLOW_DEADZONE = 24;
const CAT_FOLLOW_SPEED = 118;
const HINT_TEXT = 'Premi E per interagire';
const ATMOSPHERE_ALPHA = 0.08;

const AREA_SPAWN_X = {
  forest: PLAYER_START_X,
  madama: 160,
  sposine: 2180,
  pittore: 2680
};

export class ForestScene extends Phaser.Scene {
  constructor() {
    super('ForestScene');
  }

  preload() {
    // Carica solo gli asset reali elencati per personaggio.
    this.load.image('background-01', backgroundUrl);
    this.load.image('background-gioielli', backgroundGioielliUrl);
    this.load.image('background-sposine', backgroundSposineUrl);
    loadFrames(this, ROMY_IDLE_FRAMES);
    loadFrames(this, ROMY_WALK_FRAMES);
    loadFrames(this, ROMY_WAKE_FRAMES);
    loadFrames(this, ROMY_DAISY_IDLE_FRAMES);
    loadFrames(this, ROMY_DAISY_WALK_FRAMES);
    loadFrames(this, CAT_IDLE_FRAMES);
    loadFrames(this, CAT_WALK_FRAMES);
    loadFrames(this, DAISY_IDLE_FRAMES);
    loadFrames(this, ONOFRIO_IDLE_FRAMES);
    loadFrames(this, MADAMA_IDLE_FRAMES);
    loadFrames(this, SPOSE_IDLE_FRAMES);
    loadFrames(this, CAPPELLAIO_IDLE_FRAMES);
    loadFrames(this, CAPPELLAIO_WALK_FRAMES);
    loadFrames(this, CAPPELLAIO_IDLE_COLOUR_FRAMES);
    loadFrames(this, CAVALLO_IDLE_FRAMES);

    if (signpostCrossroadUrl) {
      // REAL SIGNPOST ASSET: src/assets/objects/signpost/signpost_crossroad.png
      this.load.image('crossroadSignFinal', signpostCrossroadUrl);
    }
  }

  create() {
    GameState.resetForNewRun?.();
    this.isTransitioning = false;
    this.autoWalkingToRabbit = false;
    this.catIntroStarted = false;
    this.daisyRevealed = false;
    this.isWakingUp = false;
    this.blackIntroActive = false;
    this.blackIntroIndex = 0;
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
    this.createCappellaioAnimations();
    this.createCavalloAnimations();
    this.createCappellaio();
    this.createRabbitPlaceholder();
    this.createFinalMeadow();
    this.updateNpcVisibility();
    this.startInitialIntro();
  }

  update() {
    this.moveRomy();
    this.updateNpcVisibility();
    this.updateCatIntro();
    this.updateCatFollower();
    this.updateNextSceneTrigger();
    this.updateFinalMeadowTrigger();
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
    this.currentBackgroundKey = 'background-01';

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
    // INTRO WAKE INITIAL POSE: Romy starts hidden on romy_wake_01 so no idle frame can flash before wake.
    this.romy.anims.stop();
    this.romy.setTexture('romy-wake-01');
    this.romy.setVisible(false);

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

    if (ROMY_WALK_FRAMES.length > 1) {
      this.anims.create({
        key: 'romy-walk',
        frames: phaserFrames(ROMY_WALK_FRAMES),
        frameRate: ROMY_FRAME_RATE,
        repeat: -1
      });
    }

    if (ROMY_DAISY_IDLE_FRAMES.length > 1) {
      this.anims.create({
        key: 'romy-daisy-idle',
        frames: phaserFrames(ROMY_DAISY_IDLE_FRAMES),
        frameRate: ROMY_IDLE_FRAME_RATE,
        repeat: -1
      });
    }

    if (ROMY_DAISY_WALK_FRAMES.length > 1) {
      this.anims.create({
        key: 'romy-daisy-walk',
        frames: phaserFrames(ROMY_DAISY_WALK_FRAMES),
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
        width: 88,
        height: 150,
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
          this.playRomyIdleAnimation();
          this.updateNpcVisibility();
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
        objectName: 'Trigger_Madama',
        x: 1180,
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
        id: 'final_daisy',
        label: 'Prato di margherite',
        x: FINAL_DAISY_X,
        color: 0xf6f2a4,
        width: 112,
        height: 80,
        dialogueKey: 'final_daisy_placed',
        isAvailable: () => GameState.currentArea === 'madama' && GameState.finalMeadowStarted && !GameState.finalDaisyPlaced,
        onInteract: () => {
          this.placeFinalDaisy();
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

      if (interactable.id === 'sign_directions') {
        interactable.container = this.createSignpost(interactable.x, this.groundY, interactable);
        return;
      }

      if (interactable.id === 'madama') {
        interactable.container = this.createMadama(interactable.x, this.groundY, interactable);
        return;
      }

      if (interactable.id === 'final_daisy') {
        interactable.container = this.createFinalDaisySpot(interactable.x, this.groundY, interactable);
        return;
      }

      if (interactable.id === 'sposine') {
        interactable.container = this.createSposine(interactable.x, this.groundY, interactable);
        return;
      }

      if (interactable.id === 'cavallo') {
        interactable.container = this.createCavallo(interactable.x, this.groundY, interactable);
        return;
      }

      interactable.container = this.createPlaceholder(interactable.x, this.groundY, interactable);
    });
  }


  createCappellaioAnimations() {
    // Optional Cappellaio assets are connected only when real files exist in src/assets/sprites/characters/cappellaio/.
    if (CAPPELLAIO_IDLE_FRAMES.length > 1 && !this.anims.exists('cappellaio_idle')) {
      this.anims.create({
        key: 'cappellaio_idle',
        frames: phaserFrames(CAPPELLAIO_IDLE_FRAMES),
        frameRate: CAPPELLAIO_IDLE_FRAME_RATE,
        repeat: -1
      });
    }

    if (CAPPELLAIO_WALK_FRAMES.length > 1 && !this.anims.exists('cappellaio_walk')) {
      this.anims.create({
        key: 'cappellaio_walk',
        frames: phaserFrames(CAPPELLAIO_WALK_FRAMES),
        frameRate: CAPPELLAIO_WALK_FRAME_RATE,
        repeat: -1
      });
    }

    if (CAPPELLAIO_IDLE_COLOUR_FRAMES.length > 1 && !this.anims.exists('cappellaio_idle_colour')) {
      this.anims.create({
        key: 'cappellaio_idle_colour',
        frames: phaserFrames(CAPPELLAIO_IDLE_COLOUR_FRAMES),
        frameRate: CAPPELLAIO_IDLE_FRAME_RATE,
        repeat: -1
      });
    }
  }

  createCavalloAnimations() {
    if (CAVALLO_IDLE_FRAMES.length > 1 && !this.anims.exists('cavallo-idle')) {
      this.anims.create({
        key: 'cavallo-idle',
        frames: phaserFrames(CAVALLO_IDLE_FRAMES),
        frameRate: CAVALLO_FRAME_RATE,
        repeat: -1
      });
    }
  }

  createCavallo(x, y, interactable) {
    if (!CAVALLO_IDLE_FRAMES.length) {
      return this.createPlaceholder(x, y, interactable);
    }

    const container = this.add.container(x, y).setDepth(12);
    const cavallo = this.add.sprite(0, 0, CAVALLO_IDLE_FRAMES[0].key).setOrigin(0.5, 1);
    this.setSpriteDisplayHeight(cavallo, CAVALLO_DISPLAY_HEIGHT);

    if (this.anims.exists('cavallo-idle')) {
      cavallo.anims.play('cavallo-idle');
    }

    container.add([cavallo]);
    interactable.sprite = cavallo;
    interactable.shadow = this.createContactShadow(container, { width: 120, height: 22, alpha: 0.3, depth: 11 });
    return container;
  }

  createSposine(x, y, interactable) {
    if (!SPOSE_IDLE_FRAMES.length) {
      return this.createPlaceholder(x, y, interactable);
    }

    const container = this.add.container(x, y).setDepth(12);
    const spose = this.add.sprite(0, 0, SPOSE_IDLE_FRAMES[0].key).setOrigin(0.5, 1);
    this.setSpriteDisplayHeight(spose, SPOSE_DISPLAY_HEIGHT);

    if (SPOSE_IDLE_FRAMES.length > 1 && !this.anims.exists('spose-idle')) {
      this.anims.create({
        key: 'spose-idle',
        frames: phaserFrames(SPOSE_IDLE_FRAMES),
        frameRate: SPOSE_FRAME_RATE,
        repeat: -1
      });
      spose.anims.play('spose-idle');
    }

    container.add([spose]);
    interactable.sprite = spose;
    interactable.shadow = this.createContactShadow(container, { width: 110, height: 20, alpha: 0.3, depth: 11 });
    return container;
  }

  createCappellaio() {
    const firstFrame = CAPPELLAIO_IDLE_FRAMES[0]?.key ?? CAPPELLAIO_WALK_FRAMES[0]?.key;

    if (!firstFrame) {
      return;
    }

    this.cappellaioContainer = this.add.container(this.worldWidth + CAPPELLAIO_ENTRANCE_OFFSET, this.groundY).setDepth(12);
    this.cappellaio = this.add.sprite(0, 0, firstFrame).setOrigin(0.5, 1);
    this.setSpriteDisplayHeight(this.cappellaio, CAPPELLAIO_DISPLAY_HEIGHT);
    this.cappellaioContainer.add(this.cappellaio);
    this.cappellaioShadow = this.createContactShadow(this.cappellaioContainer, { width: 92, height: 18, alpha: 0.3, depth: 11 });
    this.cappellaioContainer.setVisible(false);
    this.cappellaioShadow.setVisible(false);
    this.updateCappellaioAnimation();
  }

  updateCappellaioAnimation() {
    if (!this.cappellaio) {
      return;
    }

    const animationKey = GameState.hatterColored && this.anims.exists('cappellaio_idle_colour')
      ? 'cappellaio_idle_colour'
      : this.anims.exists('cappellaio_idle')
        ? 'cappellaio_idle'
        : null;

    if (animationKey) {
      this.cappellaio.anims.play(animationKey, true);
    }
  }

  createRabbitPlaceholder() {
    this.rabbitContainer = this.add.container(RABBIT_X, this.groundY).setDepth(12);
    const body = this.add.ellipse(0, -38, 42, 58, 0xf6f1df, 0.95).setStrokeStyle(2, 0x6f5c4a, 0.8);
    const head = this.add.ellipse(0, -82, 34, 32, 0xfff8e7, 0.98).setStrokeStyle(2, 0x6f5c4a, 0.8);
    const earLeft = this.add.ellipse(-9, -114, 12, 46, 0xfff8e7, 0.98).setStrokeStyle(2, 0x6f5c4a, 0.8);
    const earRight = this.add.ellipse(9, -114, 12, 46, 0xfff8e7, 0.98).setStrokeStyle(2, 0x6f5c4a, 0.8);
    const eye = this.add.circle(7, -86, 2, 0x17212b, 1);
    const label = this.add.text(0, -150, 'Coniglio', { fontFamily: 'Georgia, Times New Roman, serif', fontSize: '14px', color: '#fff4c4' }).setOrigin(0.5);
    this.rabbitContainer.add([earLeft, earRight, body, head, eye, label]);
    this.rabbitShadow = this.createContactShadow(this.rabbitContainer, { width: 44, height: 10, alpha: 0.26, depth: 11 });
    this.rabbitContainer.setVisible(false);
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
    const onofrio = this.add.sprite(0, 0, 'onofrio-idle-01').setOrigin(0.5, 1);
    this.setSpriteDisplayHeight(onofrio, ONOFRIO_DISPLAY_HEIGHT);

    if (ONOFRIO_IDLE_FRAMES.length > 1) {
      this.anims.create({
        key: 'onofrio-idle',
        frames: phaserFrames(ONOFRIO_IDLE_FRAMES),
        frameRate: ONOFRIO_FRAME_RATE,
        repeat: -1
      });

      onofrio.anims.play('onofrio-idle');
    }
    container.add([onofrio]);
    interactable.sprite = onofrio;
    interactable.shadow = this.createContactShadow(container, { width: 162, height: 34, alpha: 0.34, depth: 12 });
    return container;
  }

  createCat(x, y, interactable) {
    const container = this.add.container(x, y).setDepth(11);
    const catTextureKey = CAT_IDLE_FRAMES[0].key;
    const cat = this.add.sprite(0, 0, catTextureKey).setOrigin(0.5, 1);
    this.setSpriteDisplayHeight(cat, CAT_DISPLAY_HEIGHT);

    if (CAT_IDLE_FRAMES.length > 1) {
      this.anims.create({
        key: 'cat-idle',
        frames: phaserFrames(CAT_IDLE_FRAMES),
        frameRate: CAT_IDLE_FRAME_RATE,
        repeat: -1
      });
      cat.anims.play('cat-idle');
    }

    if (CAT_WALK_FRAMES.length > 1) {
      this.anims.create({
        key: 'cat-walk',
        frames: phaserFrames(CAT_WALK_FRAMES),
        frameRate: CAT_WALK_FRAME_RATE,
        repeat: -1
      });
      interactable.walkAnimationKey = 'cat-walk';
      interactable.idleAnimationKey = 'cat-idle';
    }

    container.add([cat]);
    interactable.sprite = cat;
    interactable.textureKey = catTextureKey;
    interactable.shadow = this.createContactShadow(container, { width: 42, height: 10, alpha: 0.3, depth: 10 });
    return container;
  }

  createDaisy(x, y, interactable) {
    const container = this.add.container(x, y).setDepth(11);
    const daisy = this.add.sprite(0, 0, 'daisy-idle-01').setOrigin(0.5, 1);
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
    interactable.shadow = this.createContactShadow(container, { width: 24, height: 7, alpha: 0.28, depth: 10 });
    return container;
  }


  createMadama(x, y, interactable) {
    const container = this.add.container(x, y).setDepth(12);
    const madama = this.add.sprite(0, 0, 'madama-idle-01').setOrigin(0.5, 1);
    this.setSpriteDisplayHeight(madama, MADAMA_DISPLAY_HEIGHT);

    // MADAMA REAL ASSETS: src/assets/sprites/characters/madama/madama_idle_01.png ... madama_idle_04.png
    if (MADAMA_IDLE_FRAMES.length > 1) {
      this.anims.create({
        key: 'madama-idle',
        frames: phaserFrames(MADAMA_IDLE_FRAMES),
        frameRate: MADAMA_FRAME_RATE,
        repeat: -1
      });
      madama.anims.play('madama-idle');
    }

    container.add([madama]);
    interactable.sprite = madama;
    interactable.shadow = this.createContactShadow(container, { width: 92, height: 18, alpha: 0.3, depth: 11 });
    return container;
  }

  createSignpost(x, y, interactable) {
    // REAL SIGNPOST ASSET: src/assets/objects/signpost/signpost_crossroad.png
    if (this.textures.exists('crossroadSignFinal')) {
      if (import.meta.env?.DEV) {
        console.log('Using real signpost asset: signpost_crossroad.png');
      }
      const container = this.add.container(x, y).setDepth(10);
      const signpost = this.add.sprite(0, 0, 'crossroadSignFinal').setOrigin(0.5, 1);
      signpost.setScale(interactable.scale ?? SIGN_SCALE);
      container.add([signpost]);
      interactable.sprite = signpost;
      interactable.shadow = this.createContactShadow(container, {
        width: Math.max(70, signpost.displayWidth * 0.78),
        height: 18,
        alpha: 0.3,
        depth: 9
      });
      return container;
    }

    const container = this.createPlaceholder(x, y, interactable);
    const label = this.add
      .text(0, -110, '↙  ★  ↘\n🍓  🐾', {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '20px',
        color: '#f8e7a2',
        align: 'center',
        backgroundColor: '#392414',
        padding: { x: 8, y: 6 }
      })
      .setOrigin(0.5);
    container.add(label);
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
    this.prepareRomyWakeIntroPose();
    this.BlackTransition?.setVisible(true).setAlpha(1);
    this.startBlackIntro();
  }

  startBlackIntro() {
    this.blackIntroLines = dialogues.intro_black ?? [];
    this.blackIntroIndex = 0;
    this.blackIntroActive = true;
    this.isTransitioning = true;
    this.dialogueManager?.hideUi();
    this.interactHint?.setVisible(false);

    const { width, height } = this.scale;

    this.blackIntroText = this.add
      .text(width / 2, height / 2 - 12, '', {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '26px',
        color: '#f5eed8',
        align: 'center',
        lineSpacing: 9,
        wordWrap: { width: Math.round(width * 0.72) }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(970);

    this.blackIntroHint = this.add
      .text(width / 2, height - 54, 'SPACE / E continua', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: '#b8c6c0'
      })
      .setOrigin(0.5)
      .setAlpha(0.72)
      .setScrollFactor(0)
      .setDepth(970);

    this.showBlackIntroLine();
  }

  showBlackIntroLine() {
    const line = this.blackIntroLines?.[this.blackIntroIndex];

    if (!line) {
      this.finishBlackIntro();
      return;
    }

    this.blackIntroText?.setAlpha(0).setText(line.text ?? '');
    this.tweens.add({
      targets: this.blackIntroText,
      alpha: 1,
      duration: 240,
      ease: 'Sine.easeOut'
    });
  }

  advanceBlackIntro() {
    if (!this.blackIntroActive) {
      return;
    }

    const line = this.blackIntroLines?.[this.blackIntroIndex];
    this.dialogueManager?.runAction(line?.action);

    if (!this.blackIntroActive) {
      return;
    }

    this.blackIntroIndex += 1;
    this.showBlackIntroLine();
  }

  finishBlackIntro() {
    this.blackIntroActive = false;
    this.blackIntroText?.destroy();
    this.blackIntroHint?.destroy();
    this.blackIntroText = null;
    this.blackIntroHint = null;
    this.revealForestIntro();
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
      fullscreen: Phaser.Input.Keyboard.KeyCodes.F,
      skip: Phaser.Input.Keyboard.KeyCodes.TAB
    });

    const skipDialogue = () => {
      if (this.blackIntroActive) {
        this.advanceBlackIntro();
        return;
      }

      this.dialogueManager.skipOrNextLine();
    };

    this.input.keyboard.on('keydown-SPACE', skipDialogue);

    this.input.keyboard.on('keydown-TAB', (event) => {
      event?.preventDefault?.();
      skipDialogue();
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
      if (this.blackIntroActive) {
        this.advanceBlackIntro();
        return;
      }

      if (this.dialogueManager.isChoosing()) {
        this.dialogueManager.confirmChoice();
        return;
      }

      if (this.dialogueManager.isActive()) {
        this.dialogueManager.nextLine();
        return;
      }

      this.interactWithNearest();
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
      this.romy.anims.play(this.getRomyWalkAnimationKey(), true);
      this.romy.setFlipX(velocityX < 0);
    } else {
      this.playRomyIdleAnimation();
    }
  }

  stopRomy() {
    if (!this.romy) {
      return;
    }

    this.romy.y = this.getRomyY();
    this.romy.setVelocity(0, 0);
    this.playRomyIdleAnimation();
  }

  getRomyIdleAnimationKey() {
    return GameState.hasDaisy && this.anims.exists('romy-daisy-idle') ? 'romy-daisy-idle' : 'romy-idle';
  }

  getRomyWalkAnimationKey() {
    return GameState.hasDaisy && this.anims.exists('romy-daisy-walk') ? 'romy-daisy-walk' : 'romy-walk';
  }

  playRomyIdleAnimation() {
    if (!this.romy) {
      return;
    }

    const idleKey = this.getRomyIdleAnimationKey();

    if (this.anims.exists(idleKey)) {
      this.romy.anims.play(idleKey, true);
      this.setSpriteDisplayHeight(this.romy, ROMY_DISPLAY_HEIGHT);
    }
  }

  updateNpcVisibility() {
    this.interactables.forEach((interactable) => {
      interactable.container.setVisible(this.isNpcVisible(interactable));
    });
    this.cappellaioContainer?.setVisible(GameState.currentArea === 'forest' && (GameState.cappellaioEntered || this.cappellaioEntranceStarted));
    this.cappellaioShadow?.setVisible(GameState.currentArea === 'forest' && (GameState.cappellaioEntered || this.cappellaioEntranceStarted));
    this.rabbitContainer?.setVisible(GameState.currentArea === 'madama' && GameState.finalRabbitSeen);
    if (!this.isCappellaioEntering) {
      this.updateCappellaioAnimation();
    }
  }

  isNpcVisible(interactable) {
    if (interactable.id === 'onofrio') {
      return GameState.currentArea === 'forest';
    }

    if (interactable.id === 'cat') {
      return this.catIntroStarted;
    }

    if (interactable.id === 'daisy') {
      return GameState.currentArea === 'forest' && this.daisyRevealed && !GameState.hasDaisy;
    }

    if (interactable.id === 'sign_directions') {
      return GameState.currentArea === 'forest' && GameState.hasSpruzzino;
    }

    if (interactable.id === 'final_daisy') {
      return GameState.currentArea === 'madama' && GameState.finalMeadowStarted;
    }

    if (['madama', 'sposine', 'pittore', 'cavallo'].includes(interactable.id)) {
      return GameState.currentArea === interactable.id;
    }

    if (interactable.id === 'rabbit') {
      return false;
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
      if (cat.walkAnimationKey) {
        cat.sprite.anims.play(cat.walkAnimationKey, true);
      }
      cat.entranceTween = this.tweens.add({
        targets: cat.container,
        x: CAT_TARGET_X,
        duration: 3600,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          if (cat.idleAnimationKey) {
            cat.sprite.anims.play(cat.idleAnimationKey, true);
          } else {
            cat.sprite.anims.stop();
            cat.sprite.setTexture(cat.textureKey);
          }
          cat.entranceComplete = true;
        }
      });
    }
  }

  updateCatFollower() {
    const cat = this.interactables?.find((interactable) => interactable.id === 'cat');

    if (!cat?.sprite || !cat.container.visible || !cat.entranceComplete) {
      return;
    }

    if (this.dialogueManager?.isActive() || this.blackIntroActive || this.isTransitioning || this.isWakingUp) {
      this.setCatIdle(cat);
      return;
    }

    const romyVelocity = this.romy.body?.velocity?.x ?? 0;
    const offsetDirection = this.romy.flipX ? 1 : -1;
    const targetX = Phaser.Math.Clamp(this.romy.x + offsetDirection * CAT_FOLLOW_DISTANCE, 0, this.worldWidth);
    const distance = targetX - cat.container.x;

    cat.container.y = this.getRomyY();

    if (Math.abs(distance) <= CAT_FOLLOW_DEADZONE && Math.abs(romyVelocity) < 1) {
      this.setCatIdle(cat);
      return;
    }

    const step = Phaser.Math.Clamp(distance * 0.055, -CAT_FOLLOW_SPEED / 60, CAT_FOLLOW_SPEED / 60);
    cat.container.x += step * (this.game.loop.delta / 16.6667);
    cat.sprite.setFlipX(distance < 0);

    if (cat.walkAnimationKey) {
      cat.sprite.anims.play(cat.walkAnimationKey, true);
    }
  }

  setCatIdle(cat) {
    if (cat?.idleAnimationKey) {
      cat.sprite.anims.play(cat.idleAnimationKey, true);
      return;
    }

    cat?.sprite?.anims?.stop();
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
    this.blackIntroActive = false;
    this.blackIntroText?.destroy();
    this.blackIntroHint?.destroy();
    this.blackIntroText = null;
    this.blackIntroHint = null;
    this.isTransitioning = true;
    this.interactHint.setVisible(false);
    this.dialogueManager.hideUi();
    this.prepareRomyWakeIntroPose(true);
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

  prepareRomyWakeIntroPose(makeVisible = false) {
    if (!this.romy) {
      return;
    }

    // INTRO WAKE INITIAL POSE: this is the only intro setup path before the forest is revealed.
    this.isWakingUp = true;
    this.romy.anims.stop();
    this.romy.setTexture('romy-wake-01');
    this.setSpriteDisplayHeight(this.romy, ROMY_DISPLAY_HEIGHT);
    this.romy.setPosition(this.romy.x || PLAYER_START_X, this.getRomyY());
    this.romy.setVelocity(0, 0);
    this.romy.setVisible(Boolean(makeVisible));
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
      this.playRomyIdleAnimation();
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

  startCappellaioEntrance() {
    if (!this.cappellaioContainer || GameState.cappellaioEntered || this.cappellaioEntranceStarted) {
      return;
    }

    this.cappellaioEntranceStarted = true;
    this.isCappellaioEntering = true;
    this.stopRomy();
    const startX = Math.min(this.worldWidth - 40, this.cameras.main.scrollX + this.scale.width + CAPPELLAIO_ENTRANCE_OFFSET);
    this.cappellaioContainer.setPosition(startX, this.getRomyY());
    this.cappellaioContainer.setVisible(true);
    this.cappellaio?.setFlipX(true);

    if (this.anims.exists('cappellaio_walk')) {
      this.cappellaio.anims.play('cappellaio_walk', true);
    }

    this.tweens.add({
      targets: this.cappellaioContainer,
      x: CAPPELLAIO_X,
      duration: 2100,
      ease: 'Sine.easeOut',
      onComplete: () => {
        GameState.cappellaioEntered = true;
        this.cappellaioEntranceStarted = false;
        this.isCappellaioEntering = false;
        this.cappellaio?.setFlipX(false);
        this.updateCappellaioAnimation();
        this.updateNpcVisibility();
      }
    });
  }

  revealDaisy() {
    this.daisyRevealed = true;
    this.updateNpcVisibility();
  }

  finishMainIntro() {
    if (!GameState.tutorialMovementShown) {
      GameState.tutorialMovementShown = true;
    }

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

  updateAutoWalkToRabbit() {
    if (!this.autoWalkingToRabbit || this.dialogueManager?.isActive() || this.isTransitioning) {
      return;
    }

    const targetX = Math.min(RABBIT_X - 96, this.worldWidth - 40);
    this.romy.y = this.getRomyY();
    this.romy.setFlipX(false);

    if (this.romy.x >= targetX) {
      this.autoWalkingToRabbit = false;
      this.romy.setVelocity(0, 0);
      this.playRomyIdleAnimation();
      return;
    }

    this.romy.setVelocity(PLAYER_SPEED * 0.58, 0);
    this.romy.anims.play(this.getRomyWalkAnimationKey(), true);
  }

  startRabbitFinalWalk() {
    GameState.madamaCompleted = true;
    this.updateNpcVisibility();
    this.autoWalkingToRabbit = true;
    this.isTransitioning = false;
  }

  createFinalMeadow() {
    this.finalMeadowContainer = this.add.container(FINAL_MEADOW_X, this.groundY).setDepth(3);
    const glow = this.add.ellipse(360, -44, 980, 170, 0xf7f0c8, 0.16);
    const grass = this.add.rectangle(360, -16, 1040, 76, 0xd8e8bd, 0.18).setOrigin(0.5, 0.5);
    const flowers = [];

    for (let i = 0; i < 34; i += 1) {
      const x = 20 + i * 28;
      const y = -30 - (i % 5) * 5;
      flowers.push(this.add.circle(x, y, 5, 0xfffbdf, 0.9));
      flowers.push(this.add.circle(x, y - 1, 2, 0xf3d86a, 0.95));
    }

    this.finalMeadowContainer.add([glow, grass, ...flowers]);
    this.finalMeadowContainer.setVisible(false);
  }

  createFinalDaisySpot(x, y, interactable) {
    const container = this.add.container(x, y).setDepth(11);
    const marker = this.add.ellipse(0, -18, 120, 36, 0xf7f0c8, 0.12).setStrokeStyle(1, 0xf3df9b, 0.22);
    const daisy = this.add.sprite(0, 0, 'daisy-idle-01').setOrigin(0.5, 1);
    this.setSpriteDisplayHeight(daisy, DAISY_DISPLAY_HEIGHT);
    daisy.setVisible(false);
    container.add([marker, daisy]);
    interactable.sprite = daisy;
    interactable.shadow = this.createContactShadow(container, { width: 34, height: 8, alpha: 0.22, depth: 10 });
    return container;
  }

  updateFinalMeadowTrigger() {
    if (GameState.currentArea !== 'madama' || !GameState.madamaCompleted || GameState.finalMeadowStarted || this.isTransitioning || this.dialogueManager?.isActive()) {
      return;
    }

    if (this.romy.x >= FINAL_MEADOW_X - 90) {
      GameState.finalMeadowStarted = true;
      this.finalMeadowContainer?.setVisible(true);
      this.stopRomy();
      this.dialogueManager.startDialogue('final_meadow_intro');
    }
  }

  completeMadamaArea() {
    GameState.madamaCompleted = true;
    this.finalMeadowContainer?.setVisible(true);
    this.updateNpcVisibility();
  }

  placeFinalDaisy() {
    GameState.finalDaisyPlaced = true;
    GameState.hasDaisy = false;
    this.playRomyIdleAnimation();
    const finalDaisy = this.interactables?.find((interactable) => interactable.id === 'final_daisy');
    finalDaisy?.sprite?.setVisible(true);
    this.updateNpcVisibility();
  }

  startFinalRabbit() {
    if (!this.rabbitContainer || GameState.finalRabbitSeen) {
      return;
    }

    GameState.finalRabbitSeen = true;
    const startX = Math.max(0, this.cameras.main.scrollX + FINAL_RABBIT_START_OFFSET);
    this.rabbitContainer.setPosition(startX, this.getRomyY());
    this.rabbitContainer.setVisible(true);
    this.rabbitShadow?.setVisible(true);

    const exclamation = this.add.text(this.romy.x, this.romy.y - ROMY_DISPLAY_HEIGHT - 28, '!', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '40px',
      color: '#fff1a8',
      fontStyle: 'bold',
      stroke: '#1b1020',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(40);

    this.tweens.add({ targets: exclamation, y: exclamation.y - 18, alpha: 0, duration: 1200, ease: 'Sine.easeOut', onComplete: () => exclamation.destroy() });
    this.tweens.add({ targets: this.rabbitContainer, x: Math.min(FINAL_RABBIT_END_X, this.worldWidth + 120), duration: 2400, ease: 'Sine.easeIn', onComplete: () => this.rabbitContainer?.setVisible(false) });
  }

  finishFinalFade() {
    this.stopRomy();
    this.tweens.add({
      targets: this.romy,
      angle: -8,
      alpha: 0.45,
      duration: 1800,
      ease: 'Sine.easeInOut'
    });
    this.BlackTransition?.setVisible(true).setAlpha(0);
    this.tweens.add({
      targets: this.BlackTransition,
      alpha: 1,
      duration: 3200,
      ease: 'Sine.easeInOut'
    });
  }

  updateAreaBackground(area) {
    const textureKey = area === 'madama'
      ? 'background-gioielli'
      : area === 'sposine'
        ? 'background-sposine'
        : 'background-01';

    if (this.currentBackgroundKey === textureKey || !this.textures.exists(textureKey)) {
      return;
    }

    this.background.setTexture(textureKey);
    this.backgroundScale = this.scale.height / this.background.height;
    this.background.setScale(this.backgroundScale);
    this.currentBackgroundKey = textureKey;
    this.worldWidth = Math.max(this.scale.width, this.background.displayWidth);
    this.physics.world.setBounds(0, 0, this.worldWidth, this.scale.height);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.scale.height);
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
        this.updateAreaBackground(area);
        this.romy.setPosition(targetX, this.getRomyY());
        const cat = this.interactables?.find((interactable) => interactable.id === 'cat');
        if (cat?.container && this.catIntroStarted) {
          cat.container.setPosition(Math.max(0, targetX - CAT_FOLLOW_DISTANCE), this.getRomyY());
          cat.entranceComplete = true;
        }
        this.cameras.main.scrollY = 0;
        this.cameras.main.scrollX = area === 'madama' ? 0 : Phaser.Math.Clamp(targetX - this.scale.width / 2, 0, Math.max(0, this.worldWidth - this.scale.width));
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
