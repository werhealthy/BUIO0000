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
const PLAYER_START_X = 260;
const CAT_FOLLOW_DISTANCE = 92;
const MUSIC_VOLUME = 0.42;
const MENU_MUSIC_VOLUME = 0.36;
const MUSIC_FADE_DURATION = 850;
const CUTSCENE_COVER_DEPTH = 4999;
const ROMY_INTRO_LYING_TEXTURE = 'romy-wake-01';
const SOUND_UNLOCKED_EVENT = Phaser.Sound?.Events?.UNLOCKED ?? 'unlocked';

const ROMY_IDLE_KEYS = ['romy-idle-01', 'romy-idle-02', 'romy-idle-03'];
const ROMY_WALK_KEYS = ['romy-walk-01', 'romy-walk-02', 'romy-walk-03', 'romy-walk-04'];
const ROMY_DAISY_IDLE_KEYS = ['romy-daisy-idle-01', 'romy-daisy-idle-02', 'romy-daisy-idle-03'];
const ROMY_DAISY_WALK_KEYS = ['romy-daisy-walk-01', 'romy-daisy-walk-02', 'romy-daisy-walk-03', 'romy-daisy-walk-04'];

const AREA_SPAWN_X = {
  forest: PLAYER_START_X,
  madama: 160,
  sposine: 160,
  cavallo: 160,
  finale: 160,
  pittore: 160
};

const AREA_INTRO_FLAGS = {
  madama: 'madamaIntroCutscenePlayed',
  sposine: 'sposineIntroCutscenePlayed',
  cavallo: 'cavalloIntroCutscenePlayed'
};

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

const MUSIC_TRACKS = {
  menu: { key: 'music-title-screen', file: 'title_screen.mp3', volume: MENU_MUSIC_VOLUME },
  forest: { key: 'music-forest', file: 'bosco_scena_iniziale.mp3', volume: MUSIC_VOLUME },
  madama: { key: 'music-madama', file: 'bosco_scena_madame.mp3', volume: MUSIC_VOLUME },
  sposine: { key: 'music-sposine', file: 'bosco_scena_matrimonio.mp3', volume: MUSIC_VOLUME },
  cavallo: { key: 'music-cavallo', file: 'bosco_scena_museo.mp3', volume: MUSIC_VOLUME },
  finale: { key: 'music-finale', file: 'bosco_scena_finale.mp3', volume: MUSIC_VOLUME },
  grecia: { key: 'music-grecia', file: 'scena_grecia.mp3', volume: MUSIC_VOLUME },
  sicilia: { key: 'music-sicilia', file: 'scena_sicilia.mp3', volume: MUSIC_VOLUME },
  bristol: { key: 'music-bristol', file: 'scena_bristol.mp3', volume: MUSIC_VOLUME }
};

const AREA_TO_MUSIC_TRACK = {
  forest: 'forest',
  madama: 'madama',
  sposine: 'sposine',
  cavallo: 'cavallo',
  pittore: 'cavallo',
  finale: 'finale'
};

const FINAL_BACKGROUND_TO_MUSIC_TRACK = {
  'background-grecia': 'grecia',
  'background-sicilia': 'sicilia',
  'background-bristol': 'bristol'
};

const MUSIC_STATE = {
  currentKey: null,
  currentSound: null,
  pendingTrackId: null,
  warnedMissingTracks: new Set()
};

