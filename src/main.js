import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene.js';
import { ForestScene } from './scenes/ForestScene.js';
import { DialogueManager, normalizeSpeakerName } from './systems/DialogueManager.js';
import { GameState } from './systems/GameState.js';
import { dialogues } from './data/dialogues.js';
import './style.css';

const PORTRAIT_FIT_WIDTH = 76;
const PORTRAIT_FIT_HEIGHT = 76;
const ROMY_DISPLAY_HEIGHT = 142;
const PLAYER_START_X = 130;

const SPEAKER_TO_EXISTING_TEXTURE = {
  romy: () => (GameState.hasDaisy ? 'romy-daisy-idle-01' : 'romy-idle-01'),
  cat: () => 'cat-idle-01',
  daisy: () => 'daisy-idle-01',
  onofrio: () => 'onofrio-idle-01',
  cappellaio: () => (GameState.hatterColored ? 'cappellaio_idle_colour_02' : 'cappellaio_idle_01'),
  madama: () => 'madama-idle-01',
  sposine: () => 'spose-idle-01',
  cavallo: () => 'cavallo-idle-01',
  cecco: () => 'cecco-idle-01'
};

const SPEAKER_ALIASES = {
  romy: 'romy',
  protagonista: 'romy',
  gatto: 'cat',
  micio: 'cat',
  cat: 'cat',
  fiore: 'daisy',
  daisy: 'daisy',
  margherita: 'daisy',
  onofrio: 'onofrio',
  cappellaio: 'cappellaio',
  'cappellaio matto': 'cappellaio',
  hatter: 'cappellaio',
  madama: 'madama',
  sposine: 'sposine',
  spose: 'sposine',
  cavallo: 'cavallo',
  pittore: 'cavallo',
  'cavallo pittore': 'cavallo',
  cecco: 'cecco',
  checco: 'cecco',
  sistema: null,
  system: null,
  narratore: null,
  narrator: null,
  cartello: null
};

const getSpeakerId = (speaker = '') => {
  const normalized = normalizeSpeakerName(speaker);
  return Object.prototype.hasOwnProperty.call(SPEAKER_ALIASES, normalized)
    ? SPEAKER_ALIASES[normalized]
    : null;
};

const hideDialoguePortrait = function hideDialoguePortrait() {
  this.portraitContainer?.setVisible(false);
  this.portraitFrame?.setVisible(false);
  this.portraitSprite
    ?.setVisible(false)
    .setAlpha(1)
    .setPosition(0, 0)
    .setScale(1)
    .setFlipX(false);
};

const fitPortraitInsideCircle = function fitPortraitInsideCircle() {
  if (!this.portraitSprite || !this.portraitSprite.width || !this.portraitSprite.height) {
    return;
  }

  this.portraitSprite.setScale(1);
  const scale = Math.min(
    PORTRAIT_FIT_WIDTH / this.portraitSprite.width,
    PORTRAIT_FIT_HEIGHT / this.portraitSprite.height
  );
  this.portraitSprite.setScale(Number.isFinite(scale) && scale > 0 ? scale : 1);
};

DialogueManager.prototype.hidePortrait = hideDialoguePortrait;
DialogueManager.prototype.resizePortraitInsideCircle = fitPortraitInsideCircle;
DialogueManager.prototype.setPortraitSize = fitPortraitInsideCircle;

DialogueManager.prototype.updatePortraitForSpeaker = function updatePortraitForSpeaker(speaker) {
  const speakerId = getSpeakerId(speaker);
  const getTextureKey = speakerId ? SPEAKER_TO_EXISTING_TEXTURE[speakerId] : null;
  const textureKey = getTextureKey?.();

  if (!speakerId || !textureKey || !this.scene.textures.exists(textureKey)) {
    this.hidePortrait();
    if (textureKey && !this.warnedMissingPortraits?.has(textureKey)) {
      this.warnedMissingPortraits?.add(textureKey);
      console.warn(`Missing portrait asset for speaker: ${speaker} / key: ${textureKey}`);
    }
    return false;
  }

  this.portraitContainer.setVisible(true).setDepth(1003).setScrollFactor(0);
  this.portraitFrame.setVisible(true);
  this.portraitSprite
    .setVisible(true)
    .setAlpha(1)
    .setTexture(textureKey)
    .setOrigin(0.5, 0.5)
    .setFlipX(speakerId === 'cat')
    .setPosition(0, 0)
    .setScrollFactor(0);
  this.resizePortraitInsideCircle();
  this.drawFixedPortraitFrame();
  return true;
};

const originalCreateUi = DialogueManager.prototype.createUi;
DialogueManager.prototype.createUi = function patchedCreateUi(...args) {
  originalCreateUi.apply(this, args);
  this.speakerText?.setPadding?.(0, 0, 0, 8);
  this.bodyText?.setPadding?.(0, 0, 0, 10);
  this.systemText?.setPadding?.(0, 0, 0, 10);
  this.choicePromptText?.setPadding?.(0, 0, 0, 10);
};

const originalRenderChoices = DialogueManager.prototype.renderChoices;
DialogueManager.prototype.renderChoices = function patchedRenderChoices(...args) {
  originalRenderChoices.apply(this, args);
  this.choiceRows?.forEach((row) => row?.setPadding?.(0, 0, 0, 8));
};

