import type { Roi } from "../types";
import { classColor } from "../lib/colors";

interface Props {
  rois: Roi[];
  selectedRoiId: string | null;
  onSelect: (id: string | null) => void;
  onLocate: (roi: Roi) => void;
  onDelete: (id: string) => void;
}

export default function RoiPanel({ rois, selectedRoiId, onSelect, onLocate, onDelete }: Props) {
  return (
    <div className="panel">
      <h3>Annotations ({rois.length})</h3>
      {rois.length === 0 && <p className="hint">No ROIs yet — draw one, or accept a prediction.</p>}
      <ul className="list">
        {rois.map((r) => (
          <li key={r.id} className={selectedRoiId === r.id ? "sel" : ""} onClick={() => onSelect(r.id)}>
            <span className="swatch" style={{ background: classColor(r.className) }} />
            <span className="grow">
              {r.className}
              {r.source === "ml" && <em className="tag">ML {Math.round((r.confidence ?? 0) * 100)}%</em>}
            </span>
            <button title="Zoom to" onClick={(e) => { e.stopPropagation(); onLocate(r); }}>⤢</button>
            <button title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(r.id); }}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