const getPublicAssetPath = (relativePath) => {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${relativePath.replace(/^\//, '')}`;
};

const getMusicAssetPath = (fileName) => getPublicAssetPath(`assets/audio/${fileName}`);

const preloadMusicTracks = (scene) => {
  Object.values(MUSIC_TRACKS).forEach((track) => {
    if (!track?.key || !track?.file || scene.cache.audio.exists(track.key)) {
      return;
    }

    scene.load.audio(track.key, getMusicAssetPath(track.file));
  });
};

const unlockSceneAudio = (scene) => {
  if (!scene?.sound) {
    return;
  }

  try {
    scene.sound.unlock?.();
    const context = scene.sound.context;
    if (context?.state === 'suspended') {
      context.resume?.();
    }
  } catch (error) {
    console.warn('[Music] Could not unlock audio context', error);
  }
};

const warnMissingMusicTrack = (trackId, track) => {
  const warningKey = track?.key ?? trackId;
  if (MUSIC_STATE.warnedMissingTracks.has(warningKey)) {
    return;
  }

  MUSIC_STATE.warnedMissingTracks.add(warningKey);
  console.warn(`[Music] Missing audio asset for track: ${trackId} / file: ${track?.file ?? 'unknown'}`);
};

const fadeOutAndDestroyCurrentMusic = (scene, fadeDuration = MUSIC_FADE_DURATION) => {
  const previousSound = MUSIC_STATE.currentSound;
  if (!previousSound) {
    return;
  }

  MUSIC_STATE.currentSound = null;
  MUSIC_STATE.currentKey = null;

  scene.tweens.add({
    targets: previousSound,
    volume: 0,
    duration: fadeDuration,
    ease: 'Sine.easeInOut',
    onComplete: () => {
      previousSound.stop();
      previousSound.destroy();
    }
  });
};

const playSceneMusic = (scene, trackId, options = {}) => {
  const track = MUSIC_TRACKS[trackId];
  if (!scene?.sound || !track) {
    return;
  }

  MUSIC_STATE.pendingTrackId = trackId;

  if (scene.sound.locked) {
    scene.sound.once(SOUND_UNLOCKED_EVENT, () => {
      if (MUSIC_STATE.pendingTrackId === trackId) {
        playSceneMusic(scene, trackId, options);
      }
    });
    return;
  }

  if (!scene.cache.audio.exists(track.key)) {
    warnMissingMusicTrack(trackId, track);
    return;
  }

  if (MUSIC_STATE.currentKey === track.key && MUSIC_STATE.currentSound?.isPlaying) {
    return;
  }

  const fadeDuration = options.fadeDuration ?? MUSIC_FADE_DURATION;
  const volume = options.volume ?? track.volume ?? MUSIC_VOLUME;
  fadeOutAndDestroyCurrentMusic(scene, fadeDuration);

  const nextSound = scene.sound.add(track.key, { loop: true, volume: 0 });
  MUSIC_STATE.currentSound = nextSound;
  MUSIC_STATE.currentKey = track.key;

  try {
    nextSound.play();
  } catch (error) {
    console.warn(`[Music] Could not play track: ${trackId}`, error);
    nextSound.destroy();
    if (MUSIC_STATE.currentSound === nextSound) {
      MUSIC_STATE.currentSound = null;
      MUSIC_STATE.currentKey = null;
    }
    return;
  }

  scene.tweens.add({
    targets: nextSound,
    volume,
    duration: fadeDuration,
    ease: 'Sine.easeInOut'
  });
};

const playMusicForArea = (scene, area, options = {}) => {
  const trackId = AREA_TO_MUSIC_TRACK[area] ?? AREA_TO_MUSIC_TRACK.forest;
  playSceneMusic(scene, trackId, options);
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

const originalMenuPreload = MenuScene.prototype.preload;
MenuScene.prototype.preload = function patchedMenuPreload(...args) {
  originalMenuPreload.apply(this, args);
  preloadMusicTracks(this);
};

const originalMenuCreate = MenuScene.prototype.create;
MenuScene.prototype.create = function patchedMenuCreate(...args) {
  originalMenuCreate.apply(this, args);
  playSceneMusic(this, 'menu', { fadeDuration: 1200, volume: MENU_MUSIC_VOLUME });
};

const originalMenuStartGame = MenuScene.prototype.startGame;
MenuScene.prototype.startGame = function patchedMenuStartGame(...args) {
  unlockSceneAudio(this);
  playSceneMusic(this, 'forest', { fadeDuration: 420 });
  return originalMenuStartGame.apply(this, args);
};

const originalForestPreload = ForestScene.prototype.preload;
ForestScene.prototype.preload = function patchedForestPreload(...args) {
  originalForestPreload.apply(this, args);
  preloadMusicTracks(this);
};

const originalForestCreate = ForestScene.prototype.create;
ForestScene.prototype.create = function patchedForestCreate(...args) {
  originalForestCreate.apply(this, args);
  unlockSceneAudio(this);
  playMusicForArea(this, GameState.currentArea ?? 'forest', { fadeDuration: 900 });
};

const makeFrameList = (keys) => keys.map((key) => ({ key }));
const existingKeys = (scene, keys) => keys.filter((key) => scene.textures.exists(key));
const ensureSpriteAnimation = (scene, key, textureKeys, frameRate) => {
  if (scene.anims.exists(key)) {
    return true;
  }

  const frames = existingKeys(scene, textureKeys);
  if (frames.length < 2) {
    return false;
  }

  scene.anims.create({
    key,
    frames: makeFrameList(frames),
    frameRate,
    repeat: -1
  });
  return true;
};

ForestScene.prototype.createRomy = function patchedCreateRomy() {
  // Create Romy directly on the lying wake frame. Do not call the original method:
  // the original creates her first on romy-wake-04, which can flash for one frame.
  this.romy = this.physics.add.sprite(PLAYER_START_X, this.getRomyY(), ROMY_INTRO_LYING_TEXTURE);
  this.romy.setName('Romy');
  this.romy.setDepth(20);
  this.romy.setOrigin(0.5, 1);
  this.setSpriteDisplayHeight(this.romy, ROMY_DISPLAY_HEIGHT);
  this.romy.setCollideWorldBounds(true);
  this.romy.anims.stop();
  this.romy.setTexture(ROMY_INTRO_LYING_TEXTURE);
  this.romy.setVisible(false);

  const bodyWidth = 48 / this.romy.scaleX;
  const bodyHeight = ROMY_DISPLAY_HEIGHT / this.romy.scaleY;
  this.romy.body.setSize(bodyWidth, bodyHeight);
  this.romy.body.setOffset((this.romy.width - bodyWidth) / 2, this.romy.height - bodyHeight);
  this.romyShadow = this.createContactShadow(this.romy, { width: 64, height: 14, alpha: 0.34, depth: 19 });

  ensureSpriteAnimation(this, 'romy-idle', ROMY_IDLE_KEYS, 3);
  ensureSpriteAnimation(this, 'romy-walk', ROMY_WALK_KEYS, 7);
  ensureSpriteAnimation(this, 'romy-daisy-idle', ROMY_DAISY_IDLE_KEYS, 3);
  ensureSpriteAnimation(this, 'romy-daisy-walk', ROMY_DAISY_WALK_KEYS, 7);
};

ForestScene.prototype.prepareRomyWakeIntroPose = function patchedPrepareRomyWakeIntroPose(makeVisible = false) {
  if (!this.romy) {
    return;
  }

  this.isWakingUp = true;
  this.romy.anims.stop();
  this.romy.setTexture(ROMY_INTRO_LYING_TEXTURE);
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

const originalStopRomy = ForestScene.prototype.stopRomy;
ForestScene.prototype.stopRomy = function patchedStopRomy(...args) {
  if (this.isWakingUp && this.romy) {
    const currentWakeTexture = this.romy.texture?.key?.startsWith('romy-wake-')
      ? this.romy.texture.key
      : ROMY_INTRO_LYING_TEXTURE;
    this.romy.y = this.getRomyY();
    this.romy.setVelocity(0, 0);
    this.romy.anims.stop();
    this.romy.setTexture(currentWakeTexture);
    this.setSpriteDisplayHeight(this.romy, ROMY_DISPLAY_HEIGHT);
    return;
  }

  return originalStopRomy.apply(this, args);
};

const createCutsceneCover = (scene) => {
  scene.cutsceneCover?.destroy?.();
  const cover = scene.add
    .rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 1)
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(CUTSCENE_COVER_DEPTH)
    .setVisible(true);
  scene.cutsceneCover = cover;
  return cover;
};

const destroyCutsceneCover = (scene) => {
  scene.cutsceneCover?.destroy?.();
  scene.cutsceneCover = null;
};

const originalPlayCutsceneVideo = ForestScene.prototype.playCutsceneVideo;
ForestScene.prototype.playCutsceneVideo = function patchedPlayCutsceneVideo(videoKey, onComplete, options = {}) {
  createCutsceneCover(this);
  return originalPlayCutsceneVideo.call(this, videoKey, () => {
    destroyCutsceneCover(this);
    onComplete?.();
  }, options);
};

const originalPlayAreaIntroCutscene = ForestScene.prototype.playAreaIntroCutscene;
ForestScene.prototype.transitionToArea = function patchedTransitionToArea(area) {
  const targetX = AREA_SPAWN_X[area];

  if (!targetX) {
    return;
  }

  playMusicForArea(this, area, { fadeDuration: 760 });
  this.isTransitioning = true;
  GameState.currentArea = area;

  if (area !== 'finale') {
    GameState.currentPath = area;
  }

  this.interactHint?.setVisible(false);
  this.stopRomy();
  this.BlackTransition?.setVisible(true).setAlpha(0);

  const revealGameplay = () => {
    this.tweens.add({
      targets: this.BlackTransition,
      alpha: 0,
      duration: 360,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.BlackTransition?.setVisible(false);
        this.isTransitioning = false;
      }
    });
  };

  this.tweens.add({
    targets: this.BlackTransition,
    alpha: 1,
    duration: 360,
    ease: 'Sine.easeInOut',
    onComplete: () => {
      this.updateAreaBackground(area);
      this.romy.setPosition(targetX, this.getRomyY());

      const cat = this.interactables?.find((interactable) => interactable.id === 'cat');
      if (cat?.container && this.catIntroStarted) {
        cat.container.setPosition(Math.max(0, targetX - CAT_FOLLOW_DISTANCE), this.getRomyY());
        cat.entranceComplete = true;
      }

      this.cameras.main.scrollY = 0;
      this.cameras.main.scrollX = 0;

      if (area === 'finale') {
        GameState.finalMeadowStarted = false;
        this.showFinalBackgroundPlaceholder(!this.textures.exists('background-margherite'));
        this.finalMeadowContainer?.setPosition(1460, this.groundY).setVisible(true);
        const finalDaisy = this.interactables?.find((interactable) => interactable.id === 'final_daisy');
        finalDaisy?.container?.setPosition(1900, this.groundY);
        finalDaisy?.sprite?.setVisible(false);
      } else {
        this.showFinalBackgroundPlaceholder(false);
        this.finalMeadowContainer?.setVisible(false);
      }

      this.updateNpcVisibility();

      const flagKey = AREA_INTRO_FLAGS[area];
      if (flagKey && !GameState[flagKey]) {
        originalPlayAreaIntroCutscene.call(this, area, revealGameplay);
        return;
      }

      revealGameplay();
    }
  });
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

const originalShowFinalEndingScene = ForestScene.prototype.showFinalEndingScene;
ForestScene.prototype.showFinalEndingScene = function patchedShowFinalEndingScene(...args) {
  const backgroundKey = this.getFinalEndingBackgroundKey?.();
  const trackId = FINAL_BACKGROUND_TO_MUSIC_TRACK[backgroundKey];
  if (trackId) {
    playSceneMusic(this, trackId, { fadeDuration: 1200 });
  }
  return originalShowFinalEndingScene.apply(this, args);
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
    'L’iconico coniglio nelle vesti del Coniglio Bianco',
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
