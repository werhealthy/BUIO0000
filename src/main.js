import Phaser from 'phaser';
import { ForestScene } from './scenes/ForestScene.js';
import './style.css';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 480,
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [ForestScene]
};

new Phaser.Game(config);
