/** A point in BASE-IMAGE pixel coordinates (not screen pixels). */
export type ImagePoint = [number, number];

export type RoiKind = "polygon" | "rect";
export type RoiSource = "manual" | "ml";

/** A region of interest, stored in image-pixel coordinates so it survives pan/zoom. */
export interface Roi {
  id: string;
  kind: RoiKind;
  /** Polygon vertices in image coordinates (open ring; closed on export). */
  points: ImagePoint[];
  label: string;
  className: string;
  source: RoiSource;
  /** Model confidence 0-1, present for ML-derived ROIs. */
  confidence?: number;
}

/** A model-predicted region awaiting scientist review. */
export interface Prediction {
  id: string;
  points: ImagePoint[];
  className: string;
  confidence: number;
}

export type SpecimenStatus =
  | "collected"
  | "processing"
  | "embedded"
  | "sectioned"
  | "stained"
  | "scanned"
  | "analyzed";

export interface Specimen {
  specimenId: string;
  subject: string;
  organ: string;
  block: string;
  slide: string;
  stain: string;
  status: SpecimenStatus;
  collectedOn: string;
}

/** Alignment parameters for the overlaid serial-section image. */
export interface OverlayTransform {
  opacity: number; // 0-1
  dx: number; // viewport-x offset
  dy: number; // viewport-y offset
  rotation: number; // degrees
}

export type ViewerMode = "pan" | "draw-polygon" | "draw-rect";
