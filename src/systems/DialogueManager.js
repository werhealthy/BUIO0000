import Phaser from 'phaser';
import { dialogues } from '../data/dialogues.js';
import { GameState } from './GameState.js';

const SCORE_KEYS = ['calore', 'ritmo', 'quiete'];

const DEBUG_UI = false;
const DEBUG_PORTRAITS = false;
// PORTRAIT FIXED FRAME: these constants keep the circle identical for every speaker.
const PORTRAIT_FRAME_RADIUS = 48;
const PORTRAIT_CENTER_X = 64;
const PORTRAIT_CENTER_Y = 56;
const PORTRAIT_INNER_PADDING = 10;
const PORTRAIT_CONTENT_MAX_WIDTH = PORTRAIT_FRAME_RADIUS * 2 - PORTRAIT_INNER_PADDING * 2;
const PORTRAIT_CONTENT_MAX_HEIGHT = PORTRAIT_FRAME_RADIUS * 2 - PORTRAIT_INNER_PADDING * 2;

const PORTRAITS = {
  romy: { texture: 'romy-idle-01', daisyTexture: 'romy-daisy-idle-01', flipX: false, offsetY: 0 },
  cat: { texture: 'cat-idle-01', flipX: true, offsetY: 0 },
  daisy: { texture: 'daisy-idle-01', flipX: false, offsetY: 0 },
  onofrio: { texture: 'onofrio-idle-01', fallbackTextures: ['onofrio-idle-02', 'onofrio-idle-03'], flipX: false, offsetY: 0 },
  cappellaio: { texture: 'cappellaio_idle_01', colourTexture: 'cappellaio_idle_colour_01', flipX: false, offsetY: 0 },
  madama: { texture: 'madama-idle-01', flipX: false, offsetY: 0 },
  spose: { texture: 'spose-idle-01', fallbackTextures: ['spose-idle-02', 'spose-idle-03', 'spose-idle-04'], flipX: false, offsetY: 0 },
  cavallo: { texture: 'cavallo-idle-01', fallbackTextures: ['cavallo-idle-02', 'cavallo-idle-03'], flipX: false, offsetY: 0 },
  cecco: { texture: 'cecco-idle-01', fallbackTextures: ['cecco-idle-02', 'cecco-idle-03', 'cecco-idle-04'], flipX: false, offsetY: 0 }
};

const SPEAKER_ALIASES = {
  romy: 'romy',
  protagonista: 'romy',
  gatto: 'cat',
  cat: 'cat',
  micio: 'cat',
  fiore: 'daisy',
  daisy: 'daisy',
  margherita: 'daisy',
  onofrio: 'onofrio',
  cappellaio: 'cappellaio',
  'cappellaio croccante': 'cappellaio',
  madama: 'madama',
  'madama caratura': 'madama',
  spose: 'spose',
  sposine: 'spose',
  'sposina uno': 'spose',
  'sposina due': 'spose',
  cavallo: 'cavallo',
  checco: 'cecco',
  cecco: 'cecco',
  sistema: null
};

const getAutoAdvanceDelay = (line = {}) => {
  if (!line.autoAdvance) {
    return null;
  }

  if (Number.isFinite(line.autoAdvanceDelay)) {
    return line.autoAdvanceDelay;
  }

  const textLength = (line.text ?? '').length;
  return Phaser.Math.Clamp(textLength < 95 ? 1600 : 2400, 1200, 2800);
};

const normalizeSpeaker = (speaker = '') => String(speaker).trim().toLowerCase();

const getPortraitKeyForSpeaker = (speaker = '') => {
  const normalizedSpeaker = normalizeSpeaker(speaker);
  const portraitKey = Object.prototype.hasOwnProperty.call(SPEAKER_ALIASES, normalizedSpeaker)
    ? SPEAKER_ALIASES[normalizedSpeaker]
    : null;
  const portrait = PORTRAITS[portraitKey];
  let textureKey = portrait?.texture ?? null;

  if (portraitKey === 'romy' && GameState.hasDaisy) {
    textureKey = portrait.daisyTexture ?? textureKey;
  }

  if (portraitKey === 'cappellaio' && GameState.hatterColored) {
    textureKey = portrait.colourTexture ?? textureKey;
  }

  if (DEBUG_PORTRAITS) {
    console.debug('[Portrait] lookup', { speaker, normalizedSpeaker, portraitKey, textureKey });
  }

  return textureKey;
};

