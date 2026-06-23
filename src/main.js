import Phaser from 'phaser';
import './systems/gameHotfixes.js';
import { MenuScene } from './scenes/MenuScene.js';
import { ForestScene } from './scenes/ForestScene.js';
import './style.css';

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
