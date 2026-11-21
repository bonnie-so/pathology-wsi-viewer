import type { Prediction } from "../types";
import { classColor } from "../lib/colors";

interface Props {
  predictions: Prediction[];
  onAccept: (p: Prediction) => void;
  onReject: (id: string) => void;
  onLocate: (p: Prediction) => void;
}

/** Review queue: model predictions a scientist accepts (→ annotation) or rejects. */
export default function MlPanel({ predictions, onAccept, onReject, onLocate }: Props) {
  return (
    <div className="panel">
      <h3>Prediction review ({predictions.length})</h3>
      {predictions.length === 0 && <p className="hint">Queue cleared — all predictions reviewed.</p>}
      <ul className="list">
        {predictions.map((p) => (
          <li key={p.id}>
            <span className="swatch" style={{ background: classColor(p.className) }} />
            <span className="grow">
              {p.className}
              <div className="conf"><i style={{ width: `${p.confidence * 100}%` }} /></div>
            </span>
            <span className="confnum">{Math.round(p.confidence * 100)}%</span>
            <button title="Zoom to" onClick={() => onLocate(p)}>⤢</button>
            <button className="ok" title="Accept" onClick={() => onAccept(p)}>✓</button>
            <button title="Reject" onClick={() => onReject(p.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
