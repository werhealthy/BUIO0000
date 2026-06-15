import Phaser from 'phaser';
import { dialogues } from '../data/dialogues.js';
import { GameState } from './GameState.js';

const SCORE_KEYS = ['calore', 'ritmo', 'quiete'];

const DEBUG_UI = false;
// PORTRAIT FIXED FRAME: these constants keep the circle identical for every speaker.
const PORTRAIT_FRAME_X = 70;
const PORTRAIT_CENTER_Y_OFFSET = 70;
const PORTRAIT_FRAME_SIZE = 118;
const PORTRAIT_INNER_PADDING = 14;
const PORTRAIT_CONTENT_MAX_HEIGHT = PORTRAIT_FRAME_SIZE - PORTRAIT_INNER_PADDING * 2;

const PORTRAITS = {
  ROMY: { texture: 'romy-idle-01', daisyTexture: 'romy-daisy-idle-01', height: 146, maxWidth: 118, flipX: false },
  GATTO: { texture: 'cat-idle-01', height: 118, maxWidth: 118, flipX: true },
  DAISY: { texture: 'daisy-idle-01', height: 104, maxWidth: 92, flipX: false },
  FIORE: { texture: 'daisy-idle-01', height: 104, maxWidth: 92, flipX: false },
  MARGHERITA: { texture: 'daisy-idle-01', height: 104, maxWidth: 92, flipX: false },
  ONOFRIO: { texture: 'onofrio-idle-01', flipX: false },
  CAPPELLAIO: { texture: 'cappellaio-idle-01', colourTexture: 'cappellaio-idle-colour-01', flipX: false },
  MADAMA: { texture: 'madama-idle-01', flipX: false }
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

const normalizeSpeaker = (speaker = '') => speaker.trim().toUpperCase();

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
      textRightPadding: 26
    };

    this.boxShadow = this.scene.add.graphics().setScrollFactor(0).setDepth(999);
    this.box = this.scene.add.graphics().setScrollFactor(0).setDepth(1000);
    this.namePlate = this.scene.add.graphics().setScrollFactor(0).setDepth(1001);
    this.choiceGraphics = this.scene.add.graphics().setScrollFactor(0).setDepth(1007);

    this.drawDialogueFrame();

    this.portraitContainer = this.scene.add.container(boxLeft + PORTRAIT_FRAME_X, boxTop + PORTRAIT_CENTER_Y_OFFSET).setScrollFactor(0).setDepth(1003);
    this.portraitFrame = this.scene.add.graphics();
    this.portraitSprite = this.scene.add.sprite(0, 0, 'romy-idle-01').setOrigin(0.5, 0.5);
    this.portraitMaskShape = this.scene.add.graphics().setVisible(false);
    this.portraitMaskShape.fillStyle(0xffffff, 1);
    this.portraitMaskShape.fillCircle(boxLeft + PORTRAIT_FRAME_X, boxTop + PORTRAIT_CENTER_Y_OFFSET, PORTRAIT_FRAME_SIZE / 2 - PORTRAIT_INNER_PADDING / 2);
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
        wordWrap: { width: boxWidth - 172 }
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
        wordWrap: { width: Math.round(width * 0.68) }
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
        wordWrap: { width: Math.round(width * 0.62) }
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
    const radius = PORTRAIT_FRAME_SIZE / 2;
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

  startDialogue(dialogueKey) {
    const dialogue = dialogues[dialogueKey];

    if (!dialogue) {
      console.warn(`Dialogo non trovato: ${dialogueKey}`);
      return;
    }

    this.clearAutoAdvance();
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
    this.systemMode = normalizeSpeaker(speaker) === 'SISTEMA';
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
    const hasPortrait = this.updatePortrait(speaker);
    const textLeft = this.getTextLeft(hasPortrait);
    const wrapWidth = this.layout.boxRight - textLeft - this.layout.textRightPadding;

    this.drawNamePlate(hasPortrait && speaker);
    this.speakerText.setPosition(textLeft, this.layout.boxTop + 14);
    this.speakerText.setText(speaker);
    this.bodyText.setPosition(textLeft, this.layout.boxTop + 43);
    this.bodyText.setWordWrapWidth(wrapWidth);
    this.bodyText.setText(this.currentLine.text ?? '');
    this.choosing = Array.isArray(this.currentLine.choices) && this.currentLine.choices.length > 0;
    this.choiceIndex = 0;

    if (this.choosing) {
      this.renderChoices();
      this.hintText.setText('↑↓ scegli · E');
      return;
    }

    this.clearChoices();
    this.hintText.setText(this.currentLine.autoAdvance ? 'SPACE/E salta' : 'SPACE continua');
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
    const panelWidth = Math.round(width * 0.62);
    const panelHeight = this.currentLine.choices ? 94 : 70;
    const x = Math.round((width - panelWidth) / 2);
    const y = Math.round(height * 0.1);

    this.systemGraphics.clear();
    this.systemGraphics.fillStyle(0x061620, 0.76);
    this.systemGraphics.fillRoundedRect(x, y, panelWidth, panelHeight, 16);
    this.systemGraphics.lineStyle(1, 0x9fd7c6, 0.58);
    this.systemGraphics.strokeRoundedRect(x, y, panelWidth, panelHeight, 16);
    this.systemGraphics.lineStyle(1, 0xf3df9b, 0.24);
    this.systemGraphics.strokeRoundedRect(x + 5, y + 5, panelWidth - 10, panelHeight - 10, 12);

    this.systemText.setPosition(width / 2, y + 30);
    this.systemText.setText(this.currentLine.text ?? '');
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
    this.systemHintText.setText(this.currentLine.autoAdvance ? 'SPACE/E salta' : 'SPACE continua');
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
    const panelWidth = Math.round(width * 0.7);
    const panelX = Math.round((width - panelWidth) / 2);
    const panelY = Math.round(height * 0.12);
    const panelHeight = 128;
    const speakerLabel = normalizeSpeaker(speaker) === 'SISTEMA' ? 'CARTELLO' : speaker;

    this.choicePromptGraphics.setVisible(true);
    this.choicePromptSpeakerText.setVisible(Boolean(speakerLabel));
    this.choicePromptText.setVisible(true);
    this.choicePromptHintText.setVisible(true);
    this.choiceGraphics.setVisible(true);

    this.choicePromptGraphics.clear();
    this.choicePromptGraphics.fillStyle(0x000000, 0.28);
    this.choicePromptGraphics.fillRoundedRect(panelX + 6, panelY + 6, panelWidth, panelHeight, 16);
    this.choicePromptGraphics.fillStyle(0x061620, 0.86);
    this.choicePromptGraphics.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
    this.choicePromptGraphics.lineStyle(2, 0xf3df9b, 0.7);
    this.choicePromptGraphics.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 16);
    this.choicePromptGraphics.lineStyle(1, 0x9fd7c6, 0.32);
    this.choicePromptGraphics.strokeRoundedRect(panelX + 5, panelY + 5, panelWidth - 10, panelHeight - 10, 12);

    this.choicePromptSpeakerText.setPosition(width / 2, panelY + 22).setText(speakerLabel ?? '');
    this.choicePromptText.setPosition(width / 2, panelY + (speakerLabel ? 72 : 62));
    this.choicePromptText.setWordWrapWidth(panelWidth - 64);
    this.choicePromptText.setText(this.currentLine.text ?? '');

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

  updatePortrait(speaker) {
    const normalizedSpeaker = normalizeSpeaker(speaker);
    const portrait = PORTRAITS[normalizedSpeaker];
    let texture = portrait?.texture;

    if (normalizedSpeaker === 'ROMY' && GameState.hasDaisy && this.scene.textures.exists(portrait?.daisyTexture)) {
      texture = portrait.daisyTexture;
    }

    if (normalizedSpeaker === 'CAPPELLAIO' && GameState.hatterColored && this.scene.textures.exists(portrait?.colourTexture)) {
      texture = portrait.colourTexture;
    }

    if (!portrait || !this.scene.textures.exists(texture)) {
      this.portraitContainer.setVisible(false);
      return false;
    }

    this.portraitSprite.setTexture(texture);
    this.portraitSprite.setFlipX(portrait.flipX);
    this.setPortraitSize();
    this.portraitSprite.setPosition(0, 0);
    this.drawFixedPortraitFrame();

    this.portraitContainer.setVisible(true);
    return true;
  }

  setPortraitSize() {
    if (!this.portraitSprite || this.portraitSprite.height === 0 || this.portraitSprite.width === 0) {
      return;
    }

    const maxSize = PORTRAIT_CONTENT_MAX_HEIGHT;
    const scale = Math.min(maxSize / this.portraitSprite.height, maxSize / this.portraitSprite.width);
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

  nextLine() {
    if (!this.active || this.choosing) {
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
    return Math.round(this.layout.height * 0.42);
  }

  renderChoices() {
    this.clearChoices();

    const choices = this.currentLine.choices ?? [];
    const promptMode = this.choiceQuestionMode;
    const hasPortrait = this.portraitContainer.visible;
    const left = promptMode
      ? Math.round(this.layout.width * 0.18)
      : this.systemMode
        ? Math.round(this.layout.width * 0.17)
        : this.getTextLeft(hasPortrait);
    const rowWidth = promptMode
      ? Math.round(this.layout.width * 0.64)
      : this.systemMode
        ? Math.round(this.layout.width * 0.66)
        : this.layout.boxRight - left - this.layout.textRightPadding;
    const rowHeight = promptMode ? 46 : this.systemMode ? 34 : 26;
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

      this.choiceGraphics.fillStyle(selected ? 0xf3df9b : 0x152530, selected ? 0.28 : 0.58);
      this.choiceGraphics.fillRoundedRect(left, y, rowWidth, rowHeight, 9);
      this.choiceGraphics.lineStyle(1, selected ? 0xf3df9b : 0x6fae9d, selected ? 0.92 : 0.36);
      this.choiceGraphics.strokeRoundedRect(left, y, rowWidth, rowHeight, 9);

      const arrow = this.scene.add
        .text(left + 14, y + rowHeight / 2, selected ? '➤' : '', {
          fontFamily: 'Arial, sans-serif',
          fontSize: selected ? '14px' : '11px',
          color: selected ? '#ffe9a8' : '#9fd7c6'
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(this.choiceQuestionMode || this.systemMode ? 1008 : 1004);

      const label = this.scene.add
        .text(left + 40, y + rowHeight / 2, choice.text, {
          fontFamily: 'Georgia, Times New Roman, serif',
          fontSize: promptMode ? '15px' : '14px',
          color: selected ? '#fff7d6' : '#e7f2ee',
          wordWrap: { width: rowWidth - 54 }
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
      useSpruzzinoOnHatter: () => {
        GameState.hatterColored = true;
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
        GameState.currentPath = 'pittore';
      },
      transitionToPittoreArea: () => {
        this.scene.transitionToArea?.('pittore');
      },
      transitionToAreaMadama: () => {
        this.scene.transitionToArea?.('madama');
      },
      transitionToAreaSposine: () => {
        this.scene.transitionToArea?.('sposine');
      },
      transitionToAreaPittore: () => {
        this.scene.transitionToArea?.('pittore');
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
