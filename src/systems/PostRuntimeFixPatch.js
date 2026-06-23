import Phaser from 'phaser';
import { MenuScene } from '../scenes/MenuScene.js';
import { ForestScene } from '../scenes/ForestScene.js';
import { DialogueManager } from './DialogueManager.js';
import { GameState } from './GameState.js';

const BUTTON_WIDTH = 142;
const BUTTON_HEIGHT = 34;
const BUTTON_HIT_WIDTH = 232;
const BUTTON_HIT_HEIGHT = 86;
const TYPING_SPEED = 18;
const TYPING_TICK_EVERY = 2;
const WORLD_FX_REFRESH_DISTANCE = 80;
const WORLD_FX_REFRESH_COOLDOWN = 520;

const getRunningContext = (scene) => {
  const context = scene?.sound?.context;
  return context?.state === 'running' ? context : null;
};

const playTinyTypingTick = (scene, character, index = 0) => {
  if (!character || /\s/.test(character) || index % TYPING_TICK_EVERY !== 0) return;
  const context = getRunningContext(scene);
  if (!context) return;

  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  osc.type = 'square';
  osc.frequency.setValueAtTime(520 + (index % 6) * 34 + Math.random() * 16, now);
  osc.frequency.exponentialRampToValueAtTime(760 + (index % 4) * 40, now + 0.028);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1900, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.034, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  osc.start(now);
  osc.stop(now + 0.055);
  osc.addEventListener('ended', () => {
    osc.disconnect();
    filter.disconnect();
    gain.disconnect();
  });
};

const clearTypingState = (manager) => {
  manager.__postTypingEvent?.remove?.(false);
  manager.__postTypingEvent = null;
  manager.__postTypingTarget = null;
  manager.__postTypingFullText = '';
  manager.__postTypingIndex = 0;
  manager.__postTypingActive = false;

  // Also stop older experimental typing patches if they were already installed.
  manager.__typingEvent?.remove?.(false);
  manager.__typingEvent = null;
  manager.__isTypingText = false;
};

const completeTyping = (manager) => {
  if (!manager.__postTypingActive || !manager.__postTypingTarget) return false;
  manager.__postTypingEvent?.remove?.(false);
  manager.__postTypingEvent = null;
  manager.__postTypingTarget.setText(manager.__postTypingFullText ?? '');
  manager.__postTypingActive = false;
  if (!manager.choosing && manager.active) manager.scheduleAutoAdvance?.();
  return true;
};

const getTypingDelay = (character) => /[.,;:!?…]/.test(character) ? TYPING_SPEED + 48 : TYPING_SPEED;

const typeInto = (manager, target, fullText) => {
  if (!manager?.scene || !target?.setText) return;
  const text = String(fullText ?? '');
  clearTypingState(manager);
  manager.clearAutoAdvance?.();

  if (!text || manager.currentLine?.instantText) {
    target.setText(text);
    manager.scheduleAutoAdvance?.();
    return;
  }

  manager.__postTypingTarget = target;
  manager.__postTypingFullText = text;
  manager.__postTypingIndex = 0;
  manager.__postTypingActive = true;
  target.setText('');

  const revealNext = () => {
    if (!manager.__postTypingActive || manager.__postTypingTarget !== target) return;
    manager.__postTypingIndex += 1;
    const nextText = text.slice(0, manager.__postTypingIndex);
    const currentChar = text[manager.__postTypingIndex - 1];
    target.setText(nextText);
    playTinyTypingTick(manager.scene, currentChar, manager.__postTypingIndex);

    if (manager.__postTypingIndex >= text.length) {
      manager.__postTypingActive = false;
      manager.__postTypingEvent = null;
      if (!manager.choosing && manager.active) manager.scheduleAutoAdvance?.();
      return;
    }

    manager.__postTypingEvent = manager.scene.time.delayedCall(getTypingDelay(currentChar), revealNext);
  };

  manager.__postTypingEvent = manager.scene.time.delayedCall(18, revealNext);
};

