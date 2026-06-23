import { ForestScene } from '../scenes/ForestScene.js';
import { GameState } from './GameState.js';

const CREDITS_DEPTH = 1200;
const CREDITS_SCROLL_DURATION = 18500;

const getPathCredit = () => {
  if (GameState.currentPath === 'sposine') {
    return 'Arie e Chiara nelle vesti delle Sposine';
  }
  if (GameState.currentPath === 'madama') {
    return 'La nostra Madama nelle vesti della Madama';
  }
  if (GameState.currentPath === 'cavallo') {
    return 'Breeze nelle vesti del Cavallo Pittore';
  }
  return 'Il Bosco delle Mille Direzioni nelle vesti di sé stesso';
};

const addCreditText = (scene, container, y, text, style, originY = 0) => {
  const item = scene.add.text(0, y, text, style).setOrigin(0.5, originY).setPadding(0, 0, 0, 8);
  container.add(item);
  return item;
};

const buildCreditsLines = () => ([
  { kind: 'title', text: 'Il Bosco delle Mille Direzioni' },
  { kind: 'subtitle', text: 'Titoli di coda' },
  { kind: 'space', size: 36 },
  { kind: 'label', text: 'Un gioco creato da' },
  { kind: 'main', text: 'ChatGPT e Checco' },
  { kind: 'space', size: 42 },
  { kind: 'label', text: 'Con la partecipazione di' },
  { kind: 'name', text: 'Buio' },
  { kind: 'role', text: 'nelle vesti del gatto' },
  { kind: 'name', text: 'Princess Daisy' },
  { kind: 'role', text: 'nelle vesti della Margherita' },
  { kind: 'name', text: 'Vitto' },
  { kind: 'role', text: 'nelle vesti di Onofrio' },
  { kind: 'name', text: 'Gigi' },
  { kind: 'role', text: 'nelle vesti del Cappellaio Matto' },
  { kind: 'name', text: 'Checco' },
  { kind: 'role', text: 'nelle vesti di Checco' },
  { kind: 'name', text: 'L’iconico coniglio' },
  { kind: 'role', text: 'nelle vesti del Coniglio Bianco' },
  { kind: 'space', size: 28 },
  { kind: 'label', text: 'Finale speciale' },
  { kind: 'main', text: getPathCredit() },
  { kind: 'space', size: 48 },
  { kind: 'subtitle', text: 'Grazie per aver giocato' }
]);

const styleForKind = (kind, width) => {
  const base = {
    fontFamily: 'Georgia, Times New Roman, serif',
    align: 'center',
    wordWrap: { width: Math.round(width * 0.78), useAdvancedWrap: true }
  };

  if (kind === 'title') {
    return { ...base, fontSize: '36px', color: '#fff4c8', fontStyle: 'bold', stroke: '#2b1a11', strokeThickness: 5 };
  }
  if (kind === 'subtitle') {
    return { ...base, fontSize: '20px', color: '#d9fff0', fontStyle: 'bold' };
  }
  if (kind === 'label') {
    return { ...base, fontSize: '13px', color: '#9fd7c6', fontStyle: 'bold' };
  }
  if (kind === 'main') {
    return { ...base, fontSize: '24px', color: '#fffaf0', fontStyle: 'bold' };
  }
  if (kind === 'name') {
    return { ...base, fontSize: '21px', color: '#fff1a8', fontStyle: 'bold' };
  }
  return { ...base, fontSize: '14px', color: '#d9d1c2' };
};

const installFinalCreditsRollPatch = () => {
  ForestScene.prototype.showFinalCredits = function finalCreditsRoll() {
    this.finalWallpaperButton?.destroy?.();
    this.finalCreditsContainer?.destroy?.();
    this.dialogueManager?.endDialogue?.();

    const { width, height } = this.scale;
    const root = this.add.container(0, 0).setScrollFactor(0).setDepth(CREDITS_DEPTH).setAlpha(0);
    const black = this.add.rectangle(0, 0, width, height, 0x000000, 1).setOrigin(0, 0);
    const vignetteTop = this.add.rectangle(0, 0, width, 86, 0x000000, 0.62).setOrigin(0, 0);
    const vignetteBottom = this.add.rectangle(0, height - 104, width, 104, 0x000000, 0.72).setOrigin(0, 0);
    const scroll = this.add.container(width / 2, height + 72);

    let y = 0;
    buildCreditsLines().forEach((line) => {
      if (line.kind === 'space') {
        y += line.size;
        return;
      }
      const text = addCreditText(this, scroll, y, line.text, styleForKind(line.kind, width));
      y += text.height + (line.kind === 'role' ? 12 : 8);
    });

    root.add([black, scroll, vignetteTop, vignetteBottom]);
    this.finalCreditsContainer = root;

    this.tweens.add({ targets: root, alpha: 1, duration: 900, ease: 'Sine.easeInOut' });
    this.tweens.add({
      targets: scroll,
      y: -y - 72,
      duration: CREDITS_SCROLL_DURATION,
      ease: 'Linear',
      onComplete: () => {
        this.tweens.add({
          targets: root,
          alpha: 0,
          duration: 900,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            root.destroy();
            this.scene.start('MenuScene');
          }
        });
      }
    });
  };
};

setTimeout(installFinalCreditsRollPatch, 0);
setTimeout(installFinalCreditsRollPatch, 1600);
setTimeout(installFinalCreditsRollPatch, 4200);
