import { ForestScene } from '../scenes/ForestScene.js';

const TYPING_DELAY = 22;
const TYPING_VOLUME = 0.035;

const getAudioContext = (scene) => {
  const context = scene?.sound?.context;
  if (!context || context.state !== 'running') {
    return null;
  }
  return context;
};

const playTypingTick = (scene, index = 0) => {
  const context = getAudioContext(scene);
  if (!context) {
    return;
  }

  try {
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(780 + ((index % 5) * 46), now);
    oscillator.frequency.exponentialRampToValueAtTime(420 + ((index % 3) * 30), now + 0.035);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(TYPING_VOLUME, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.055);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      filter.disconnect();
      gain.disconnect();
    });
  } catch (error) {
    console.warn('[InitialTextPolishPatch] Could not play typing tick.', error);
  }
};

const finishTypingLine = (scene) => {
  if (!scene?.__blackIntroFullText) {
    return false;
  }

  scene.__blackIntroTypingEvent?.remove(false);
  scene.__blackIntroTypingEvent = null;
  scene.__blackIntroTypingComplete = true;
  scene.blackIntroText?.setText(scene.__blackIntroFullText);
  return true;
};

export const installInitialTextPolishPatch = () => {
  if (ForestScene.prototype.__initialTextPolishPatchInstalled) {
    return;
  }
  ForestScene.prototype.__initialTextPolishPatchInstalled = true;

  const sourceCreateInput = ForestScene.prototype.createInput;
  ForestScene.prototype.createInput = function patchedCreateInput(...args) {
    const result = sourceCreateInput.apply(this, args);

    if (!this.__blackIntroPointerAdvanceInstalled) {
      this.__blackIntroPointerAdvanceInstalled = true;
      this.input.on('pointerdown', () => {
        if (this.blackIntroActive) {
          this.advanceBlackIntro();
        }
      });
    }

    return result;
  };

  const sourceStartBlackIntro = ForestScene.prototype.startBlackIntro;
  ForestScene.prototype.startBlackIntro = function patchedStartBlackIntro(...args) {
    const result = sourceStartBlackIntro.apply(this, args);
    this.blackIntroHint?.setText('clic / SPACE / E continua');
    return result;
  };

  ForestScene.prototype.showBlackIntroLine = function patchedShowBlackIntroLine() {
    const line = this.blackIntroLines?.[this.blackIntroIndex];

    if (!line) {
      this.finishBlackIntro();
      return;
    }

    const fullText = String(line.text ?? '');
    this.__blackIntroFullText = fullText;
    this.__blackIntroTypingComplete = false;
    this.__blackIntroTypingEvent?.remove(false);
    this.__blackIntroTypingEvent = null;

    this.blackIntroText?.setAlpha(1).setText('');
    this.blackIntroHint?.setText('clic / SPACE / E continua').setAlpha(0.72);

    if (!fullText.length) {
      this.__blackIntroTypingComplete = true;
      return;
    }

    let characterIndex = 0;
    const revealNextCharacter = () => {
      characterIndex += 1;
      this.blackIntroText?.setText(fullText.slice(0, characterIndex));

      const currentChar = fullText[characterIndex - 1] ?? '';
      if (currentChar.trim() && characterIndex % 2 === 0) {
        playTypingTick(this, characterIndex);
      }

      if (characterIndex >= fullText.length) {
        this.__blackIntroTypingComplete = true;
        this.__blackIntroTypingEvent?.remove(false);
        this.__blackIntroTypingEvent = null;
      }
    };

    revealNextCharacter();
    this.__blackIntroTypingEvent = this.time.addEvent({
      delay: TYPING_DELAY,
      loop: true,
      callback: revealNextCharacter
    });
  };

  const sourceAdvanceBlackIntro = ForestScene.prototype.advanceBlackIntro;
  ForestScene.prototype.advanceBlackIntro = function patchedAdvanceBlackIntro(...args) {
    if (this.blackIntroActive && !this.__blackIntroTypingComplete && finishTypingLine(this)) {
      return;
    }

    playTypingTick(this, 99);
    return sourceAdvanceBlackIntro.apply(this, args);
  };

  const sourceFinishBlackIntro = ForestScene.prototype.finishBlackIntro;
  ForestScene.prototype.finishBlackIntro = function patchedFinishBlackIntro(...args) {
    this.__blackIntroTypingEvent?.remove(false);
    this.__blackIntroTypingEvent = null;
    this.__blackIntroTypingComplete = true;
    this.__blackIntroFullText = '';
    return sourceFinishBlackIntro.apply(this, args);
  };
};

setTimeout(installInitialTextPolishPatch, 0);
