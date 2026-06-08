import Phaser from 'phaser';
import { DialogueManager } from '../systems/DialogueManager.js';
import { GameState } from '../systems/GameState.js';

const WORLD_WIDTH = 1800;
const GROUND_Y = 390;
const INTERACTION_DISTANCE = 72;
const AREA_START_X = 120;
const SCENARIO_NPC_X = 720;

const AREA_CONFIGS = {
  madama: {
    path: 'fragola',
    dialogue: 'madama_intro',
    transitionText: 'Segui la fragola incisa nel legno...',
    background: '#4c3718',
    ground: 0xc78b2d,
    horizon: 0xffd978,
    accent: 0xfff0a8,
    npcColor: 0xe6b347,
    npcName: 'Madama',
    title: 'Laboratorio luccicante di Madama'
  },
  sposine: {
    path: 'stella',
    dialogue: 'sposine_intro',
    transitionText: 'Segui la stella che pulsa piano...',
    background: '#4b2344',
    ground: 0xde75b7,
    horizon: 0xffb8dd,
    accent: 0xfff3fb,
    npcColor: 0xff8fcf,
    npcName: 'Sposine',
    title: 'Radura assurda delle Sposine'
  },
  pittore: {
    path: 'zampa',
    dialogue: 'pittore_intro',
    transitionText: 'Segui la zampa di gatto tra le radici...',
    background: '#132646',
    ground: 0x275b88,
    horizon: 0x73b8ff,
    accent: 0xc9e6ff,
    npcColor: 0x5f8fdc,
    npcName: 'Pittore',
    title: 'Sentiero musicale del Pittore'
  }
};

export class ForestScene extends Phaser.Scene {
  constructor() {
    super('ForestScene');
  }

  create() {
    this.inputLocked = false;
    this.forestObjects = [];
    this.areaObjects = [];

    this.cameras.main.setBackgroundColor('#23381f');
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, 480);

    this.createWorldPlaceholders();
    this.createPlayer();
    this.createNpcsAndTriggers();
    this.createScenarioNpc();
    this.createInput();
    this.createDebugText();

