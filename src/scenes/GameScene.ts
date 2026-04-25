import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy, type EnemyType } from '../entities/Enemy';
import { Loot, type LootType } from '../entities/Loot';
import { UIScene } from './UIScene';
import {
  TILE_SIZE,
  PLAYER_ATTACK_DAMAGE, LOOT_DROP_CHANCE,
} from '../config/constants';

const MAP_COLS = 30;
const MAP_ROWS = 20;
const WALL_THICKNESS = 2; // tiles

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private loot: Loot[] = [];
  private inventory: string[] = [];
  private clickMarker!: Phaser.GameObjects.Arc;
  private attackTarget: Enemy | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.buildDungeonRoom();

    const spawnX = TILE_SIZE * (MAP_COLS / 2);
    const spawnY = TILE_SIZE * (MAP_ROWS / 2);

    this.player = new Player(this, spawnX, spawnY);

    this.spawnEnemies();

    this.cameras.main.setBounds(0, 0, TILE_SIZE * MAP_COLS, TILE_SIZE * MAP_ROWS);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.fadeIn(400);

    // Click marker
    this.clickMarker = this.add.circle(0, 0, 5, 0x5bb8f5, 0.7).setDepth(9999);

    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      const wx = ptr.worldX;
      const wy = ptr.worldY;

      // Check if clicking an enemy
      const clicked = this.enemies.find(e => Phaser.Math.Distance.Between(e.x, e.y, wx, wy) < 20);
      if (clicked) {
        this.attackTarget = clicked;
        this.player.moveTo(clicked.x, clicked.y);
      } else {
        this.attackTarget = null;
        this.player.moveTo(wx, wy);
        this.clickMarker.setPosition(wx, wy).setAlpha(1);
        this.tweens.add({
          targets: this.clickMarker,
          alpha: 0,
          duration: 400,
        });
      }
    });
  }

  update(_time: number, delta: number) {
    const time = this.time.now;
    this.player.update(delta);

    // Attack target tracking
    if (this.attackTarget && !this.attackTarget.isDead()) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.attackTarget.x, this.attackTarget.y,
      );
      if (dist < 40 && this.player.canAttack(time)) {
        this.player.recordAttack(time);
        this.attackEnemy(this.attackTarget);
      } else {
        this.player.moveTo(this.attackTarget.x, this.attackTarget.y);
      }
    }

    // Enemy updates
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const didAttack = enemy.update(this.player.x, this.player.y, delta, time);
      if (didAttack) {
        this.player.takeDamage(enemy.attackDamage);
        this.cameras.main.shake(120, 0.005);
        this.updateUI();
        if (this.player.hp <= 0) {
          this.scene.start('MenuScene');
          this.scene.stop('UIScene');
        }
      }
      if (enemy.isDead()) {
        this.dropLoot(enemy.x, enemy.y);
        enemy.destroy();
        this.enemies.splice(i, 1);
        if (this.attackTarget === enemy) this.attackTarget = null;
      }
    }

    // Loot pickup
    for (let i = this.loot.length - 1; i >= 0; i--) {
      const item = this.loot[i];
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
      if (dist < 24) {
        if (item.lootType === 'potion') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
          this.getUI()?.showMessage('+30 HP');
        } else {
          this.inventory.push('Sword');
          this.getUI()?.showMessage('Picked up Sword!');
        }
        this.getUI()?.updateInventory(this.inventory);
        item.destroy();
        this.loot.splice(i, 1);
        this.updateUI();
      }
    }
  }

  private attackEnemy(enemy: Enemy) {
    enemy.takeDamage(PLAYER_ATTACK_DAMAGE);
    this.cameras.main.shake(80, 0.003);

    // Flash red
    this.tweens.add({
      targets: enemy,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 1,
      onComplete: () => enemy.setAlpha(1),
    });
  }

  private dropLoot(x: number, y: number) {
    if (Math.random() > LOOT_DROP_CHANCE) return;
    const type: LootType = Math.random() < 0.4 ? 'sword' : 'potion';
    const item = new Loot(this, x, y, type);
    this.loot.push(item);
  }

  private spawnEnemies() {
    const positions = [
      { x: 3, y: 3 }, { x: 26, y: 3 }, { x: 3, y: 16 }, { x: 26, y: 16 },
      { x: 8, y: 8 }, { x: 21, y: 8 }, { x: 8, y: 11 }, { x: 21, y: 11 },
    ];
    positions.forEach(({ x, y }, i) => {
      const type: EnemyType = i % 3 === 0 ? 'slime' : 'skeleton';
      const enemy = new Enemy(this, x * TILE_SIZE + 16, y * TILE_SIZE + 16, type);
      this.enemies.push(enemy);
    });
  }

  private buildDungeonRoom() {
    const totalW = TILE_SIZE * MAP_COLS;
    const totalH = TILE_SIZE * MAP_ROWS;

    // Floor
    this.add.rectangle(totalW / 2, totalH / 2, totalW, totalH, 0x1a1a2e);

    // Draw tile grid
    const g = this.add.graphics();
    g.lineStyle(1, 0x222244, 0.4);
    for (let col = 0; col <= MAP_COLS; col++) {
      g.lineBetween(col * TILE_SIZE, 0, col * TILE_SIZE, totalH);
    }
    for (let row = 0; row <= MAP_ROWS; row++) {
      g.lineBetween(0, row * TILE_SIZE, totalW, row * TILE_SIZE);
    }

    // Walls (border)
    const wallColor = 0x3a2a5c;
    const wallLight = 0x5a4a8c;

    // Top wall
    this.add.rectangle(totalW / 2, TILE_SIZE, totalW, TILE_SIZE * WALL_THICKNESS, wallColor);
    // Bottom wall
    this.add.rectangle(totalW / 2, totalH - TILE_SIZE, totalW, TILE_SIZE * WALL_THICKNESS, wallColor);
    // Left wall
    this.add.rectangle(TILE_SIZE, totalH / 2, TILE_SIZE * WALL_THICKNESS, totalH, wallColor);
    // Right wall
    this.add.rectangle(totalW - TILE_SIZE, totalH / 2, TILE_SIZE * WALL_THICKNESS, totalH, wallColor);

    // Wall outlines
    const gw = this.add.graphics();
    gw.lineStyle(2, wallLight);
    gw.strokeRect(TILE_SIZE * WALL_THICKNESS, TILE_SIZE * WALL_THICKNESS,
      totalW - TILE_SIZE * WALL_THICKNESS * 2, totalH - TILE_SIZE * WALL_THICKNESS * 2);

    // Some interior pillars for cover
    const pillarPositions = [
      { x: 6, y: 5 }, { x: 23, y: 5 }, { x: 6, y: 14 }, { x: 23, y: 14 },
      { x: 14, y: 8 }, { x: 15, y: 8 }, { x: 14, y: 11 }, { x: 15, y: 11 },
    ];
    pillarPositions.forEach(({ x, y }) => {
      this.add.rectangle(
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE, TILE_SIZE, wallColor,
      ).setStrokeStyle(1, wallLight);
    });
  }

  private updateUI() {
    this.getUI()?.updateHP(this.player.hp, this.player.maxHp);
  }

  private getUI(): UIScene | null {
    return this.scene.get('UIScene') as UIScene | null;
  }
}
