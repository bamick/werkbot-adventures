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
const WALL_THICKNESS = 2;
const ATTACK_RANGE = 60;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private loot: Loot[] = [];
  private inventory: string[] = [];
  private keys!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };

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

    // WASD keys
    this.keys = {
      w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Mouse click = attack nearest enemy within range
    this.input.on('pointerdown', () => {
      const time = this.time.now;
      if (!this.player.canAttack(time)) return;

      // Find closest enemy within attack range of the player
      let closest: Enemy | null = null;
      let closestDist = ATTACK_RANGE;

      for (const enemy of this.enemies) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y, enemy.x, enemy.y,
        );
        if (dist < closestDist) {
          closestDist = dist;
          closest = enemy;
        }
      }

      if (closest) {
        this.player.recordAttack(time);
        this.attackEnemy(closest);
      } else {
        // Swing animation even on a miss
        this.player.recordAttack(time);
        this.cameras.main.shake(40, 0.001);
      }
    });

    // Show controls hint after UIScene has had time to initialize
    this.time.delayedCall(100, () => {
      this.getUI()?.showMessage('WASD to move  •  Click to attack');
    });
  }

  update(_time: number, delta: number) {
    const time = this.time.now;

    this.player.update(delta, {
      w: this.keys.w.isDown,
      a: this.keys.a.isDown,
      s: this.keys.s.isDown,
      d: this.keys.d.isDown,
    });

    // Clamp player inside room walls
    const minX = TILE_SIZE * WALL_THICKNESS + 16;
    const minY = TILE_SIZE * WALL_THICKNESS + 16;
    const maxX = TILE_SIZE * (MAP_COLS - WALL_THICKNESS) - 16;
    const maxY = TILE_SIZE * (MAP_ROWS - WALL_THICKNESS) - 16;
    this.player.x = Phaser.Math.Clamp(this.player.x, minX, maxX);
    this.player.y = Phaser.Math.Clamp(this.player.y, minY, maxY);

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
      }
    }

    // Loot pickup — walk over to collect
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

    this.add.rectangle(totalW / 2, totalH / 2, totalW, totalH, 0x1a1a2e);

    const g = this.add.graphics();
    g.lineStyle(1, 0x222244, 0.4);
    for (let col = 0; col <= MAP_COLS; col++) {
      g.lineBetween(col * TILE_SIZE, 0, col * TILE_SIZE, totalH);
    }
    for (let row = 0; row <= MAP_ROWS; row++) {
      g.lineBetween(0, row * TILE_SIZE, totalW, row * TILE_SIZE);
    }

    const wallColor = 0x3a2a5c;
    const wallLight = 0x5a4a8c;

    this.add.rectangle(totalW / 2, TILE_SIZE, totalW, TILE_SIZE * WALL_THICKNESS, wallColor);
    this.add.rectangle(totalW / 2, totalH - TILE_SIZE, totalW, TILE_SIZE * WALL_THICKNESS, wallColor);
    this.add.rectangle(TILE_SIZE, totalH / 2, TILE_SIZE * WALL_THICKNESS, totalH, wallColor);
    this.add.rectangle(totalW - TILE_SIZE, totalH / 2, TILE_SIZE * WALL_THICKNESS, totalH, wallColor);

    const gw = this.add.graphics();
    gw.lineStyle(2, wallLight);
    gw.strokeRect(TILE_SIZE * WALL_THICKNESS, TILE_SIZE * WALL_THICKNESS,
      totalW - TILE_SIZE * WALL_THICKNESS * 2, totalH - TILE_SIZE * WALL_THICKNESS * 2);

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