const getPortraitConfigForSpeaker = (speaker = '') => {
  const normalizedSpeaker = normalizeSpeaker(speaker);
  const portraitKey = Object.prototype.hasOwnProperty.call(SPEAKER_ALIASES, normalizedSpeaker)
    ? SPEAKER_ALIASES[normalizedSpeaker]
    : null;

  return PORTRAITS[portraitKey] ?? null;
};

export class DialogueManager {
  constructor(scene) {
    this.scene = scene;
    this.currentDialogue = [];
    this.currentIndex = 0;
    this.currentLine = null;
    this.active = false;
    this.choosing = false;
    this.choiceQuestionMode = false;
    this.choiceIndex = 0;
    this.choiceRows = [];
    this.systemMode = false;
    this.autoAdvanceEvent = null;
    this.context = {};

    this.createUi();
    this.hideUi();
  }

  createUi() {
    const { width, height } = this.scene.scale;

    const boxWidth = Math.round(width * 0.81);
    const boxHeight = Math.round(height * 0.2);
    const boxBottomMargin = 24;
    const boxTop = height - boxBottomMargin - boxHeight;
    const boxLeft = Math.round((width - boxWidth) / 2);

    this.layout = {
      width,
      height,
      boxWidth,
      boxHeight,
      boxLeft,
      boxTop,
      boxRight: boxLeft + boxWidth,
      boxBottom: boxTop + boxHeight,
      textLeftWithPortrait: boxLeft + 154,
      textLeftNoPortrait: boxLeft + 24,
      textRightPadding: 30
    };

    this.boxShadow = this.scene.add.graphics().setScrollFactor(0).setDepth(999);
    this.box = this.scene.add.graphics().setScrollFactor(0).setDepth(1000);
    this.namePlate = this.scene.add.graphics().setScrollFactor(0).setDepth(1001);
    this.choiceGraphics = this.scene.add.graphics().setScrollFactor(0).setDepth(1007);

    this.drawDialogueFrame();

    this.portraitContainer = this.scene.add.container(boxLeft + PORTRAIT_CENTER_X, boxTop + PORTRAIT_CENTER_Y).setScrollFactor(0).setDepth(1003);
    this.portraitFrame = this.scene.add.graphics();
    this.portraitSprite = this.scene.add.sprite(0, 0, 'romy-idle-01').setOrigin(0.5, 0.5);
    this.portraitMaskShape = this.scene.add.graphics().setVisible(false);
    this.portraitMaskShape.fillStyle(0xffffff, 1);
    this.portraitMaskShape.fillCircle(boxLeft + PORTRAIT_CENTER_X, boxTop + PORTRAIT_CENTER_Y, PORTRAIT_FRAME_RADIUS - PORTRAIT_INNER_PADDING / 2);
    this.portraitMask = this.portraitMaskShape.createGeometryMask();
    this.portraitSprite.setMask(this.portraitMask);
    this.portraitContainer.add([this.portraitFrame, this.portraitSprite]);
    this.drawFixedPortraitFrame();

    this.speakerText = this.scene.add
      .text(this.layout.textLeftWithPortrait, boxTop + 15, '', {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '15px',
        color: '#ffe9a8',
        fontStyle: 'bold',
        letterSpacing: 1
      })
      .setScrollFactor(0)
      .setDepth(1004);

    this.bodyText = this.scene.add
      .text(this.layout.textLeftWithPortrait, boxTop + 43, '', {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '15px',
        color: '#fffaf0',
        lineSpacing: 4,
        wordWrap: { width: boxWidth - 190, useAdvancedWrap: true }
      })
      .setScrollFactor(0)
      .setDepth(1004);

    this.hintText = this.scene.add
      .text(boxLeft + boxWidth - 22, boxTop + boxHeight - 16, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: '#c8d4cf'
      })
      .setOrigin(1, 0.5)
      .setAlpha(0.72)
      .setScrollFactor(0)
      .setDepth(1004);

