import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Background
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0d1b2a);

    // Decorative border
    const border = this.add.rectangle(cx, cy, GAME_WIDTH - 40, GAME_HEIGHT - 40);
    border.setStrokeStyle(2, 0x5bb8f5);

    // Title
    this.add.text(cx, cy - 160, 'WERKBOT', {
      fontSize: '72px',
      fontFamily: 'monospace',
      color: '#5bb8f5',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 80, 'ADVENTURES', {
      fontSize: '36px',
      fontFamily: 'monospace',
      color: '#ff8c00',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Werkbot placeholder sprite — large, centered
    const robot = this.add.image(cx, cy + 20, 'werkbot').setScale(4);

    // Subtle float animation
    this.tweens.add({
      targets: robot,
      y: cy + 10,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Start button
    const btn = this.add.text(cx, cy + 120, '▶  BEGIN ADVENTURE', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#1a3a5c',
      padding: { x: 20, y: 10 },
      stroke: '#5bb8f5',
      strokeThickness: 1,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ color: '#5bb8f5' }));
    btn.on('pointerout', () => btn.setStyle({ color: '#ffffff' }));
    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
        this.scene.launch('UIScene');
      });
    });

    // Tagline
    this.add.text(cx, GAME_HEIGHT - 30, 'Click to move  •  Click enemies to attack', {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#556677',
    }).setOrigin(0.5);
  }
}
