/** Replace paths/normalized placement here; no game, navigation or persistence logic changes. */
export const entranceArt = {
  id: "ripple-arrival-v1",
  width: 1600,
  height: 1000,
  layers: [
    {
      id: "sky",
      src: "/art/entrance/sky.svg",
      depth: 0.025,
      box: [-80, -80, 1760, 1100],
    },
    {
      id: "mountains",
      src: "/art/entrance/mountains.svg",
      depth: 0.05,
      box: [-160, -100, 1920, 1200],
    },
    {
      id: "atmosphere",
      src: "/art/entrance/mist.svg",
      depth: 0.075,
      box: [-160, -70, 1920, 1200],
    },
    {
      id: "architecture",
      src: "/art/entrance/academy.png",
      depth: 0.1,
      box: [340, 110, 1230, 820],
    },
    {
      id: "lake",
      src: "/art/entrance/lake.svg",
      depth: 0.12,
      box: [-40, 0, 1680, 1050],
    },
    {
      id: "forest",
      src: "/art/entrance/forest.svg",
      depth: 0.17,
      box: [-160, 0, 1920, 1200],
    },
    {
      id: "foreground",
      src: "/art/entrance/foreground.png",
      depth: 0.23,
      box: [-250, -100, 2100, 1400],
    },
  ] as const,
  gates: {
    doors: "/art/entrance/gates/door-pair.png",
    surround: "/art/entrance/gates/portal.png",
  },
  courtyard: "/art/entrance/courtyard.png",
  /** Optional supplied preview URLs override snapshots of the actual room renderer. */
  roomPreviews: {} as Partial<
    Record<"grand-library" | "personal-study" | "observatory", string>
  >,
};
