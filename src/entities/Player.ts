import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_MAX_HP, ATTACK_COOLDOWN_MS } from '../config/constants';
import { ASSETS } from '../config/assets';

export class Player extends Phaser.GameObjects.Image {
  hp: number = PLAYER_MAX_HP;
  maxHp: number = PLAYER_MAX_HP;
  private target: Phaser.Math.Vector2 | null = null;
  private lastAttackTime: number = 0;
  attackDamage: number = 15;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ASSETS.PLAYER);
    scene.add.existing(this);
    this.setDepth(y);
  }

  moveTo(worldX: number, worldY: number) {
    this.target = new Phaser.Math.Vector2(worldX, worldY);
  }

  stopMoving() {
    this.target = null;
  }

  canAttack(time: number): boolean {
    return time - this.lastAttackTime >= ATTACK_COOLDOWN_MS;
  }

  recordAttack(time: number) {
    this.lastAttackTime = time;
  }

  takeDamage(amount: number) {
    this.hp = Math.max(0, this.hp - amount);
  }

  update(delta: number) {
    if (!this.target) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 4) {
      this.target = null;
      return;
    }

    const speed = PLAYER_SPEED * (delta / 1000);
    this.x += (dx / dist) * speed;
    this.y += (dy / dist) * speed;
    this.setDepth(this.y);
  }
}
