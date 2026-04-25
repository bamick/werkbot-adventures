import Phaser from 'phaser';
import { PLAYER_MAX_HP, GAME_WIDTH } from '../config/constants';

export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;
  private inventoryText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const pad = 12;
    const barW = 200;
    const barH = 16;

    // HP bar background
    this.add.rectangle(pad + barW / 2, pad + barH / 2, barW, barH, 0x440000);

    // HP bar fill
    this.hpBar = this.add.rectangle(pad, pad, barW, barH, 0xcc2222).setOrigin(0, 0);

    // HP label
    this.add.text(pad, pad + barH + 4, 'HP', {
      fontSize: '11px', fontFamily: 'monospace', color: '#aaaaaa',
    });

    this.hpText = this.add.text(pad + barW, pad + barH + 4, `${PLAYER_MAX_HP} / ${PLAYER_MAX_HP}`, {
      fontSize: '11px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(1, 0);

    // Inventory panel (bottom left)
    this.add.rectangle(60, 620, 100, 30, 0x0d1b2a).setStrokeStyle(1, 0x5bb8f5);
    this.inventoryText = this.add.text(60, 620, 'Inventory: empty', {
      fontSize: '11px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5);

    // Center message (damage numbers, pickups, etc.)
    this.messageText = this.add.text(GAME_WIDTH / 2, 80, '', {
      fontSize: '18px', fontFamily: 'monospace', color: '#ffff00',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);
  }

  updateHP(current: number, max: number) {
    const ratio = Math.max(0, current / max);
    const barW = 200;
    this.hpBar.setSize(barW * ratio, 16);
    const color = ratio > 0.5 ? 0x22cc22 : ratio > 0.25 ? 0xcccc22 : 0xcc2222;
    this.hpBar.setFillStyle(color);
    this.hpText.setText(`${current} / ${max}`);
  }

  updateInventory(items: string[]) {
    this.inventoryText.setText(items.length ? items.join(', ') : 'Inventory: empty');
  }

  showMessage(text: string) {
    this.messageText.setText(text).setAlpha(1);
    this.tweens.killTweensOf(this.messageText);
    this.tweens.add({
      targets: this.messageText,
      alpha: 0,
      y: 60,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => { this.messageText.setY(80); },
    });
  }
}