    this.systemGraphics = this.scene.add.graphics().setScrollFactor(0).setDepth(1005);
    this.systemText = this.scene.add
      .text(width / 2, Math.round(height * 0.19), '', {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '16px',
        color: '#f8efd6',
        align: 'center',
        lineSpacing: 5,
        wordWrap: { width: Math.round(width * 0.58), useAdvancedWrap: true }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1006);
    this.systemHintText = this.scene.add
      .text(width / 2, Math.round(height * 0.31), '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#c7d7d0'
      })
      .setOrigin(0.5)
      .setAlpha(0.76)
      .setScrollFactor(0)
      .setDepth(1006);

    this.choicePromptGraphics = this.scene.add.graphics().setScrollFactor(0).setDepth(1005);
    this.choicePromptSpeakerText = this.scene.add
      .text(width / 2, 0, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#ffe9a8',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1008);
    this.choicePromptText = this.scene.add
      .text(width / 2, 0, '', {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '17px',
        color: '#fffaf0',
        align: 'center',
        lineSpacing: 5,
        wordWrap: { width: Math.round(width * 0.56), useAdvancedWrap: true }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1008);
    this.debugChoiceText = this.scene.add
      .text(10, 10, '', { fontFamily: 'monospace', fontSize: '10px', color: '#00ff88' })
      .setScrollFactor(0)
      .setDepth(1100)
      .setVisible(DEBUG_UI);

    this.choicePromptHintText = this.scene.add
      .text(width / 2, 0, '↑↓ scegli · E conferma', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#c7d7d0'
      })
      .setOrigin(0.5)
      .setAlpha(0.82)
      .setScrollFactor(0)
      .setDepth(1008);

  }

  drawDialogueFrame() {
    const { boxLeft, boxTop, boxWidth, boxHeight } = this.layout;

    this.boxShadow.clear();
    this.boxShadow.fillStyle(0x000000, 0.34);
    this.boxShadow.fillRoundedRect(boxLeft + 7, boxTop + 7, boxWidth, boxHeight, 16);

    this.box.clear();
    this.box.fillStyle(0x08131c, 0.84);
    this.box.fillRoundedRect(boxLeft, boxTop, boxWidth, boxHeight, 16);
    this.box.lineStyle(2, 0xf3df9b, 0.74);
    this.box.strokeRoundedRect(boxLeft, boxTop, boxWidth, boxHeight, 16);
    this.box.lineStyle(1, 0x9fd7c6, 0.28);
    this.box.strokeRoundedRect(boxLeft + 5, boxTop + 5, boxWidth - 10, boxHeight - 10, 12);
  }

  drawFixedPortraitFrame() {
    // PORTRAIT FIXED FRAME: the frame is drawn once at fixed size; sprites scale inside it.
    const radius = PORTRAIT_FRAME_RADIUS;
    this.portraitFrame.clear();
    this.portraitFrame.fillStyle(0xf5df9a, 0.14);
    this.portraitFrame.fillCircle(0, 0, radius);
    this.portraitFrame.lineStyle(3, 0xf3df9b, 0.72);
    this.portraitFrame.strokeCircle(0, 0, radius);
    this.portraitFrame.lineStyle(1, 0xffffff, 0.22);
    this.portraitFrame.strokeCircle(0, 0, radius - 6);
  }

  drawNamePlate(hasPortrait) {
    const textLeft = this.getTextLeft(hasPortrait);

    this.namePlate.clear();
    this.namePlate.fillStyle(0x2b1d32, 0.9);
    this.namePlate.fillRoundedRect(textLeft - 10, this.layout.boxTop + 8, 132, 24, 9);
    this.namePlate.lineStyle(1, 0xf3df9b, 0.56);
    this.namePlate.strokeRoundedRect(textLeft - 10, this.layout.boxTop + 8, 132, 24, 9);
  }

  startDialogue(dialogueKey, context = {}) {
    const dialogue = dialogues[dialogueKey];

    if (!dialogue) {
      console.warn(`Dialogo non trovato: ${dialogueKey}`);
      return;
    }

    this.clearAutoAdvance();
    this.context = context;
    this.currentDialogue = dialogue;
    this.currentIndex = 0;
    this.active = true;
    this.showUi();
    this.showCurrentLine();
  }

