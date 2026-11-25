import Phaser from "phaser";
import type { ScholarBehavior } from "./behavior";
import { createHeroineTextures } from "../heroine/textures";
import { heroine } from "../heroine/assets";
import { heroineFrame } from "../heroine/animation";
/** Canonical artwork rendering only. Navigation and activity decisions stay in the controller. */
export class ScholarView {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly shadow: Phaser.GameObjects.Ellipse;
  private offset = 0;
  private clock = 0;
  constructor(scene: Phaser.Scene) {
    createHeroineTextures(scene);
    this.shadow = scene.add.ellipse(642, 562, 40, 11, 0x1c2030, 0.4);
    this.sprite = scene.add
      .sprite(642, 564, "heroine-idle-down")
      .setOrigin(
        heroine.canvas.footX / heroine.canvas.width,
        heroine.canvas.footY / heroine.canvas.height,
      );
  }
  update(b: ScholarBehavior, dt: number, reduced: boolean) {
    this.clock += dt;
    const engaged =
      !!b.activity &&
      !b.moving &&
      b.state !== "walking-to-object" &&
      b.state !== "wandering";
    const writing = engaged && (b.pose === "code" || b.pose === "write");
    const telescope = engaged && b.activity?.id === "telescope";
    const desired = engaged
      ? b.offsetY + (writing ? -40 : telescope ? -22 : 0)
      : 0;
    this.offset = reduced
      ? desired
      : this.offset + (desired - this.offset) * Math.min(1, dt * 7);
    if (Math.abs(desired - this.offset) < 0.1) this.offset = desired;
    const frame = heroineFrame(
      {
        facing: b.facing,
        moving: b.moving,
        engaged,
        pose: b.pose,
        activityId: b.activity?.id,
        state: b.state,
        clock: this.clock,
        activityTime: b.engaged,
      },
      reduced,
    );
    const breathing =
      !reduced && !b.moving ? 1 + Math.sin(this.clock * 1.4) * 0.002 : 1;
    this.sprite
      .setTexture(`heroine-${frame}`)
      .setPosition(
        b.position.x + (telescope ? 22 : 0),
        b.position.y + this.offset,
      )
      .setScale(1, breathing)
      .setDepth(b.position.y);
    this.shadow
      .setPosition(b.position.x, b.position.y - 3)
      .setDepth(b.position.y - 1)
      .setVisible(Math.abs(this.offset) < 5 && !engaged);
  }
}
