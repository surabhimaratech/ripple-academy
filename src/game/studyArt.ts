import type Phaser from "phaser";
export function preloadStudy(scene: Phaser.Scene) {
  if (!scene.textures.exists("scholars-study"))
    scene.load.image("scholars-study", "/art/rooms/personal-study.png");
}
/** User-approved artwork, unchanged. Props and heroine remain separate. */
export function paintStudy(
  scene: Phaser.Scene,
  _reduced: boolean,
): Phaser.Tweens.Tween[] {
  scene.add
    .image(640, 360, "scholars-study")
    .setDisplaySize(1280, 720)
    .setDepth(0);
  return [];
}