  showCurrentLine() {
    this.clearAutoAdvance();
    this.currentLine = this.currentDialogue[this.currentIndex];

    if (!this.currentLine) {
      const nextDialogue = this.currentDialogue[this.currentIndex - 1]?.next;

      if (nextDialogue) {
        this.startDialogue(nextDialogue);
        return;
      }

      this.endDialogue();
      return;
    }

    this.runAction(this.currentLine.showAction);

    const speaker = this.currentLine.speaker ?? '';
    this.systemMode = normalizeSpeaker(speaker) === 'sistema';
    this.choiceQuestionMode = this.hasChoices(this.currentLine);

    if (this.choiceQuestionMode) {
      this.showChoiceQuestionLine(speaker);
      return;
    }

    if (this.systemMode) {
      this.showSystemLine();
      return;
    }

    this.hideSystemUi();
    this.hideChoicePromptUi();
    this.showStandardUi();
    const hasPortrait = this.updatePortraitForSpeaker(speaker);
    const textLeft = this.getTextLeft(hasPortrait);
    const wrapWidth = this.layout.boxRight - textLeft - this.layout.textRightPadding;

    this.drawNamePlate(hasPortrait && speaker);
    this.speakerText.setPosition(textLeft, this.layout.boxTop + 14);
    this.speakerText.setText(speaker);
    this.bodyText.setPosition(textLeft, this.layout.boxTop + 43);
    this.bodyText.setWordWrapWidth(wrapWidth);
    this.bodyText.setText(this.interpolateText(this.currentLine.text ?? ''));
    this.choosing = Array.isArray(this.currentLine.choices) && this.currentLine.choices.length > 0;
    this.choiceIndex = 0;

    if (this.choosing) {
      this.renderChoices();
      this.hintText.setText('↑↓ scegli · E');
      return;
    }

    this.clearChoices();
    this.hintText.setText('SPACE continua · TAB salta');
    this.scheduleAutoAdvance();
  }

  showSystemLine() {
    this.hideStandardUi();
    this.hideChoicePromptUi();
    this.portraitContainer.setVisible(false);
    this.systemGraphics.setVisible(true);
    this.systemText.setVisible(true);
    this.systemHintText.setVisible(true);

    const { width, height } = this.layout;
    const panelWidth = Math.round(width * 0.68);
    const text = this.interpolateText(this.currentLine.text ?? '');
    const estimatedLines = Math.max(1, Math.ceil(text.length / 42));
    const panelHeight = this.currentLine.choices
      ? Phaser.Math.Clamp(126 + estimatedLines * 12, 144, 198)
      : Phaser.Math.Clamp(82 + estimatedLines * 20, 104, 176);
    const x = Math.round((width - panelWidth) / 2);
    const y = Math.round(height * 0.1);

    this.systemGraphics.clear();
    this.systemGraphics.fillStyle(0x061620, 0.88);
    this.systemGraphics.fillRoundedRect(x, y, panelWidth, panelHeight, 16);
    this.systemGraphics.lineStyle(1, 0x9fd7c6, 0.58);
    this.systemGraphics.strokeRoundedRect(x, y, panelWidth, panelHeight, 16);
    this.systemGraphics.lineStyle(1, 0xf3df9b, 0.24);
    this.systemGraphics.strokeRoundedRect(x + 5, y + 5, panelWidth - 10, panelHeight - 10, 12);

    this.systemText.setFontSize(text.length > 105 ? '14px' : '15px');
    this.systemText.setWordWrapWidth(panelWidth - 72);
    this.systemText.setPosition(width / 2, y + (this.currentLine.choices ? 34 : panelHeight / 2 - 4));
    this.systemText.setText(text);
    this.choosing = Array.isArray(this.currentLine.choices) && this.currentLine.choices.length > 0;
    this.choiceIndex = 0;

    if (this.choosing) {
      this.choiceGraphics.setVisible(true);
      this.renderChoices();
      this.systemHintText.setPosition(width / 2, y + panelHeight - 16);
      this.systemHintText.setText('↑↓ scegli · E');
      return;
    }

    this.clearChoices();
    this.systemHintText.setPosition(width / 2, y + panelHeight - 16);
    this.systemHintText.setText('SPACE continua · TAB salta');
    this.scheduleAutoAdvance();
  }


  hasChoices(line) {
    return Array.isArray(line?.choices) && line.choices.length > 0;
  }