const removeDuplicateMovementHint = () => {
  const block = dialogues.daisy_picked;
  if (!Array.isArray(block)) {
    return;
  }

  const duplicateIndex = block.findIndex((line) => (
    normalizeSpeakerName(line?.speaker) === 'sistema'
    && /muover|frecce|wasd|raccogli|margherita/i.test(String(line?.text ?? ''))
  ));

  if (duplicateIndex !== -1) {
    block.splice(duplicateIndex, 1);
  }
};

removeDuplicateMovementHint();

const originalCreateRomy = ForestScene.prototype.createRomy;
ForestScene.prototype.createRomy = function patchedCreateRomy(...args) {
  originalCreateRomy.apply(this, args);
  this.romy?.anims?.stop();
  this.romy?.setTexture?.('romy-wake-01');
  if (this.romy) {
    this.romy.setVisible(false);
  }
};

ForestScene.prototype.prepareRomyWakeIntroPose = function patchedPrepareRomyWakeIntroPose(makeVisible = false) {
  if (!this.romy) {
    return;
  }

  this.isWakingUp = true;
  this.romy.anims.stop();
  this.romy.setTexture('romy-wake-01');
  this.setSpriteDisplayHeight(this.romy, ROMY_DISPLAY_HEIGHT);
  this.romy.setPosition(this.romy.x || PLAYER_START_X, this.getRomyY());
  this.romy.setVelocity(0, 0);
  this.romy.setVisible(Boolean(makeVisible));
};

ForestScene.prototype.setRomyPose = function patchedSetRomyPose(pose) {
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
};

ForestScene.prototype.playRomySleepSequence = function patchedPlayRomySleepSequence() {
  if (this.finalSleepSequenceStarted) {
    return;
  }

  this.finalSleepSequenceStarted = true;
  this.stopRomy();
  const sleepFrames = ['romy-wake-04', 'romy-wake-03', 'romy-wake-02', 'romy-wake-01'];
  this.romy.anims.stop();
  sleepFrames.forEach((texture, index) => {
    this.time.delayedCall(index * 420 + 80, () => {
      this.romy.setTexture(texture);
      this.setSpriteDisplayHeight(this.romy, ROMY_DISPLAY_HEIGHT);
    });
  });
  this.tweens.add({
    targets: this.romy,
    angle: -8,
    alpha: 0.72,
    duration: 2400,
    ease: 'Sine.easeInOut'
  });
};

const getPathCredit = () => {
  if (GameState.currentPath === 'sposine') {
    return 'Arie e Chiara nelle vesti delle Sposine';
  }
  if (GameState.currentPath === 'madama') {
    return 'La nostra Madama nelle vesti di Madama';
  }
  if (GameState.currentPath === 'cavallo') {
    return 'Breeze nelle vesti del Cavallo Pittore';
  }
  return 'Il bosco delle mille direzioni nelle vesti di sé stesso';
};

ForestScene.prototype.showFinalCredits = function showFinalCredits() {
  this.finalWallpaperButton?.destroy();
  this.finalCreditsContainer?.destroy();

  const { width, height } = this.scale;
  const container = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(990).setAlpha(0);
  const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.62);
  const title = this.add.text(0, -160, 'Titoli di coda', {
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: '32px',
    color: '#fff5cf',
    fontStyle: 'bold',
    align: 'center'
  }).setOrigin(0.5).setPadding(0, 0, 0, 8);
  const credits = this.add.text(0, -90, [
    'Gioco creato dai tuoi due amori',
    'ChatGPT e Checco',
    '',
    'Con la partecipazione di:',
    'Buio nelle vesti del gatto',
    'Princess Daisy nelle vesti della Margherita',
    'Vitto nelle vesti di Onofrio',
    'Gigi nelle vesti del Cappellaio Matto',
    'Checco nelle vesti di Checco',
    'L iconico coniglio nelle vesti del Coniglio Bianco',
    getPathCredit(),
    '',
    'Grazie per aver giocato.'
  ].join('\n'), {
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: '18px',
    color: '#fffaf0',
    align: 'center',
    lineSpacing: 8,
    wordWrap: { width: Math.round(width * 0.78), useAdvancedWrap: true }
  }).setOrigin(0.5, 0).setPadding(0, 0, 0, 10);
  container.add([overlay, title, credits]);
  this.finalCreditsContainer = container;

  this.tweens.add({ targets: container, alpha: 1, duration: 1000, ease: 'Sine.easeInOut' });
  this.time.delayedCall(9000, () => {
    this.tweens.add({
      targets: container,
      alpha: 0,
      duration: 1000,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        container.destroy();
        this.scene.start('MenuScene');
      }
    });
  });
};

const originalShowFinalWallpaper = ForestScene.prototype.showFinalWallpaper;
ForestScene.prototype.showFinalWallpaper = function patchedShowFinalWallpaper(...args) {
  const originalShowNewGameButton = this.showNewGameButton?.bind(this);
  this.showNewGameButton = () => {
    if (this.finalCreditsShown) {
      originalShowNewGameButton?.();
      return;
    }
    this.finalCreditsShown = true;
    this.showFinalCredits();
  };
  originalShowFinalWallpaper.apply(this, args);
};

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540,
    fullscreenTarget: 'game'
  },
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [MenuScene, ForestScene]
};

new Phaser.Game(config);