const installDialogueTyping = () => {
  const proto = DialogueManager.prototype;
  if (proto.__postRuntimeTypingInstalled) return;
  proto.__postRuntimeTypingInstalled = true;

  const sourceRenderStandardLine = proto.renderStandardLine;
  proto.renderStandardLine = function postTypingRenderStandardLine(speaker, ...args) {
    const result = sourceRenderStandardLine.call(this, speaker, ...args);
    typeInto(this, this.bodyText, this.interpolateText(this.currentLine?.text ?? ''));
    return result;
  };

  const sourceShowSystemLine = proto.showSystemLine;
  proto.showSystemLine = function postTypingShowSystemLine(...args) {
    const result = sourceShowSystemLine.apply(this, args);
    typeInto(this, this.systemText, this.interpolateText(this.currentLine?.text ?? ''));
    return result;
  };

  const sourceShowChoiceQuestionLine = proto.showChoiceQuestionLine;
  proto.showChoiceQuestionLine = function postTypingShowChoiceQuestionLine(...args) {
    const result = sourceShowChoiceQuestionLine.apply(this, args);
    typeInto(this, this.choicePromptText, this.interpolateText(this.currentLine?.text ?? ''));
    return result;
  };

  const sourceSkipOrNextLine = proto.skipOrNextLine;
  proto.skipOrNextLine = function postTypingSkipOrNextLine(...args) {
    if (completeTyping(this)) return;
    return sourceSkipOrNextLine.apply(this, args);
  };

  const sourceNextLine = proto.nextLine;
  proto.nextLine = function postTypingNextLine(...args) {
    if (completeTyping(this)) return;
    return sourceNextLine.apply(this, args);
  };

  const sourceEndDialogue = proto.endDialogue;
  proto.endDialogue = function postTypingEndDialogue(...args) {
    clearTypingState(this);
    return sourceEndDialogue.apply(this, args);
  };

  const sourceSkipBlock = proto.skipCurrentDialogueBlock;
  proto.skipCurrentDialogueBlock = function postTypingSkipCurrentDialogueBlock(...args) {
    clearTypingState(this);
    return sourceSkipBlock.apply(this, args);
  };
};

const buildStableButton = (scene, x, y, label, onClick) => {
  const container = scene.add.container(x, y).setDepth(24);
  const aura = scene.add.ellipse(0, 0, BUTTON_WIDTH + 34, BUTTON_HEIGHT + 18, 0xbfd8c8, 0.026)
    .setOrigin(0.5)
    .setBlendMode(Phaser.BlendModes.ADD);
  const panel = scene.add.rectangle(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT, 0x0a1517, 0.74)
    .setStrokeStyle(1, 0x91aaa0, 0.44)
    .setOrigin(0.5);
  const topLine = scene.add.rectangle(0, -BUTTON_HEIGHT / 2 + 5, BUTTON_WIDTH - 18, 1, 0xc4cbb8, 0.24).setOrigin(0.5);
  const bottomLine = scene.add.rectangle(0, BUTTON_HEIGHT / 2 - 5, BUTTON_WIDTH - 18, 1, 0x54766f, 0.3).setOrigin(0.5);
  const text = scene.add.text(0, -1, label, {
    fontFamily: 'Georgia, Times New Roman, serif',
    fontSize: '19px',
    fontStyle: 'bold',
    color: '#d9ddd1',
    shadow: { offsetX: 1, offsetY: 1, color: '#041010', blur: 0, fill: true }
  }).setOrigin(0.5).setPadding(0, 0, 0, 5);

  const hitZone = scene.add.zone(0, 0, BUTTON_HIT_WIDTH, BUTTON_HIT_HEIGHT)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  container.add([aura, panel, topLine, bottomLine, text, hitZone]);
  container.hitZone = hitZone;
  container.__isHovering = false;

  const setHover = (value) => {
    if (container.__isHovering === value || scene.starting) return;
    container.__isHovering = value;
    scene.tweens.killTweensOf([aura, panel, topLine, bottomLine, text]);

    if (value) {
      scene.sound?.context?.state === 'running' && scene.__playSfxSafe?.('ui-hover');
      aura.setAlpha(0.105);
      panel.setFillStyle(0x122326, 0.82).setStrokeStyle(1, 0xd2d4be, 0.62);
      topLine.setFillStyle(0xf0ead9, 0.45);
      bottomLine.setFillStyle(0x8db7aa, 0.44);
      text.setColor('#f1eadb');
    } else {
      aura.setAlpha(0.026);
      panel.setFillStyle(0x0a1517, 0.74).setStrokeStyle(1, 0x91aaa0, 0.44);
      topLine.setFillStyle(0xc4cbb8, 0.24);
      bottomLine.setFillStyle(0x54766f, 0.3);
      text.setColor('#d9ddd1');
    }
  };

  hitZone.on('pointerover', () => setHover(true));
  hitZone.on('pointerout', () => setHover(false));
  hitZone.on('pointerdown', () => {
    if (scene.starting) return;
    hitZone.disableInteractive();
    scene.__playSfxSafe?.('start');
    scene.tweens.add({ targets: [aura, panel, topLine, bottomLine, text], alpha: 0.48, duration: 120, yoyo: true, ease: 'Sine.easeInOut' });
    onClick?.();
  });

  return container;
};