  showChoiceQuestionLine(speaker) {
    // CHOICE QUESTION MODE: standard dialogue UI/portrait is hidden; only question box + separate choice boxes render.
    this.hideStandardUi();
    this.hideSystemUi();
    this.hideChoicePromptUi();
    this.portraitContainer.setVisible(false);
    this.choiceQuestionMode = true;
    this.choosing = true;
    this.choiceIndex = 0;

    const { width, height } = this.layout;
    const questionText = this.interpolateText(this.currentLine.text ?? '');
    const questionLength = questionText.length;
    const maxPanelWidth = Math.round(width * 0.68);
    const minPanelWidth = Math.round(width * 0.36);
    const estimatedTextWidth = questionLength * 8.4 + 118;
    const panelWidth = Phaser.Math.Clamp(Math.round(estimatedTextWidth), minPanelWidth, maxPanelWidth);
    const panelX = Math.round((width - panelWidth) / 2);
    const panelY = Math.round(height * 0.08);
    const wrapWidth = panelWidth - 74;
    const estimatedLines = Math.max(1, Math.ceil(questionLength * 8.4 / wrapWidth));
    const panelHeight = Phaser.Math.Clamp(96 + estimatedLines * 25, 128, 230);
    const speakerLabel = normalizeSpeaker(speaker) === 'sistema' ? 'CARTELLO' : speaker;

    this.choicePromptGraphics.setVisible(true);
    this.choicePromptSpeakerText.setVisible(Boolean(speakerLabel));
    this.choicePromptText.setVisible(true);
    this.choicePromptHintText.setVisible(true);
    this.choiceGraphics.setVisible(true);

    this.choicePromptGraphics.clear();
    this.choicePromptGraphics.fillStyle(0x000000, 0.44);
    this.choicePromptGraphics.fillRoundedRect(panelX + 6, panelY + 6, panelWidth, panelHeight, 16);
    this.choicePromptGraphics.fillStyle(0x041018, 0.9);
    this.choicePromptGraphics.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
    this.choicePromptGraphics.lineStyle(2, 0xffedb0, 0.82);
    this.choicePromptGraphics.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
    this.choicePromptGraphics.lineStyle(1, 0x9fd7c6, 0.32);
    this.choicePromptGraphics.strokeRoundedRect(panelX + 5, panelY + 5, panelWidth - 10, panelHeight - 10, 12);

    this.choicePromptSpeakerText.setPosition(width / 2, panelY + 22).setText(speakerLabel ?? '');
    this.choicePromptText.setFontSize(questionLength > 120 ? '14px' : '15px');
    this.choicePromptText.setPosition(width / 2, panelY + (speakerLabel ? 66 : 54));
    this.choicePromptText.setWordWrapWidth(wrapWidth);
    this.choicePromptText.setText(questionText);

    this.renderChoices();
    const rowHeight = 46;
    const gap = 8;
    const totalChoiceHeight = this.currentLine.choices.length * rowHeight + Math.max(0, this.currentLine.choices.length - 1) * gap;
    const choicesBottom = this.getChoiceStartY() + totalChoiceHeight;
    this.choicePromptHintText.setPosition(Math.round(width * 0.82), choicesBottom + 24);
    this.choicePromptHintText.setText('↑↓ scegli · E conferma');
    this.debugChoiceText?.setText(DEBUG_UI ? 'CHOICE QUESTION MODE active' : '');
  }

  getTextLeft(hasPortrait) {
    return hasPortrait ? this.layout.textLeftWithPortrait : this.layout.textLeftNoPortrait;
  }