    this.dialogueManager = new DialogueManager(this);
    this.createTransitionOverlay();

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, 480);
  }

  update() {
    this.updateDebugText();
    this.playerLabel.setPosition(this.player.x - 22, this.player.y - 52);
    this.handleMovement();
    this.checkCrossroadTrigger();
    this.checkScenarioTrigger();
  }

  createWorldPlaceholders() {
    this.addForestObject(this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + 50, WORLD_WIDTH, 180, 0x2f5628));
    this.addForestObject(this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + 4, WORLD_WIDTH, 8, 0x8fd16a));

    for (let x = 80; x < WORLD_WIDTH; x += 170) {
      this.addForestObject(this.add.rectangle(x, GROUND_Y - 70, 22, 120, 0x4b2d18));
      this.addForestObject(this.add.circle(x, GROUND_Y - 130, 52, 0x335f2d));
    }

    this.addForestObject(this.add.text(32, 28, 'Il Bosco delle Mille Direzioni', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#f8ffd0'
    }));
  }

  createPlayer() {
    this.player = this.add.rectangle(120, GROUND_Y - 28, 32, 56, 0xf5d06f).setDepth(50);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(32, 56);

    this.playerLabel = this.add.text(this.player.x - 22, this.player.y - 52, 'Romy', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff'
    }).setDepth(51);
  }

  createNpcsAndTriggers() {
    this.daisy = this.addForestObject(this.add.circle(250, GROUND_Y - 16, 16, 0xffffff).setStrokeStyle(4, 0xffe45c));
    this.addForestObject(this.add.text(222, GROUND_Y - 58, 'Daisy', this.labelStyle()));

    this.onofrio = this.addForestObject(this.add.ellipse(620, GROUND_Y - 28, 54, 58, 0xa67ac9).setStrokeStyle(3, 0xf5e9ff));
    this.addForestObject(this.add.text(584, GROUND_Y - 78, 'Onofrio', this.labelStyle()));

    this.crossroadTrigger = this.add.zone(1040, GROUND_Y - 40, 110, 140);
    this.physics.add.existing(this.crossroadTrigger, true);

    this.hatter = this.addForestObject(this.add.rectangle(1250, GROUND_Y - 38, 44, 76, 0x5aa1ff).setStrokeStyle(3, 0xffef8a));
    this.addForestObject(this.add.rectangle(1250, GROUND_Y - 88, 74, 18, 0xff5a7a));
    this.addForestObject(this.add.text(1200, GROUND_Y - 132, 'Cappellaio', this.labelStyle()));
  }

  createScenarioNpc() {
    this.scenarioNpc = this.add.rectangle(SCENARIO_NPC_X, GROUND_Y - 40, 52, 80, 0xffffff)
      .setStrokeStyle(3, 0xffffff)
      .setDepth(45)
      .setVisible(false);
    this.scenarioNpcLabel = this.add.text(SCENARIO_NPC_X - 34, GROUND_Y - 100, '', this.labelStyle())
      .setDepth(46)
      .setVisible(false);
    this.scenarioTrigger = this.add.zone(SCENARIO_NPC_X, GROUND_Y - 40, 120, 150);
    this.physics.add.existing(this.scenarioTrigger, true);
  }

  createTransitionOverlay() {
    const { width, height } = this.scale;

    this.transitionFade = this.add.rectangle(width / 2, height / 2, width, height, 0x000000)
      .setScrollFactor(0)
      .setDepth(2000)
      .setAlpha(0)
      .setVisible(false);

    this.transitionText = this.add.text(width / 2, height / 2, '', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 96 }
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2001)
      .setAlpha(0)
      .setVisible(false);
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
      if (this.inputLocked) {
        return;
      }

      if (this.dialogueManager.isActive() && !this.dialogueManager.isChoosing()) {
        this.dialogueManager.nextLine();
      }
    });

    this.input.keyboard.on('keydown-E', () => {
      if (this.inputLocked) {
        return;
      }

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
    if (this.inputLocked || this.dialogueManager.isActive()) {
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
    if (GameState.currentArea !== 'forest') {
      return;
    }

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
      GameState.currentArea === 'forest' &&
      GameState.hasSpruzzino &&
      !GameState.crossroadStarted &&
      !this.dialogueManager.isActive() &&
      Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.crossroadTrigger.getBounds())
    ) {
      GameState.crossroadStarted = true;
      this.dialogueManager.startDialogue('crossroad_cappellaio');
    }
  }

  checkScenarioTrigger() {
    if (
      GameState.currentArea !== 'forest' &&
      !GameState.scenarioStarted &&
      !this.inputLocked &&
      !this.dialogueManager.isActive() &&
      Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.scenarioTrigger.getBounds())
    ) {
      GameState.scenarioStarted = true;
      this.dialogueManager.startDialogue(AREA_CONFIGS[GameState.currentArea].dialogue);
    }
  }

  transitionToArea(areaKey) {
    const config = AREA_CONFIGS[areaKey];

    if (!config || this.inputLocked) {
      return;
    }

    this.inputLocked = true;
    this.player.body.setVelocityX(0);
    this.dialogueManager.endDialogue();
    this.transitionFade.setVisible(true).setAlpha(0);
    this.transitionText.setText(config.transitionText).setVisible(true).setAlpha(0);

    this.tweens.add({
      targets: [this.transitionFade, this.transitionText],
      alpha: 1,
      duration: 600,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        GameState.currentArea = areaKey;
        GameState.currentPath = config.path;
        GameState.scenarioStarted = false;
        this.applyAreaPlaceholder(config);
        this.player.setPosition(AREA_START_X, GROUND_Y - 28);
        this.player.body.updateFromGameObject();
        this.cameras.main.setScroll(0, 0);

        this.time.delayedCall(650, () => {
          this.tweens.add({
            targets: [this.transitionFade, this.transitionText],
            alpha: 0,
            duration: 600,
            ease: 'Sine.easeInOut',
            onComplete: () => {
              this.transitionFade.setVisible(false);
              this.transitionText.setVisible(false);
              this.inputLocked = false;
            }
          });
        });
      }
    });
  }

  applyAreaPlaceholder(config) {
    this.cameras.main.setBackgroundColor(config.background);
    this.forestObjects.forEach((object) => object.setVisible(false));
    this.areaObjects.forEach((object) => object.destroy());
    this.areaObjects = [];

    this.addAreaObject(this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + 50, WORLD_WIDTH, 180, config.ground).setDepth(1));
    this.addAreaObject(this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + 4, WORLD_WIDTH, 8, config.horizon).setDepth(2));
    this.addAreaObject(this.add.text(32, 28, config.title, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff'
    }).setDepth(3));

    for (let x = 180; x < WORLD_WIDTH; x += 230) {
      this.addAreaObject(this.add.circle(x, GROUND_Y - 116, 28, config.accent, 0.78).setDepth(2));
      this.addAreaObject(this.add.rectangle(x + 48, GROUND_Y - 54, 76, 22, config.horizon, 0.62).setDepth(2));
    }

    this.scenarioNpc.setFillStyle(config.npcColor).setVisible(true);
    this.scenarioNpcLabel.setText(config.npcName).setVisible(true);
  }

  updateDebugText() {
    this.debugText.setText([
      `currentArea: ${GameState.currentArea}`,
      `currentPath: ${GameState.currentPath ?? 'null'}`,
      `scenarioStarted: ${GameState.scenarioStarted}`,
      `hasDaisy: ${GameState.hasDaisy}`,
      `hasSpruzzino: ${GameState.hasSpruzzino}`,
      `onofrioCompleted: ${GameState.onofrioCompleted}`,
      `crossroadStarted: ${GameState.crossroadStarted}`,
      `calore / ritmo / quiete: ${GameState.calore} / ${GameState.ritmo} / ${GameState.quiete}`
    ]);
  }

  isNear(target) {
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y) <= INTERACTION_DISTANCE;
  }

  addForestObject(object) {
    this.forestObjects.push(object);
    return object;
  }

  addAreaObject(object) {
    this.areaObjects.push(object);
    return object;
  }

  labelStyle() {
    return {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff'
    };
  }
}
