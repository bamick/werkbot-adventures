import * as Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_MAX_HP, ATTACK_COOLDOWN_MS } from '../config/constants';
import { ASSETS } from '../config/assets';

export class Player extends Phaser.GameObjects.Image {
  hp: number = PLAYER_MAX_HP;
  maxHp: number = PLAYER_MAX_HP;
  attackDamage: number = 15;
  private lastAttackTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ASSETS.PLAYER);
    scene.add.existing(this);
    this.setDepth(y);
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

  update(delta: number, keys: { w: boolean; a: boolean; s: boolean; d: boolean }) {
    const speed = PLAYER_SPEED * (delta / 1000);
    let dx = 0;
    let dy = 0;

    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(2);
      dx /= len;
      dy /= len;
    }

    this.x += dx * speed;
    this.y += dy * speed;
    this.setDepth(this.y);
  }
}