  updatePortraitForSpeaker(speaker) {
    const originalSpeaker = speaker;
    const normalizedSpeaker = String(speaker || '').trim().toLowerCase();
    const portrait = getPortraitConfigForSpeaker(normalizedSpeaker);
    let portraitKey = getPortraitKeyForSpeaker(normalizedSpeaker);

    if (portrait && (!portraitKey || !this.scene.textures.exists(portraitKey))) {
      portraitKey = portrait.fallbackTextures?.find((fallbackTexture) => this.scene.textures.exists(fallbackTexture)) ?? portraitKey;
    }

    const textureExists = Boolean(portraitKey && this.scene.textures.exists(portraitKey));

    if (!portrait || !textureExists) {
      this.portraitContainer.setVisible(false);
      this.portraitFrame.setVisible(false);
      this.portraitSprite.setVisible(false);
      if (DEBUG_PORTRAITS) {
        console.debug('[Portrait] hidden', {
          speaker: originalSpeaker,
          normalizedSpeaker,
          portraitKey,
          textureExists,
          containerVisible: this.portraitContainer.visible,
          imageVisible: this.portraitSprite.visible
        });
      }
      return false;
    }

    this.portraitContainer.setVisible(true).setDepth(1003);
    this.portraitFrame.setVisible(true);
    this.portraitSprite.setVisible(true);
    this.portraitSprite.setTexture(portraitKey);
    this.portraitSprite.setFlipX(portrait.flipX);
    this.resizePortraitInsideCircle();
    this.portraitSprite.setPosition(portrait.offsetX ?? 0, portrait.offsetY ?? 0);
    this.drawFixedPortraitFrame();

    if (DEBUG_PORTRAITS) {
      console.debug('[Portrait] shown', {
        speaker: originalSpeaker,
        normalizedSpeaker,
        portraitKey,
        textureExists,
        containerVisible: this.portraitContainer.visible,
        imageVisible: this.portraitSprite.visible
      });
    }
    return true;
  }

  resizePortraitInsideCircle() {
    return this.setPortraitSize();
  }

  setPortraitSize() {
    if (!this.portraitSprite || this.portraitSprite.height === 0 || this.portraitSprite.width === 0) {
      return;
    }

    const scale = Math.min(
      PORTRAIT_CONTENT_MAX_HEIGHT / this.portraitSprite.height,
      PORTRAIT_CONTENT_MAX_WIDTH / this.portraitSprite.width
    );
    this.portraitSprite.setScale(scale);
  }

  scheduleAutoAdvance() {
    const delay = getAutoAdvanceDelay(this.currentLine);

    if (!delay || this.choosing) {
      return;
    }

    this.autoAdvanceEvent = this.scene.time.delayedCall(delay, () => {
      this.autoAdvanceEvent = null;
      this.nextLine();
    });
  }

  clearAutoAdvance() {
    this.autoAdvanceEvent?.remove(false);
    this.autoAdvanceEvent = null;
  }

  interpolateText(text) {
    return String(text).replaceAll('[NOME CITTÀ]', this.context.cityName ?? 'Grecia');
  }

  skipOrNextLine() {
    if (this.choosing) {
      return;
    }

    this.nextLine();
  }

  skipCurrentDialogueBlock() {
    if (!this.active || this.choosing || this.scene.isCappellaioEntering) {
      return;
    }

    this.clearAutoAdvance();

    const nextChoiceIndex = this.currentDialogue.findIndex((line, index) => index > this.currentIndex && this.hasChoices(line));

    if (nextChoiceIndex !== -1) {
      for (let index = this.currentIndex; index < nextChoiceIndex; index += 1) {
        this.runAction(this.currentDialogue[index]?.action);
      }
      this.currentIndex = nextChoiceIndex;
      this.showCurrentLine();
      return;
    }

    for (let index = this.currentIndex; index < this.currentDialogue.length; index += 1) {
      this.runAction(this.currentDialogue[index]?.action);
      if (!this.active) {
        return;
      }
    }

    const nextDialogue = this.currentDialogue[this.currentDialogue.length - 1]?.next;
    if (nextDialogue) {
      this.startDialogue(nextDialogue);
      return;
    }

    this.endDialogue();
  }

  nextLine() {
    if (!this.active || this.choosing || this.scene.isCappellaioEntering) {
      return;
    }

    this.clearAutoAdvance();
    this.runAction(this.currentLine?.action);

    if (!this.active) {
      return;
    }

    this.currentIndex += 1;
    this.showCurrentLine();
  }

  handleChoiceInput(direction) {
    if (!this.active || !this.choosing) {
      return;
    }

    const choicesLength = this.currentLine.choices.length;
    this.choiceIndex = Phaser.Math.Wrap(this.choiceIndex + direction, 0, choicesLength);
    this.renderChoices();
  }

