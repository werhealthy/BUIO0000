import { DialogueManager } from './DialogueManager.js';

const TYPING_SPEED = 18;
const PUNCTUATION_EXTRA_DELAY = 54;
const TYPING_TICK_INTERVAL = 2;

const getAudioContext = (scene) => {
  const context = scene?.sound?.context;
  if (!context || context.state !== 'running') {
    return null;
  }
  return context;
};

const playTypingTick = (scene, character, index) => {
  if (!character || /\s/.test(character) || index % TYPING_TICK_INTERVAL !== 0) {
    return;
  }

  const context = getAudioContext(scene);
  if (!context) {
    return;
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const baseFrequency = 520 + ((index % 7) * 26) + Math.random() * 18;

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(baseFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(baseFrequency * 1.14, now + 0.025);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.028, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.052);
  oscillator.addEventListener('ended', () => {
    oscillator.disconnect();
    gain.disconnect();
  });
};

const stopTyping = (manager) => {
  manager.__typingEvent?.remove?.(false);
  manager.__typingEvent = null;
  manager.__typingTarget = null;
  manager.__typingFullText = '';
  manager.__typingIndex = 0;
  manager.__isTypingText = false;
};

const completeTyping = (manager) => {
  if (!manager.__isTypingText || !manager.__typingTarget) {
    return false;
  }

  manager.__typingEvent?.remove?.(false);
  manager.__typingEvent = null;
  manager.__typingTarget.setText(manager.__typingFullText ?? '');
  manager.__isTypingText = false;

  if (!manager.choosing && manager.active) {
    manager.scheduleAutoAdvance?.();
  }

  return true;
};

const getDelayForCharacter = (character) => {
  if (/[.,;:!?…]/.test(character)) {
    return TYPING_SPEED + PUNCTUATION_EXTRA_DELAY;
  }
  return TYPING_SPEED;
};

const typeInto = (manager, target, fullText) => {
  if (!manager?.scene || !target || !target.setText) {
    return;
  }

  const text = String(fullText ?? '');
  stopTyping(manager);

  if (!text || manager.currentLine?.instantText) {
    target.setText(text);
    manager.scheduleAutoAdvance?.();
    return;
  }

  manager.clearAutoAdvance?.();
  manager.__typingTarget = target;
  manager.__typingFullText = text;
  manager.__typingIndex = 0;
  manager.__isTypingText = true;
  target.setText('');

  const revealNext = () => {
    if (!manager.__isTypingText || manager.__typingTarget !== target) {
      return;
    }

    manager.__typingIndex += 1;
    const nextText = text.slice(0, manager.__typingIndex);
    target.setText(nextText);
    playTypingTick(manager.scene, text[manager.__typingIndex - 1], manager.__typingIndex);

    if (manager.__typingIndex >= text.length) {
      manager.__isTypingText = false;
      manager.__typingEvent = null;
      if (!manager.choosing && manager.active) {
        manager.scheduleAutoAdvance?.();
      }
      return;
    }

    manager.__typingEvent = manager.scene.time.delayedCall(
      getDelayForCharacter(text[manager.__typingIndex - 1]),
      revealNext
    );
  };

  manager.__typingEvent = manager.scene.time.delayedCall(20, revealNext);
};

const installDialogueTypingPatch = () => {
  if (DialogueManager.prototype.__dialogueTypingPatchInstalled) {
    return;
  }
  DialogueManager.prototype.__dialogueTypingPatchInstalled = true;

  const sourceRenderStandardLine = DialogueManager.prototype.renderStandardLine;
  DialogueManager.prototype.renderStandardLine = function patchedTypingRenderStandardLine(speaker, ...args) {
    const result = sourceRenderStandardLine.call(this, speaker, ...args);
    typeInto(this, this.bodyText, this.interpolateText(this.currentLine?.text ?? ''));
    return result;
  };

  const sourceShowSystemLine = DialogueManager.prototype.showSystemLine;
  DialogueManager.prototype.showSystemLine = function patchedTypingShowSystemLine(...args) {
    const result = sourceShowSystemLine.apply(this, args);
    typeInto(this, this.systemText, this.interpolateText(this.currentLine?.text ?? ''));
    return result;
  };

  const sourceShowChoiceQuestionLine = DialogueManager.prototype.showChoiceQuestionLine;
  DialogueManager.prototype.showChoiceQuestionLine = function patchedTypingShowChoiceQuestionLine(...args) {
    const result = sourceShowChoiceQuestionLine.apply(this, args);
    typeInto(this, this.choicePromptText, this.interpolateText(this.currentLine?.text ?? ''));
    return result;
  };

  const sourceSkipOrNextLine = DialogueManager.prototype.skipOrNextLine;
  DialogueManager.prototype.skipOrNextLine = function patchedTypingSkipOrNextLine(...args) {
    if (completeTyping(this)) {
      return;
    }
    return sourceSkipOrNextLine.apply(this, args);
  };

  const sourceNextLine = DialogueManager.prototype.nextLine;
  DialogueManager.prototype.nextLine = function patchedTypingNextLine(...args) {
    if (completeTyping(this)) {
      return;
    }
    return sourceNextLine.apply(this, args);
  };

  const sourceSkipBlock = DialogueManager.prototype.skipCurrentDialogueBlock;
  DialogueManager.prototype.skipCurrentDialogueBlock = function patchedTypingSkipCurrentDialogueBlock(...args) {
    stopTyping(this);
    return sourceSkipBlock.apply(this, args);
  };

  const sourceEndDialogue = DialogueManager.prototype.endDialogue;
  DialogueManager.prototype.endDialogue = function patchedTypingEndDialogue(...args) {
    stopTyping(this);
    return sourceEndDialogue.apply(this, args);
  };
};

installDialogueTypingPatch();
