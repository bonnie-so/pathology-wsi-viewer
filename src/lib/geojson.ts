/**
 * Export ROIs to GeoJSON in image-pixel coordinates — the same format QuPath and
 * most WSI tools exchange, so annotations drawn here round-trip into analysis.
 */
import type { Roi } from "../types";

export interface GeoJsonFeature {
  type: "Feature";
  geometry: { type: "Polygon"; coordinates: number[][][] };
  properties: Record<string, unknown>;
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

/** Close a ring by repeating the first vertex, as the GeoJSON spec requires. */
function closedRing(points: ReadonlyArray<[number, number]>): number[][] {
  const ring = points.map(([x, y]) => [x, y]);
  if (ring.length > 0) {
    const [fx, fy] = ring[0];
    const [lx, ly] = ring[ring.length - 1];
    if (fx !== lx || fy !== ly) ring.push([fx, fy]);
  }
  return ring;
}

export function roiToFeature(roi: Roi): GeoJsonFeature {
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [closedRing(roi.points)] },
    properties: {
      id: roi.id,
      label: roi.label,
      class: roi.className,
      source: roi.source,
      ...(roi.confidence != null ? { confidence: roi.confidence } : {}),
    },
  };
}

export function roisToGeoJSON(rois: Roi[]): GeoJsonFeatureCollection {
  return { type: "FeatureCollection", features: rois.map(roiToFeature) };
}

/** Trigger a browser download of the ROIs as a .geojson file. */
export function downloadGeoJSON(rois: Roi[], filename = "annotations.geojson"): void {
  const blob = new Blob([JSON.stringify(roisToGeoJSON(rois), null, 2)], {
    type: "application/geo+json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
