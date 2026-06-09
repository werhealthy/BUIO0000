import Phaser from 'phaser';
import { dialogues } from '../data/dialogues.js';
import { GameState } from './GameState.js';

const SCORE_KEYS = ['calore', 'ritmo', 'quiete'];

export class DialogueManager {
  constructor(scene) {
    this.scene = scene;
    this.currentDialogue = [];
    this.currentIndex = 0;
    this.currentLine = null;
    this.active = false;
    this.choosing = false;
    this.choiceIndex = 0;

    this.createUi();
    this.hideUi();
  }

  createUi() {
    const { width, height } = this.scene.scale;

    this.box = this.scene.add
      .rectangle(width / 2, height - 92, width - 48, 160, 0x050505, 0.86)
      .setStrokeStyle(3, 0xffffff)
      .setScrollFactor(0)
      .setDepth(1000);

    this.speakerText = this.scene.add
      .text(48, height - 160, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffe680'
      })
      .setScrollFactor(0)
      .setDepth(1001);

    this.bodyText = this.scene.add
      .text(48, height - 128, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
        wordWrap: { width: width - 96 }
      })
      .setScrollFactor(0)
      .setDepth(1001);

    this.choicesText = this.scene.add
      .text(64, height - 80, '', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#d8ffd8',
        lineSpacing: 8,
        wordWrap: { width: width - 128 }
      })
      .setScrollFactor(0)
      .setDepth(1001);

    this.hintText = this.scene.add
      .text(width - 48, height - 36, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#a8a8a8'
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(1001);
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

    this.speakerText.setText(this.currentLine.speaker ?? '');
    this.bodyText.setText(this.currentLine.text ?? '');
    this.choosing = Array.isArray(this.currentLine.choices) && this.currentLine.choices.length > 0;
    this.choiceIndex = 0;

    if (this.choosing) {
      this.renderChoices();
      this.hintText.setText('↑ ↓ scegli — E conferma');
      return;
    }

    this.choicesText.setText('');
    this.hintText.setText('SPACE continua');
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
    const text = this.currentLine.choices
      .map((choice, index) => `${index === this.choiceIndex ? '> ' : '  '}${choice.text}`)
      .join('\n');

    this.choicesText.setText(text);
  }

  runAction(action) {
    if (!action) {
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
      }
    };

    actions[action]?.();
  }

  showUi() {
    this.box.setVisible(true);
    this.speakerText.setVisible(true);
    this.bodyText.setVisible(true);
    this.choicesText.setVisible(true);
    this.hintText.setVisible(true);
  }

  hideUi() {
    this.box.setVisible(false);
    this.speakerText.setVisible(false);
    this.bodyText.setVisible(false);
    this.choicesText.setVisible(false);
    this.hintText.setVisible(false);
  }
}
