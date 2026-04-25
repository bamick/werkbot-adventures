import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0a0a0a',
  scene: [BootScene, MenuScene, GameScene, UIScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  pixelArt: true,
  roundPixels: true,
};

new Phaser.Game(config);
