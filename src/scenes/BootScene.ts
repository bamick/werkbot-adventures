import * as Phaser from 'phaser';
import { ASSETS } from '../config/assets';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.createPlaceholderTextures();

    // When real sprite sheets are added, load them here:
    // this.load.spritesheet(ASSETS.PLAYER, ASSETS.PLAYER_IMG, { frameWidth: 32, frameHeight: 32 });
    // this.load.tilemapTiledJSON(ASSETS.TILEMAP, ASSETS.TILEMAP_JSON);
    // this.load.image(ASSETS.TILESET, ASSETS.TILESET_IMG);

    this.load.on('progress', () => {
      // Progress bar would go here with real assets
    });
  }

  create() {
    this.scene.start('MenuScene');
  }

  // Draws colored rectangles as placeholder sprites until real art is added
  private createPlaceholderTextures() {
    this.makeTex(ASSETS.PLAYER, 32, 32, (g: Phaser.GameObjects.Graphics) => {
      // Werkbot body — light blue robot
      g.fillStyle(0x5bb8f5);
      g.fillRect(6, 8, 20, 18);
      // Head
      g.fillRect(8, 2, 16, 12);
      // Eyes — orange
      g.fillStyle(0xff8c00);
      g.fillRect(10, 5, 4, 4);
      g.fillRect(18, 5, 4, 4);
      // Antenna
      g.fillStyle(0xdddddd);
      g.fillRect(15, 0, 2, 4);
      // Legs
      g.fillStyle(0x4a9fd4);
      g.fillRect(8, 26, 6, 6);
      g.fillRect(18, 26, 6, 6);
      // Sword
      g.fillStyle(0xcccccc);
      g.fillRect(26, 4, 3, 16);
    });

    this.makeTex(ASSETS.ENEMY_SKELETON, 32, 32, (g: Phaser.GameObjects.Graphics) => {
      g.fillStyle(0xddddbb);
      g.fillRect(10, 4, 12, 10);
      g.fillRect(8, 14, 16, 12);
      g.fillStyle(0x000000);
      g.fillRect(12, 7, 3, 3);
      g.fillRect(18, 7, 3, 3);
      g.fillStyle(0xddddbb);
      g.fillRect(6, 26, 7, 6);
      g.fillRect(19, 26, 7, 6);
    });

    this.makeTex(ASSETS.ENEMY_SLIME, 32, 32, (g: Phaser.GameObjects.Graphics) => {
      g.fillStyle(0x44cc44);
      g.fillEllipse(16, 20, 28, 20);
      g.fillStyle(0x000000);
      g.fillCircle(10, 17, 3);
      g.fillCircle(22, 17, 3);
    });

    this.makeTex(ASSETS.LOOT_SWORD, 16, 16, (g: Phaser.GameObjects.Graphics) => {
      g.fillStyle(0xaaaaff);
      g.fillRect(7, 1, 2, 10);
      g.fillStyle(0xffcc00);
      g.fillRect(4, 9, 8, 2);
      g.fillStyle(0x885500);
      g.fillRect(7, 11, 2, 4);
    });

    this.makeTex(ASSETS.LOOT_POTION, 16, 16, (g: Phaser.GameObjects.Graphics) => {
      g.fillStyle(0xff4444);
      g.fillEllipse(8, 11, 10, 10);
      g.fillStyle(0xaaaaaa);
      g.fillRect(6, 3, 4, 5);
      g.fillStyle(0x888888);
      g.fillRect(5, 2, 6, 2);
    });
  }

  private makeTex(key: string, w: number, h: number, draw: (g: Phaser.GameObjects.Graphics) => void) {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
