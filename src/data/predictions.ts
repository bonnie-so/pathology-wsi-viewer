import type { Prediction } from "../types";

/** Square-ish blob centered at (cx, cy) in image pixels. */
function blob(cx: number, cy: number, s: number): [number, number][] {
  return [
    [cx - s, cy - s * 0.7],
    [cx + s * 0.8, cy - s],
    [cx + s, cy + s * 0.6],
    [cx + s * 0.2, cy + s],
    [cx - s * 0.9, cy + s * 0.5],
  ];
}

/**
 * Synthetic "model predictions" awaiting scientist review. In a real pipeline
 * these would come from an inference service; here they're fixed so the
 * accept/reject review flow is demonstrable. Coordinates are in image pixels on
 * the default 65536² synthetic slide.
 */
export const PREDICTIONS: Prediction[] = [
  { id: "pred-1", points: blob(21000, 18000, 900), className: "Gliosis", confidence: 0.94 },
  { id: "pred-2", points: blob(40000, 26000, 1300), className: "Neuron loss", confidence: 0.88 },
  { id: "pred-3", points: blob(33000, 41000, 1100), className: "Gliosis", confidence: 0.72 },
  { id: "pred-4", points: blob(48000, 47000, 800), className: "Hemorrhage", confidence: 0.63 },
  { id: "pred-5", points: blob(15000, 44000, 1000), className: "Neuron loss", confidence: 0.55 },
];
