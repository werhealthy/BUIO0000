import Phaser from 'phaser';
import { dialogues } from '../data/dialogues.js';
import { GameState } from './GameState.js';

const SCORE_KEYS = ['calore', 'ritmo', 'quiete'];

const PORTRAITS = {
  ROMY: { texture: 'romy-idle-01', height: 184, flipX: false },
  GATTO: { texture: 'cat-idle-01', height: 150, flipX: true },
  DAISY: { texture: 'daisy-idle-01', height: 142, flipX: false },
  FIORE: { texture: 'daisy-idle-01', height: 142, flipX: false },
  MARGHERITA: { texture: 'daisy-idle-01', height: 142, flipX: false },
  ONOFRIO: { texture: 'onofrio-idle-01', height: 236, flipX: false }
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
    this.choiceIndex = 0;
    this.choiceRows = [];
    this.systemMode = false;

    this.createUi();
    this.hideUi();
  }

  createUi() {
    const { width, height } = this.scene.scale;

    const boxWidth = Math.round(width * 0.86);
    const boxHeight = Math.round(height * 0.26);
    const boxBottomMargin = 18;
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
      textLeftWithPortrait: boxLeft + 172,
      textLeftNoPortrait: boxLeft + 28,
      textRightPadding: 32
    };

    this.boxShadow = this.scene.add.graphics().setScrollFactor(0).setDepth(999);
    this.box = this.scene.add.graphics().setScrollFactor(0).setDepth(1000);
    this.namePlate = this.scene.add.graphics().setScrollFactor(0).setDepth(1001);
    this.choiceGraphics = this.scene.add.graphics().setScrollFactor(0).setDepth(1007);

    this.drawDialogueFrame();

    this.portraitContainer = this.scene.add.container(boxLeft + 84, boxTop + boxHeight + 10).setScrollFactor(0).setDepth(1003);
    this.portraitGlow = this.scene.add.graphics();
    this.portraitSprite = this.scene.add.sprite(0, 0, 'romy-idle-01').setOrigin(0.5, 1);
    this.portraitContainer.add([this.portraitGlow, this.portraitSprite]);

    this.speakerText = this.scene.add
      .text(this.layout.textLeftWithPortrait, boxTop + 15, '', {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '17px',
        color: '#ffe9a8',
        fontStyle: 'bold',
        letterSpacing: 1
      })
      .setScrollFactor(0)
      .setDepth(1004);

    this.bodyText = this.scene.add
      .text(this.layout.textLeftWithPortrait, boxTop + 50, '', {
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: '17px',
        color: '#fffaf0',
        lineSpacing: 5,
        wordWrap: { width: boxWidth - 210 }
      })
      .setScrollFactor(0)
      .setDepth(1004);

    this.hintText = this.scene.add
      .text(boxLeft + boxWidth - 22, boxTop + boxHeight - 16, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
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
        fontSize: '18px',
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
  }

  drawDialogueFrame() {
    const { boxLeft, boxTop, boxWidth, boxHeight } = this.layout;

    this.boxShadow.clear();
    this.boxShadow.fillStyle(0x000000, 0.34);
    this.boxShadow.fillRoundedRect(boxLeft + 8, boxTop + 8, boxWidth, boxHeight, 18);

    this.box.clear();
    this.box.fillStyle(0x08131c, 0.84);
    this.box.fillRoundedRect(boxLeft, boxTop, boxWidth, boxHeight, 18);
    this.box.lineStyle(2, 0xf3df9b, 0.74);
    this.box.strokeRoundedRect(boxLeft, boxTop, boxWidth, boxHeight, 18);
    this.box.lineStyle(1, 0x9fd7c6, 0.28);
    this.box.strokeRoundedRect(boxLeft + 5, boxTop + 5, boxWidth - 10, boxHeight - 10, 14);
  }

  drawNamePlate(hasPortrait) {
    const textLeft = this.getTextLeft(hasPortrait);

    this.namePlate.clear();
    this.namePlate.fillStyle(0x2b1d32, 0.9);
    this.namePlate.fillRoundedRect(textLeft - 12, this.layout.boxTop + 9, 150, 28, 10);
    this.namePlate.lineStyle(1, 0xf3df9b, 0.56);
    this.namePlate.strokeRoundedRect(textLeft - 12, this.layout.boxTop + 9, 150, 28, 10);
  }

  startDialogue(dialogueKey) {
    const dialogue = dialogues[dialogueKey];

    if (!dialogue) {
      console.warn(`Dialogo non trovato: ${dialogueKey}`);
      return;
    }

    this.currentDialogue = dialogue;
    this.currentIndex = 0;
    this.active = true;
    this.showUi();
    this.showCurrentLine();
  }

  showCurrentLine() {
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

    if (this.systemMode) {
      this.showSystemLine();
      return;
    }

    this.hideSystemUi();
    this.showStandardUi();
    const hasPortrait = this.updatePortrait(speaker);
    const textLeft = this.getTextLeft(hasPortrait);
    const wrapWidth = this.layout.boxRight - textLeft - this.layout.textRightPadding;

    this.drawNamePlate(hasPortrait && speaker);
    this.speakerText.setPosition(textLeft, this.layout.boxTop + 14);
    this.speakerText.setText(speaker);
    this.bodyText.setPosition(textLeft, this.layout.boxTop + 50);
    this.bodyText.setWordWrapWidth(wrapWidth);
    this.bodyText.setText(this.currentLine.text ?? '');
    this.choosing = Array.isArray(this.currentLine.choices) && this.currentLine.choices.length > 0;
    this.choiceIndex = 0;

    if (this.choosing) {
      this.renderChoices();
      this.hintText.setText('↑ ↓ scegli   E conferma');
      return;
    }

    this.clearChoices();
    this.hintText.setText('SPACE continua');
  }

  showSystemLine() {
    this.hideStandardUi();
    this.portraitContainer.setVisible(false);
    this.systemGraphics.setVisible(true);
    this.systemText.setVisible(true);
    this.systemHintText.setVisible(true);

    const { width, height } = this.layout;
    const panelWidth = Math.round(width * 0.72);
    const panelHeight = this.currentLine.choices ? 84 : 74;
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
      this.systemHintText.setText('↑ ↓ scegli   E conferma');
      return;
    }

    this.clearChoices();
    this.systemHintText.setPosition(width / 2, y + panelHeight - 16);
    this.systemHintText.setText('SPACE continua');
  }

  getTextLeft(hasPortrait) {
    return hasPortrait ? this.layout.textLeftWithPortrait : this.layout.textLeftNoPortrait;
  }

  updatePortrait(speaker) {
    const portrait = PORTRAITS[normalizeSpeaker(speaker)];

    if (!portrait || !this.scene.textures.exists(portrait.texture)) {
      this.portraitContainer.setVisible(false);
      return false;
    }

    this.portraitSprite.setTexture(portrait.texture);
    this.portraitSprite.setFlipX(portrait.flipX);
    this.setPortraitHeight(portrait.height);

    this.portraitGlow.clear();
    this.portraitGlow.fillStyle(0xf5df9a, 0.14);
    this.portraitGlow.fillEllipse(0, -Math.round(portrait.height * 0.44), 118, Math.min(142, portrait.height));
    this.portraitGlow.lineStyle(1, 0xffffff, 0.18);
    this.portraitGlow.strokeEllipse(0, -Math.round(portrait.height * 0.44), 128, Math.min(152, portrait.height + 10));

    this.portraitContainer.setVisible(true);
    return true;
  }

  setPortraitHeight(targetHeight) {
    if (!this.portraitSprite || this.portraitSprite.height === 0) {
      return;
    }

    this.portraitSprite.setScale(targetHeight / this.portraitSprite.height);
  }

  nextLine() {
    if (!this.active || this.choosing) {
      return;
    }

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
    this.active = false;
    this.choosing = false;
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

  renderChoices() {
    this.clearChoices();

    const choices = this.currentLine.choices ?? [];
    const hasPortrait = this.portraitContainer.visible;
    const left = this.systemMode ? Math.round(this.layout.width * 0.17) : this.getTextLeft(hasPortrait);
    const rowWidth = this.systemMode
      ? Math.round(this.layout.width * 0.66)
      : this.layout.boxRight - left - this.layout.textRightPadding;
    const rowHeight = this.systemMode ? 30 : 24;
    const gap = this.systemMode ? 7 : 5;
    const totalHeight = choices.length * rowHeight + Math.max(0, choices.length - 1) * gap;
    const startY = this.systemMode
      ? Math.round(this.layout.height * 0.34)
      : Math.min(
          this.layout.boxTop + Math.round(this.layout.boxHeight * 0.52),
          this.layout.boxBottom - 20 - totalHeight
        );

    choices.forEach((choice, index) => {
      const selected = index === this.choiceIndex;
      const y = startY + index * (rowHeight + gap);

      this.choiceGraphics.fillStyle(selected ? 0xf3df9b : 0x152530, selected ? 0.28 : 0.58);
      this.choiceGraphics.fillRoundedRect(left, y, rowWidth, rowHeight, 9);
      this.choiceGraphics.lineStyle(1, selected ? 0xf3df9b : 0x6fae9d, selected ? 0.92 : 0.36);
      this.choiceGraphics.strokeRoundedRect(left, y, rowWidth, rowHeight, 9);

      const arrow = this.scene.add
        .text(left + 14, y + rowHeight / 2, selected ? '➤' : '•', {
          fontFamily: 'Arial, sans-serif',
          fontSize: selected ? '14px' : '11px',
          color: selected ? '#ffe9a8' : '#9fd7c6'
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(this.systemMode ? 1007 : 1004);

      const label = this.scene.add
        .text(left + 40, y + rowHeight / 2, choice.text, {
          fontFamily: 'Georgia, Times New Roman, serif',
          fontSize: '14px',
          color: selected ? '#fff7d6' : '#e7f2ee',
          wordWrap: { width: rowWidth - 54 }
        })
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(this.systemMode ? 1007 : 1004);

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
}