  confirmChoice() {
    if (!this.active || !this.choosing) {
      return;
    }

    const choice = this.currentLine.choices[this.choiceIndex];

    if (SCORE_KEYS.includes(choice.score)) {
      GameState[choice.score] += 1;
    }

    GameState.lastChoice = choice.text;
    this.runAction(choice.action);

    if (choice.next) {
      this.startDialogue(choice.next);
    } else {
      this.endDialogue();
    }
  }

  endDialogue() {
    this.clearAutoAdvance();
    this.active = false;
    this.choosing = false;
    this.choiceQuestionMode = false;
    this.currentDialogue = [];
    this.context = {};
    this.currentIndex = 0;
    this.currentLine = null;
    this.hideUi();
  }

  isActive() {
    return this.active;
  }

  isChoosing() {
    return this.choosing;
  }

  getChoiceStartY() {
    return Math.round(this.layout.height * 0.48);
  }

  renderChoices() {
    this.clearChoices();

    const choices = this.currentLine.choices ?? [];
    const promptMode = this.choiceQuestionMode;
    const hasPortrait = this.portraitContainer.visible;
    const left = promptMode
      ? Math.round(this.layout.width * 0.14)
      : this.systemMode
        ? Math.round(this.layout.width * 0.14)
        : this.getTextLeft(hasPortrait);
    const rowWidth = promptMode
      ? Math.round(this.layout.width * 0.72)
      : this.systemMode
        ? Math.round(this.layout.width * 0.72)
        : this.layout.boxRight - left - this.layout.textRightPadding;
    const rowHeight = promptMode ? 58 : this.systemMode ? 44 : 32;
    const gap = promptMode || this.systemMode ? 8 : 6;
    const totalHeight = choices.length * rowHeight + Math.max(0, choices.length - 1) * gap;
    const startY = promptMode
      ? this.getChoiceStartY()
      : this.systemMode
        ? Math.round(this.layout.height * 0.34)
        : Math.min(
            this.layout.boxTop + Math.round(this.layout.boxHeight * 0.56),
            this.layout.boxBottom - 18 - totalHeight
          );

    choices.forEach((choice, index) => {
      const selected = index === this.choiceIndex;
      const y = startY + index * (rowHeight + gap);

      this.choiceGraphics.fillStyle(selected ? 0x8a6418 : 0x01050a, selected ? 0.96 : 0.94);
      this.choiceGraphics.fillRoundedRect(left, y, rowWidth, rowHeight, 9);
      this.choiceGraphics.lineStyle(selected ? 4 : 1, selected ? 0xfff1a6 : 0x9fd7c6, selected ? 1 : 0.82);
      this.choiceGraphics.strokeRoundedRect(left, y, rowWidth, rowHeight, 9);

      const arrow = this.scene.add
        .text(left + 14, y + rowHeight / 2, selected ? '➤' : '', {
          fontFamily: 'Arial, sans-serif',
          fontSize: selected ? '16px' : '11px',
          color: selected ? '#ffe9a8' : '#9fd7c6'
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(this.choiceQuestionMode || this.systemMode ? 1008 : 1004);

      const label = this.scene.add
        .text(left + 40, y + rowHeight / 2, choice.text, {
          fontFamily: 'Georgia, Times New Roman, serif',
          fontSize: promptMode ? '12px' : '13px',
          color: selected ? '#fff7d6' : '#e7f2ee',
          wordWrap: { width: rowWidth - 66, useAdvancedWrap: true }
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(this.choiceQuestionMode || this.systemMode ? 1008 : 1004);

      this.choiceRows.push(arrow, label);
    });
  }

  clearChoices() {
    this.choiceGraphics.clear();
    this.choiceRows.forEach((row) => row.destroy());
    this.choiceRows = [];
  }

  runAction(action) {
    if (!action) {
      return;
    }

    if (Array.isArray(action)) {
      action.forEach((singleAction) => this.runAction(singleAction));
      return;
    }

    if (typeof action === 'string' && action.startsWith('set_romy_pose ')) {
      this.scene.setRomyPose?.(action.replace('set_romy_pose ', ''));
      return;
    }

    const actions = {
      giveSpruzzino: () => {
        GameState.hasSpruzzino = true;
        GameState.onofrioCompleted = true;
      },
      giveSpruzzinoToCappellaio: () => {
        GameState.hatterColored = true;
        this.scene.updateCappellaioAnimation?.();
      },
      useSpruzzinoOnHatter: () => {
        GameState.hatterColored = true;
        this.scene.updateCappellaioAnimation?.();
      },
      setPathMadama: () => {
        GameState.currentPath = 'madama';
      },
      transitionToMadamaArea: () => {
        this.scene.transitionToArea?.('madama');
      },
      setPathSposine: () => {
        GameState.currentPath = 'sposine';
      },
      transitionToSposineArea: () => {
        this.scene.transitionToArea?.('sposine');
      },
      setPathPittore: () => {
        GameState.currentPath = 'cavallo';
      },
      setPathCavallo: () => {
        GameState.currentPath = 'cavallo';
      },
      transitionToPittoreArea: () => {
        this.scene.transitionToArea?.('cavallo');
      },
      transitionToCavalloArea: () => {
        this.scene.transitionToArea?.('cavallo');
      },
      transitionToAreaMadama: () => {
        this.scene.transitionToArea?.('madama');
      },
      transitionToAreaSposine: () => {
        this.scene.transitionToArea?.('sposine');
      },
      transitionToAreaPittore: () => {
        this.scene.transitionToArea?.('cavallo');
      },
      transitionToAreaCavallo: () => {
        this.scene.transitionToArea?.('cavallo');
      },
      completeMadamaArea: () => {
        this.scene.completeMadamaArea?.();
      },
      completeSposineArea: () => {
        this.scene.completeSposineArea?.();
      },
      completeCavalloArea: () => {
        this.scene.completeCavalloArea?.();
      },
      startFinalRabbit: () => {
        this.scene.startFinalRabbit?.();
      },
      playRomySleepSequence: () => {
        this.scene.playRomySleepSequence?.();
      },
      finishFinalFade: () => {
        this.scene.finishFinalFade?.();
      },
      showFinalWallpaper: () => {
        this.scene.showFinalWallpaper?.();
      },
      revealForestIntro: () => {
        this.scene.revealForestIntro?.();
      },
      startCatEntrance: () => {
        this.scene.startCatEntrance?.();
      },
      revealDaisy: () => {
        this.scene.revealDaisy?.();
      },
      finishMainIntro: () => {
        this.scene.finishMainIntro?.();
      },
      setRomyPoseWake01: () => {
        this.scene.setRomyPose?.('wake_01');
      },
      setRomyPoseWake02: () => {
        this.scene.setRomyPose?.('wake_02');
      },
      setRomyPoseWake03: () => {
        this.scene.setRomyPose?.('wake_03');
      },
      setRomyPoseWake04: () => {
        this.scene.setRomyPose?.('wake_04');
      },
      setRomyPoseIdle: () => {
        this.scene.setRomyPose?.('idle');
      },
      startCappellaioEntrance: () => {
        this.scene.startCappellaioEntrance?.();
      }
    };

    actions[action]?.();
  }


  showUi() {
    this.showStandardUi();
    this.hideSystemUi();
  }

  hideUi() {
    this.hideStandardUi();
    this.hideSystemUi();
    this.hideChoicePromptUi();
    this.portraitContainer.setVisible(false);
    this.clearChoices();
  }

  showStandardUi() {
    this.boxShadow.setVisible(true);
    this.box.setVisible(true);
    this.namePlate.setVisible(true);
    this.speakerText.setVisible(true);
    this.bodyText.setVisible(true);
    this.choiceGraphics.setVisible(true);
    this.hintText.setVisible(true);
  }

  hideStandardUi() {
    this.boxShadow.setVisible(false);
    this.box.setVisible(false);
    this.namePlate.setVisible(false);
    this.speakerText.setVisible(false);
    this.bodyText.setVisible(false);
    this.choiceGraphics.setVisible(false);
    this.hintText.setVisible(false);
  }

  hideSystemUi() {
    this.systemGraphics.setVisible(false);
    this.systemText.setVisible(false);
    this.systemHintText.setVisible(false);
  }

  hideChoicePromptUi() {
    this.choicePromptGraphics.setVisible(false);
    this.choicePromptSpeakerText.setVisible(false);
    this.choicePromptText.setVisible(false);
    this.choicePromptHintText.setVisible(false);
    this.debugChoiceText?.setText(DEBUG_UI ? 'choice prompt hidden' : '');
  }
}
