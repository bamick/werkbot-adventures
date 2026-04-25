import * as Phaser from 'phaser';
import { ENEMY_SPEED, ENEMY_MAX_HP, ENEMY_ATTACK_DAMAGE, ENEMY_DETECTION_RADIUS, ATTACK_COOLDOWN_MS } from '../config/constants';
import { ASSETS } from '../config/assets';

export type EnemyType = 'skeleton' | 'slime';

export class Enemy extends Phaser.GameObjects.Image {
  hp: number;
  maxHp: number;
  attackDamage: number = ENEMY_ATTACK_DAMAGE;
  type: EnemyType;
  private lastAttackTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType = 'skeleton') {
    const textureKey = type === 'slime' ? ASSETS.ENEMY_SLIME : ASSETS.ENEMY_SKELETON;
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    this.type = type;
    this.maxHp = ENEMY_MAX_HP;
    this.hp = this.maxHp;
    this.setDepth(y);
  }

  takeDamage(amount: number) {
    this.hp = Math.max(0, this.hp - amount);
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  canAttack(time: number): boolean {
    return time - this.lastAttackTime >= ATTACK_COOLDOWN_MS * 1.5;
  }

  recordAttack(time: number) {
    this.lastAttackTime = time;
  }

  update(playerX: number, playerY: number, delta: number, time: number): boolean {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > ENEMY_DETECTION_RADIUS) return false;

    // Close enough to attack — don't move, return attack signal
    if (dist < 36) {
      this.setDepth(this.y);
      if (this.canAttack(time)) {
        this.recordAttack(time);
        return true;
      }
      return false;
    }

    // Chase player
    const speed = ENEMY_SPEED * (delta / 1000);
    this.x += (dx / dist) * speed;
    this.y += (dy / dist) * speed;
    this.setDepth(this.y);
    return false;
  }
}
