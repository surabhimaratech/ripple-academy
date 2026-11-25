import Phaser from "phaser";
import type { ScholarBehavior } from "./behavior";
import type { Interior } from "../domain/sessions";
import { createHeroineTextures } from "../heroine/textures";
import { heroine } from "../heroine/assets";
import { heroineFrame, type HeroinePose } from "../heroine/animation";
import {
  placementFor,
  posePhase,
  visibleRegions,
  type Placement,
} from "../heroine/presentation";
export class ScholarView {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly shadow: Phaser.GameObjects.Ellipse;
  private outgoing: Phaser.GameObjects.Sprite;
  private maskShape: Phaser.GameObjects.Graphics;
  private outgoingMaskShape: Phaser.GameObjects.Graphics;
  private clock = 0;
  private blend = 1;
  private lastKey = "";
  constructor(
    scene: Phaser.Scene,
    private room: Interior = "grand-library",
  ) {
    createHeroineTextures(scene);
    const origin = [
      heroine.canvas.footX / heroine.canvas.width,
      heroine.canvas.footY / heroine.canvas.height,
    ];
    this.shadow = scene.add.ellipse(642, 562, 40, 11, 0x1c2030, 0.4);
    this.sprite = scene.add
      .sprite(642, 564, "heroine-idle-down")
      .setOrigin(origin[0], origin[1]);
    this.outgoing = scene.add
      .sprite(642, 564, "heroine-idle-down")
      .setOrigin(origin[0], origin[1])
      .setVisible(false);
    this.maskShape = scene.make.graphics({ x: 0, y: 0 });
    this.outgoingMaskShape = scene.make.graphics({ x: 0, y: 0 });
    const mask = this.maskShape.createGeometryMask();

    this.sprite.setMask(mask);
    const previousMask = this.outgoingMaskShape.createGeometryMask();

    this.outgoing.setMask(previousMask);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.maskShape.destroy();
      this.outgoingMaskShape.destroy();
      mask.destroy();
      previousMask.destroy();
    });
  }
  private previousOccluders: Placement["occluders"] = [];
  private drawMask(
    shape: Phaser.GameObjects.Graphics,
    occluders: Placement["occluders"],
  ) {
    shape.clear().fillStyle(0xffffff);
    for (const r of visibleRegions(occluders))
      shape.fillRect(r.x, r.y, r.width, r.height);
  }
  render(
    pose: HeroinePose,
    placement: Placement,
    dt: number,
    reduced: boolean,
    overrideFrame?: string,
  ) {
    const frame = overrideFrame ?? heroineFrame(pose, reduced);
    const key = `${placement.key}:${posePhase(frame)}`;
    if (key !== this.lastKey) {
      if (this.lastKey && !reduced) {
        this.outgoing
          .setTexture(this.sprite.texture.key)
          .setPosition(this.sprite.x, this.sprite.y)
          .setScale(1)
          .setDepth(this.sprite.depth)
          .setAlpha(1)
          .setVisible(true);
        this.drawMask(this.outgoingMaskShape, this.previousOccluders);
        this.blend = 0;
      } else {
        this.blend = 1;
        this.outgoing.setVisible(false);
      }
      this.lastKey = key;
    }
    this.blend = reduced ? 1 : Math.min(1, this.blend + dt / 0.2);
    this.outgoing.setAlpha(1 - this.blend);
    if (this.blend === 1) this.outgoing.setVisible(false);
    this.drawMask(this.maskShape, placement.occluders);
    this.previousOccluders = placement.occluders;
    const breathing =
      !reduced && !pose.moving ? 1 + Math.sin(pose.clock * 1.4) * 0.002 : 1;
    this.sprite
      .setTexture(`heroine-${frame}`)
      .setPosition(placement.x, placement.y)
      .setScale(1, breathing)
      .setDepth(placement.depth)
      .setAlpha(this.blend);
    this.shadow
      .setPosition(placement.x, placement.y - 3)
      .setDepth(placement.depth - 1)
      .setVisible(!pose.engaged && placement.key === "standing");
  }
  update(b: ScholarBehavior, dt: number, reduced: boolean) {
    this.clock += dt;
    const engaged =
      !!b.activity &&
      !b.moving &&
      !["walking-to-object", "wandering"].includes(b.state);
    this.render(
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
      placementFor(this.room, b),
      dt,
      reduced,
    );
  }
}
