import Phaser from "phaser";
import type { ScholarBehavior } from "./behavior";
import { createScholarTextures } from "./scholar";
/** Sprite selection and pose blending only; decisions and navigation remain in the controller. */
export class ScholarView {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly shadow: Phaser.GameObjects.Ellipse;
  private offset = 0;
  private clock = 0;
  constructor(scene: Phaser.Scene) {
    createScholarTextures(scene);
    this.shadow = scene.add.ellipse(642, 562, 47, 14, 0x1c2030, 0.5);
    this.sprite = scene.add
      .sprite(642, 564, "scholar-down-0")
      .setOrigin(0.5, 1)
      .setScale(1.55);
  }
  update(b: ScholarBehavior, dt: number, reduced: boolean) {
    this.clock += dt;
    const engaged =
      !!b.activity &&
      b.state !== "walking-to-object" &&
      b.state !== "wandering";
    const desired = engaged ? b.offsetY : 0;
    this.offset += (desired - this.offset) * Math.min(1, dt * 7);
    if (Math.abs(desired - this.offset) < 0.1) this.offset = desired;
    let frame = b.moving && !reduced ? Math.floor(this.clock / 0.14) % 4 : 0;
    if (!b.moving && engaged) {
      const pose = b.pose;
      if (pose === "code") frame = !reduced && b.engaged % 13 > 10 ? 13 : 12;
      else if (pose === "write") frame = 11;
      else if (pose === "seated-read") frame = 10;
      else if (pose === "read") frame = 5;
      else if (pose === "sit") frame = 4;
      else if (pose === "browse") frame = b.engaged % 12 < 2 ? 9 : 5;
      if (!reduced && b.engaged > 2) {
        const phase = b.engaged % 17;
        if (
          (pose.includes("read") || pose === "write") &&
          phase > 8 &&
          phase < 8.65
        )
          frame = 6;
        else if (pose === "rest" && phase > 6 && phase < 7.4) frame = 8;
        else if (
          (pose === "sit" || pose === "observe" || pose === "globe") &&
          phase > 11 &&
          phase < 12.2
        )
          frame = 7;
      }
    }
    if (b.state === "celebrating") frame = reduced ? 0 : 8;
    const bob =
      !reduced && !b.moving && !desired ? Math.sin(this.clock * 2) * 0.6 : 0;
    this.sprite
      .setTexture(`scholar-${b.facing}-${frame}`)
      .setPosition(b.position.x, b.position.y + this.offset + bob)
      .setScale(1.55, desired ? 1.36 : 1.55)
      .setDepth(b.position.y);
    this.shadow
      .setPosition(b.position.x, b.position.y - 3)
      .setDepth(b.position.y - 1)
      .setVisible(Math.abs(this.offset) < 5);
  }
}