const patchMenuButton = () => {
  const proto = MenuScene.prototype;
  if (!proto.__postRuntimeButtonPatched) {
    proto.__postRuntimeButtonPatched = true;
    proto.createButton = function postRuntimeCreateButton(x, y, label, onClick) {
      return buildStableButton(this, x, y, label, onClick);
    };
  }

  for (const game of Phaser.GAMES ?? []) {
    const menu = game?.scene?.getScene?.('MenuScene');
    if (!menu?.scene?.isActive?.()) continue;
    if (!menu.__postRuntimeButtonRebuilt && menu.startButton) {
      menu.__postRuntimeButtonRebuilt = true;
      menu.startButton.destroy(true);
      const { width, height } = menu.scale;
      menu.__playSfxSafe = (type) => import('./SfxPatch.js').then(({ playSfx }) => playSfx(menu, type)).catch(() => {});
      menu.startButton = buildStableButton(menu, width / 2, height * 0.72, 'Inizia', () => menu.safeStartGame('button'));
    }
  }
};

const clearWorldFx = (scene) => {
  scene.ambientFxTweens?.forEach((tween) => tween?.stop?.());
  scene.ambientFxObjects?.forEach((object) => object?.destroy?.());
  scene.ambientFxTweens = [];
  scene.ambientFxObjects = [];
};

const getBounds = (scene) => {
  const camera = scene.cameras?.main;
  const width = scene.scale?.width ?? 960;
  const height = scene.scale?.height ?? 540;
  const scrollX = camera?.scrollX ?? 0;
  const scrollY = camera?.scrollY ?? 0;
  return { width, height, scrollX, scrollY, left: scrollX - 80, right: scrollX + width + 80, top: scrollY - 50, bottom: scrollY + height + 50 };
};

const addWorldDot = (scene, bounds, color, depth, alphaMin, alphaMax, radiusMin, radiusMax) => {
  const dot = scene.add.circle(
    Phaser.Math.Between(Math.round(bounds.left), Math.round(bounds.right)),
    Phaser.Math.Between(Math.round(bounds.top + 40), Math.round(bounds.bottom - 40)),
    Phaser.Math.FloatBetween(radiusMin, radiusMax),
    color,
    Phaser.Math.FloatBetween(alphaMin, alphaMax)
  )
    .setScrollFactor(1)
    .setDepth(depth)
    .setBlendMode(Phaser.BlendModes.ADD);

  scene.ambientFxObjects.push(dot);
  scene.ambientFxTweens.push(scene.tweens.add({
    targets: dot,
    x: dot.x + Phaser.Math.Between(-64, 64),
    y: dot.y + Phaser.Math.Between(-38, 38),
    alpha: { from: dot.alpha * 0.25, to: dot.alpha },
    scale: { from: 0.8, to: 1.55 },
    duration: Phaser.Math.Between(2200, 7200),
    delay: Phaser.Math.Between(0, 1600),
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  }));
};

const createWorldFx = (scene, area = GameState.currentArea ?? 'forest') => {
  if (!scene?.add || !scene?.cameras?.main) return;
  clearWorldFx(scene);
  scene.currentAmbientArea = area;
  scene.__postWorldFxArea = area;
  scene.__postWorldFxCameraX = scene.cameras.main.scrollX ?? 0;
  scene.__postWorldFxAt = scene.time?.now ?? performance.now();
  const bounds = getBounds(scene);

  const normalizedArea = area === 'pittore' ? 'cavallo' : area;
  const palette = {
    forest: [0xdaf7d7, 0xfff2a0],
    madama: [0xffd36b, 0xffe7a8],
    sposine: [0xffe0ef, 0xffffff],
    cavallo: [0xbde8ff, 0x7ee7ff],
    finale: [0xfff5b8, 0xffffff],
    grecia: [0xbfeaff, 0xffffff],
    sicilia: [0xffdf9f, 0xffffff],
    bristol: [0xcdd8ff, 0xffffff]
  }[normalizedArea] ?? [0xdaf7d7, 0xfff2a0];

  for (let index = 0; index < 42; index += 1) {
    addWorldDot(scene, bounds, palette[0], 8, 0.14, 0.38, 1.1, 3.2);
  }
  for (let index = 0; index < 20; index += 1) {
    addWorldDot(scene, bounds, palette[1], 23, 0.22, 0.72, 1.8, 4.8);
  }
};

