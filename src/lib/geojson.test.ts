import { describe, it, expect } from "vitest";
import { roiToFeature, roisToGeoJSON } from "./geojson";
import type { Roi } from "../types";

const roi: Roi = {
  id: "r1",
  kind: "polygon",
  points: [
    [10, 10],
    [100, 10],
    [100, 80],
  ],
  label: "tumor",
  className: "Tumor",
  source: "manual",
};

describe("geojson export", () => {
  it("closes the polygon ring", () => {
    const f = roiToFeature(roi);
    const ring = f.geometry.coordinates[0];
    expect(ring).toHaveLength(4); // 3 vertices + repeated first point
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it("keeps coordinates in image-pixel space", () => {
    const ring = roiToFeature(roi).geometry.coordinates[0];
    expect(ring[0]).toEqual([10, 10]);
    expect(ring[1]).toEqual([100, 10]);
  });

  it("carries properties, incl. confidence only when present", () => {
    const manual = roiToFeature(roi).properties;
    expect(manual).toMatchObject({ label: "tumor", class: "Tumor", source: "manual" });
    expect(manual.confidence).toBeUndefined();

    const ml = roiToFeature({ ...roi, source: "ml", confidence: 0.91 }).properties;
    expect(ml.confidence).toBe(0.91);
  });

  it("builds a FeatureCollection", () => {
    const fc = roisToGeoJSON([roi, { ...roi, id: "r2" }]);
    expect(fc.type).toBe("FeatureCollection");
    expect(fc.features).toHaveLength(2);
  });
});
