import { useEffect, useRef, useState, useCallback } from "react";
import OpenSeadragon from "openseadragon";
import type { ImagePoint, Prediction, Roi, OverlayTransform, ViewerMode } from "../types";
import { makeSyntheticTileSource } from "../lib/syntheticTileSource";
import { classColor } from "../lib/colors";

export interface LocateRequest {
  points: ImagePoint[];
  nonce: number;
}

interface ViewerProps {
  rois: Roi[];
  predictions: Prediction[];
  showPredictions: boolean;
  mode: ViewerMode;
  newClass: string;
  overlay: OverlayTransform;
  selectedRoiId: string | null;
  locate: LocateRequest | null;
  onAddRoi: (roi: Roi) => void;
  onSelectRoi: (id: string | null) => void;
}

const SLIDE = 65536; // simulated slide edge in pixels (~4.3 gigapixel)

export default function Viewer(props: ViewerProps) {
  const {
    rois, predictions, showPredictions, mode, newClass, overlay,
    selectedRoiId, locate, onAddRoi, onSelectRoi,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const [ready, setReady] = useState(false);
  const [, setFrame] = useState(0); // bumped on viewport change to redraw overlay

  // In-progress drawing state
  const [draftPoly, setDraftPoly] = useState<ImagePoint[]>([]);
  const [rectStart, setRectStart] = useState<ImagePoint | null>(null);
  const [rectNow, setRectNow] = useState<ImagePoint | null>(null);

  // ---- init viewer once -------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;
    const viewer = OpenSeadragon({
      element: containerRef.current,
      showNavigationControl: false, // we ship our own buttons (no icon assets needed)
      showNavigator: true,
      navigatorPosition: "BOTTOM_RIGHT",
      tileSources: makeSyntheticTileSource({ width: SLIDE, height: SLIDE, hue: 330, seed: 1 }),
      minZoomImageRatio: 0.5,
      maxZoomPixelRatio: 8,
      visibilityRatio: 1,
      crossOriginPolicy: false,
    });
    viewerRef.current = viewer;

    // Second "serial section" (different stain hue) for the overlay/alignment demo.
    viewer.addTiledImage({
      tileSource: makeSyntheticTileSource({ width: SLIDE, height: SLIDE, hue: 28, seed: 2 }),
      opacity: 0,
      index: 1,
    });

    const bump = () => setFrame((f) => f + 1);
    viewer.addHandler("open", () => { setReady(true); bump(); });
    viewer.addHandler("update-viewport", bump);
    viewer.addHandler("resize", bump);

    return () => { viewer.destroy(); viewerRef.current = null; };
  }, []);

  // ---- apply overlay transform -----------------------------------------
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !ready) return;
    const item = viewer.world.getItemCount() > 1 ? viewer.world.getItemAt(1) : null;
    if (!item) return;
    item.setOpacity(overlay.opacity);
    item.setPosition(new OpenSeadragon.Point(overlay.dx, overlay.dy), true);
    item.setRotation(overlay.rotation, true);
  }, [overlay, ready]);

  // ---- toggle navigation vs drawing ------------------------------------
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.setMouseNavEnabled(mode === "pan");
  }, [mode]);

  // ---- fly to a located ROI/prediction ---------------------------------
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !ready || !locate) return;
    const bounds = bbox(locate.points);
    const rect = viewer.viewport.imageToViewportRectangle(
      new OpenSeadragon.Rect(bounds.x, bounds.y, bounds.w, bounds.h)
    );
    // pad a little so the ROI isn't edge-to-edge
    rect.x -= rect.width * 0.5; rect.y -= rect.height * 0.5;
    rect.width *= 2; rect.height *= 2;
    viewer.viewport.fitBounds(rect, false);
  }, [locate, ready]);

  // ---- coordinate helpers ----------------------------------------------
  const imgToEl = useCallback((p: ImagePoint) => {
    const v = viewerRef.current!;
    const vp = v.viewport.imageToViewportCoordinates(new OpenSeadragon.Point(p[0], p[1]));
    const el = v.viewport.viewportToViewerElementCoordinates(vp);
    return { x: el.x, y: el.y };
  }, []);

  const elToImg = useCallback((px: number, py: number): ImagePoint => {
    const v = viewerRef.current!;
    const vp = v.viewport.viewerElementToViewportCoordinates(new OpenSeadragon.Point(px, py));
    const img = v.viewport.viewportToImageCoordinates(vp);
    return [img.x, img.y];
  }, []);

  const localXY = (e: React.PointerEvent | React.MouseEvent) => {
    const r = containerRef.current!.getBoundingClientRect();
    return { px: e.clientX - r.left, py: e.clientY - r.top };
  };

  // ---- drawing interaction ---------------------------------------------
  const finishPolygon = useCallback(() => {
    if (draftPoly.length >= 3) {
      onAddRoi({
        id: crypto.randomUUID(), kind: "polygon", points: draftPoly,
        label: newClass, className: newClass, source: "manual",
      });
    }
    setDraftPoly([]);
  }, [draftPoly, newClass, onAddRoi]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") finishPolygon();
      if (e.key === "Escape") { setDraftPoly([]); setRectStart(null); setRectNow(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finishPolygon]);

  const onSvgClick = (e: React.MouseEvent) => {
    if (mode !== "draw-polygon" || !ready) return;
    const { px, py } = localXY(e);
    setDraftPoly((pts) => [...pts, elToImg(px, py)]);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (mode !== "draw-rect" || !ready) return;
    const { px, py } = localXY(e);
    const p = elToImg(px, py);
    setRectStart(p); setRectNow(p);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (mode === "draw-rect" && rectStart) {
      const { px, py } = localXY(e);
      setRectNow(elToImg(px, py));
    }
  };
  const onPointerUp = () => {
    if (mode === "draw-rect" && rectStart && rectNow) {
      const [x1, y1] = rectStart, [x2, y2] = rectNow;
      const corners: ImagePoint[] = [
        [x1, y1], [x2, y1], [x2, y2], [x1, y2],
      ];
      onAddRoi({
        id: crypto.randomUUID(), kind: "rect", points: corners,
        label: newClass, className: newClass, source: "manual",
      });
    }
    setRectStart(null); setRectNow(null);
  };

  // ---- render SVG overlay ----------------------------------------------
  const toPointsAttr = (pts: ImagePoint[]) =>
    pts.map((p) => { const e = imgToEl(p); return `${e.x},${e.y}`; }).join(" ");

  return (
    <div className="viewer-wrap">
      <div ref={containerRef} className="osd" />
      <svg
        className="anno"
        style={{ pointerEvents: mode === "pan" ? "none" : "auto",
                 cursor: mode === "pan" ? "default" : "crosshair" }}
        onClick={onSvgClick}
        onDoubleClick={finishPolygon}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {ready && rois.map((r) => (
          <polygon
            key={r.id}
            points={toPointsAttr(r.points)}
            className={`roi ${selectedRoiId === r.id ? "sel" : ""}`}
            style={{ stroke: classColor(r.className), fill: classColor(r.className) }}
            onClick={(e) => { e.stopPropagation(); onSelectRoi(r.id); }}
          />
        ))}

        {ready && showPredictions && predictions.map((p) => (
          <polygon
            key={p.id}
            points={toPointsAttr(p.points)}
            className="pred"
            style={{ stroke: classColor(p.className) }}
          />
        ))}

        {ready && draftPoly.length > 0 && (
          <>
            <polyline points={toPointsAttr(draftPoly)} className="draft-line" />
            {draftPoly.map((p, i) => {
              const e = imgToEl(p);
              return <circle key={i} cx={e.x} cy={e.y} r={4} className="draft-vertex" />;
            })}
          </>
        )}

        {ready && rectStart && rectNow && (
          <polygon
            points={toPointsAttr([
              rectStart, [rectNow[0], rectStart[1]], rectNow, [rectStart[0], rectNow[1]],
            ])}
            className="draft-line"
          />
        )}
      </svg>

      <div className="osd-toolbar">
        <button onClick={() => viewerRef.current?.viewport.zoomBy(1.4).applyConstraints()}>＋</button>
        <button onClick={() => viewerRef.current?.viewport.zoomBy(0.7).applyConstraints()}>－</button>
        <button onClick={() => viewerRef.current?.viewport.goHome()}>⤢</button>
      </div>
    </div>
  );
}

function bbox(points: ImagePoint[]) {
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x || 1, h: Math.max(...ys) - y || 1 };
}
