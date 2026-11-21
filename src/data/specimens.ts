import type { Specimen } from "../types";

/**
 * Synthetic specimen-tracking records — stand-in for a LIMS. Follows samples
 * from collection through microscopic analysis (subject → organ → block → slide
 * → stain → status), the backbone of a histology tracking system.
 */
export const SPECIMENS: Specimen[] = [
  { specimenId: "SPC-0241", subject: "NHP-014", organ: "Cortex — Motor", block: "B1", slide: "S1", stain: "H&E", status: "analyzed", collectedOn: "2026-09-02" },
  { specimenId: "SPC-0242", subject: "NHP-014", organ: "Cortex — Motor", block: "B1", slide: "S2", stain: "GFAP IHC", status: "scanned", collectedOn: "2026-09-02" },
  { specimenId: "SPC-0243", subject: "NHP-014", organ: "Cortex — Motor", block: "B2", slide: "S1", stain: "Nissl", status: "stained", collectedOn: "2026-09-02" },
  { specimenId: "SPC-0251", subject: "NHP-018", organ: "Hippocampus", block: "B1", slide: "S1", stain: "H&E", status: "sectioned", collectedOn: "2026-10-11" },
  { specimenId: "SPC-0252", subject: "NHP-018", organ: "Hippocampus", block: "B1", slide: "S2", stain: "Iba1 IHC", status: "embedded", collectedOn: "2026-10-11" },
  { specimenId: "SPC-0260", subject: "NHP-021", organ: "Spinal cord", block: "B1", slide: "—", stain: "—", status: "processing", collectedOn: "2026-11-04" },
  { specimenId: "SPC-0261", subject: "NHP-021", organ: "Spinal cord", block: "B2", slide: "—", stain: "—", status: "collected", collectedOn: "2026-11-04" },
  { specimenId: "SPC-0270", subject: "NHP-022", organ: "Cortex — Visual", block: "B1", slide: "S1", stain: "H&E", status: "scanned", collectedOn: "2026-11-15" },
];
