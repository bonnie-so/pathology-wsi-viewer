import type { OverlayTransform, ViewerMode } from "../types";
import { CLASS_OPTIONS } from "../lib/colors";

interface Props {
  mode: ViewerMode;
  setMode: (m: ViewerMode) => void;
  newClass: string;
  setNewClass: (c: string) => void;
  overlay: OverlayTransform;
  setOverlay: (o: OverlayTransform) => void;
  showPredictions: boolean;
  setShowPredictions: (b: boolean) => void;
  onExport: () => void;
  roiCount: number;
}

export default function ControlsPanel(p: Props) {
  const set = (patch: Partial<OverlayTransform>) => p.setOverlay({ ...p.overlay, ...patch });

  return (
    <div className="panel">
      <h3>Tools</h3>
      <div className="seg">
        {(["pan", "draw-polygon", "draw-rect"] as ViewerMode[]).map((m) => (
          <button key={m} className={p.mode === m ? "on" : ""} onClick={() => p.setMode(m)}>
            {m === "pan" ? "Pan/Zoom" : m === "draw-polygon" ? "Polygon" : "Rectangle"}
          </button>
        ))}
      </div>
      {p.mode === "draw-polygon" && (
        <p className="hint">Click to add points · double-click or Enter to finish · Esc to cancel</p>
      )}

      <label className="row">
        <span>Class</span>
        <select value={p.newClass} onChange={(e) => p.setNewClass(e.target.value)}>
          {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      <button className="primary" onClick={p.onExport} disabled={p.roiCount === 0}>
        Export GeoJSON ({p.roiCount})
      </button>

      <h3>Serial-section overlay</h3>
      <p className="hint">Overlay a second stain of the same section and align it by hand.</p>
      <label className="row"><span>Opacity</span>
        <input type="range" min={0} max={1} step={0.02} value={p.overlay.opacity}
          onChange={(e) => set({ opacity: +e.target.value })} />
      </label>
      <label className="row"><span>Shift X</span>
        <input type="range" min={-0.2} max={0.2} step={0.002} value={p.overlay.dx}
          onChange={(e) => set({ dx: +e.target.value })} />
      </label>
      <label className="row"><span>Shift Y</span>
        <input type="range" min={-0.2} max={0.2} step={0.002} value={p.overlay.dy}
          onChange={(e) => set({ dy: +e.target.value })} />
      </label>
      <label className="row"><span>Rotate</span>
        <input type="range" min={-30} max={30} step={0.5} value={p.overlay.rotation}
          onChange={(e) => set({ rotation: +e.target.value })} />
      </label>
      <button onClick={() => p.setOverlay({ opacity: 0, dx: 0, dy: 0, rotation: 0 })}>
        Reset overlay
      </button>

      <h3>Model predictions</h3>
      <label className="row check">
        <input type="checkbox" checked={p.showPredictions}
          onChange={(e) => p.setShowPredictions(e.target.checked)} />
        <span>Show predictions on slide</span>
      </label>
    </div>
  );
}