const playForestBird = (scene) => {
  const context = getRunningContext(scene);
  if (!context) return;
  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.075, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);
  gain.connect(context.destination);
  [0, 0.1, 0.22].forEach((offset, index) => {
    const osc = context.createOscillator();
    osc.type = 'sine';
    const freq = 1150 + Math.random() * 620 + index * 130;
    osc.frequency.setValueAtTime(freq, now + offset);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.33, now + offset + 0.055);
    osc.connect(gain);
    osc.start(now + offset);
    osc.stop(now + offset + 0.16);
    osc.addEventListener('ended', () => osc.disconnect());
  });
  setTimeout(() => gain.disconnect(), 900);
};

const playForestRustle = (scene) => {
  const context = getRunningContext(scene);
  if (!context) return;
  const now = context.currentTime;
  const length = Math.floor(context.sampleRate * 0.72);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * Math.sin((index / length) * Math.PI) * 0.72;
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(650 + Math.random() * 900, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.075, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.64);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(now);
  source.stop(now + 0.72);
  source.addEventListener('ended', () => { source.disconnect(); filter.disconnect(); gain.disconnect(); });
};

const patchForestFxAndAmbience = () => {
  const proto = ForestScene.prototype;
  if (!proto.__postRuntimeFxPatched) {
    proto.__postRuntimeFxPatched = true;
    proto.clearAmbientFx = function postRuntimeClearAmbientFx() {
      clearWorldFx(this);
      this.currentAmbientArea = null;
    };
    proto.createAmbientFx = function postRuntimeCreateAmbientFx(area = GameState.currentArea ?? 'forest') {
      createWorldFx(this, area);
    };

    const sourceUpdate = proto.update;
    proto.update = function postRuntimeFxUpdate(...args) {
      const result = sourceUpdate?.apply(this, args);
      const now = this.time?.now ?? performance.now();
      const cameraX = this.cameras?.main?.scrollX ?? 0;
      const moved = Math.abs(cameraX - (this.__postWorldFxCameraX ?? cameraX));
      const cooled = now - (this.__postWorldFxAt ?? 0) > WORLD_FX_REFRESH_COOLDOWN;

      if (!this.ambientFxObjects?.length || (moved > WORLD_FX_REFRESH_DISTANCE && cooled)) {
        createWorldFx(this, GameState.currentArea ?? this.__postWorldFxArea ?? 'forest');
      }

      if (!this.blackIntroActive && !this.isTransitioning && !this.isCutscenePlaying && (GameState.currentArea ?? 'forest') === 'forest') {
        if (!this.__postNextBirdAt) this.__postNextBirdAt = now + 1200;
        if (!this.__postNextRustleAt) this.__postNextRustleAt = now + 1800;
        if (now >= this.__postNextBirdAt) {
          playForestBird(this);
          this.__postNextBirdAt = now + Phaser.Math.Between(2600, 5200);
        }
        if (now >= this.__postNextRustleAt) {
          playForestRustle(this);
          this.__postNextRustleAt = now + Phaser.Math.Between(3300, 6400);
        }
      }

      return result;
    };
  }

  for (const game of Phaser.GAMES ?? []) {
    const forest = game?.scene?.getScene?.('ForestScene');
    if (forest?.scene?.isActive?.()) {
      createWorldFx(forest, GameState.currentArea ?? 'forest');
    }
  }
};

const installPostRuntimeFixes = () => {
  installDialogueTyping();
  patchMenuButton();
  patchForestFxAndAmbience();
  console.debug?.('[BUIO] Post runtime fixes installed');
};

installPostRuntimeFixes();
setTimeout(installPostRuntimeFixes, 0);
setTimeout(installPostRuntimeFixes, 650);
setTimeout(installPostRuntimeFixes, 1600);
setTimeout(installPostRuntimeFixes, 3200);
