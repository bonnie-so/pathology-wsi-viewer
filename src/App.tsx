import { useState } from "react";
import Viewer, { type LocateRequest } from "./components/Viewer";
import ControlsPanel from "./components/ControlsPanel";
import RoiPanel from "./components/RoiPanel";
import MlPanel from "./components/MlPanel";
import SpecimenTable from "./components/SpecimenTable";
import { downloadGeoJSON } from "./lib/geojson";
import { CLASS_OPTIONS } from "./lib/colors";
import { PREDICTIONS } from "./data/predictions";
import type { ImagePoint, OverlayTransform, Prediction, Roi, ViewerMode } from "./types";

export default function App() {
  const [rois, setRois] = useState<Roi[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>(PREDICTIONS);
  const [showPredictions, setShowPredictions] = useState(true);
  const [mode, setMode] = useState<ViewerMode>("pan");
  const [newClass, setNewClass] = useState(CLASS_OPTIONS[0]);
  const [overlay, setOverlay] = useState<OverlayTransform>({ opacity: 0, dx: 0, dy: 0, rotation: 0 });
  const [selectedRoiId, setSelectedRoiId] = useState<string | null>(null);
  const [locate, setLocate] = useState<LocateRequest | null>(null);

  const flyTo = (points: ImagePoint[]) => setLocate({ points, nonce: Date.now() });

  const acceptPrediction = (p: Prediction) => {
    setRois((r) => [
      ...r,
      { id: crypto.randomUUID(), kind: "polygon", points: p.points,
        label: p.className, className: p.className, source: "ml", confidence: p.confidence },
    ]);
    setPredictions((list) => list.filter((x) => x.id !== p.id));
  };

  return (
    <div className="app">
      <header>
        <div>
          <strong>Pathology WSI Viewer</strong>
          <span className="sub">browser whole-slide viewer · ROI annotation · serial-section alignment · ML review</span>
        </div>
        <a className="gh" href="https://github.com/bonnie-so/pathology-wsi-viewer" target="_blank" rel="noreferrer">
          source ↗
        </a>
      </header>

      <main>
        <aside>
          <ControlsPanel
            mode={mode} setMode={setMode}
            newClass={newClass} setNewClass={setNewClass}
            overlay={overlay} setOverlay={setOverlay}
            showPredictions={showPredictions} setShowPredictions={setShowPredictions}
            onExport={() => downloadGeoJSON(rois)}
            roiCount={rois.length}
          />
          <MlPanel
            predictions={predictions}
            onAccept={acceptPrediction}
            onReject={(id) => setPredictions((l) => l.filter((x) => x.id !== id))}
            onLocate={(p) => flyTo(p.points)}
          />
          <RoiPanel
            rois={rois} selectedRoiId={selectedRoiId}
            onSelect={setSelectedRoiId}
            onLocate={(r) => flyTo(r.points)}
            onDelete={(id) => setRois((l) => l.filter((x) => x.id !== id))}
          />
        </aside>

        <section className="stage">
          <Viewer
            rois={rois}
            predictions={predictions}
            showPredictions={showPredictions}
            mode={mode}
            newClass={newClass}
            overlay={overlay}
            selectedRoiId={selectedRoiId}
            locate={locate}
            onAddRoi={(r) => setRois((l) => [...l, r])}
            onSelectRoi={setSelectedRoiId}
          />
        </section>
      </main>

      <SpecimenTable />

      <footer>
        All imagery is procedurally generated; specimens and predictions are synthetic. No real
        or patient data. Built as a portfolio demo.
      </footer>
    </div>
  );
}
