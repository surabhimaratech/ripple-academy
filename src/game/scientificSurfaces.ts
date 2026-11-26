import type { Point } from "./movement";
/** Presentation geometry only. A future local visualization can replace content without changing furniture or rewards. */
export interface ScientificSurface {
  id: string;
  label: string;
  corners: readonly Point[];
  content: "illustrative";
}
export const scientificSurfaces: readonly ScientificSurface[] = [
  {
    id: "transit-display",
    label: "Illustrative transit light curve",
    content: "illustrative",
    corners: [
      { x: 193, y: 335 },
      { x: 312, y: 335 },
      { x: 312, y: 398 },
      { x: 193, y: 398 },
    ],
  },
  {
    id: "deep-space-display",
    label: "Illustrative deep-space image",
    content: "illustrative",
    corners: [
      { x: 325, y: 335 },
      { x: 443, y: 335 },
      { x: 443, y: 398 },
      { x: 325, y: 398 },
    ],
  },
];
// No network/data adapter or scientific execution engine is instantiated here.
