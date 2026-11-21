import type { Specimen, SpecimenStatus } from "../types";
import { SPECIMENS } from "../data/specimens";

const STEPS: SpecimenStatus[] = [
  "collected", "processing", "embedded", "sectioned", "stained", "scanned", "analyzed",
];

function progress(status: SpecimenStatus): number {
  return (STEPS.indexOf(status) + 1) / STEPS.length;
}

export default function SpecimenTable({ specimens = SPECIMENS }: { specimens?: Specimen[] }) {
  return (
    <div className="panel wide">
      <h3>Specimen tracking</h3>
      <table className="specimens">
        <thead>
          <tr>
            <th>Specimen</th><th>Subject</th><th>Organ</th><th>Block</th>
            <th>Slide</th><th>Stain</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {specimens.map((s) => (
            <tr key={s.specimenId}>
              <td className="mono">{s.specimenId}</td>
              <td>{s.subject}</td>
              <td>{s.organ}</td>
              <td>{s.block}</td>
              <td>{s.slide}</td>
              <td>{s.stain}</td>
              <td>
                <div className="status">
                  <div className="bar"><i style={{ width: `${progress(s.status) * 100}%` }} /></div>
                  <span>{s.status}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
