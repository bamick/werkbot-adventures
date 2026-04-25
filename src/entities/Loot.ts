import Phaser from 'phaser';
import { ASSETS } from '../config/assets';

export type LootType = 'sword' | 'potion';

export class Loot extends Phaser.GameObjects.Image {
  lootType: LootType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: LootType) {
    const key = type === 'sword' ? ASSETS.LOOT_SWORD : ASSETS.LOOT_POTION;
    super(scene, x, y, key);
    scene.add.existing(this);
    this.lootType = type;
    this.setDepth(y - 1);

    // Gentle bob animation
    scene.tweens.add({
      targets: this,
      y: y - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
