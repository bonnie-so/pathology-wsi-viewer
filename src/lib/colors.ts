/** Stable color per annotation class (colorblind-aware categorical palette). */
const PALETTE = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#6250d6", // violet
  "#e34948", // red
];

const FIXED: Record<string, string> = {
  Tumor: "#e34948",
  Gliosis: "#eb6834",
  "Neuron loss": "#6250d6",
  Hemorrhage: "#e34948",
  Necrosis: "#eda100",
  "Region of interest": "#2a78d6",
};

export const CLASS_OPTIONS = [
  "Region of interest",
  "Gliosis",
  "Neuron loss",
  "Hemorrhage",
  "Necrosis",
  "Tumor",
];

export function classColor(name: string): string {
  if (FIXED[name]) return FIXED[name];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}
