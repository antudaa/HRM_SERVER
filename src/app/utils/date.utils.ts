export function diffDaysInclusive(from: Date, to: Date): number {
  const d0 = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const d1 = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  const MS = 24 * 60 * 60 * 1000;
  return Math.floor((d1.getTime() - d0.getTime()) / MS) + 1;
}

export function isHalfDayAllowed(durationRules: { unit: "day"|"hour"; minIncrement: number; allowedIncrements?: number[] }) {
  if (durationRules.unit !== "day") return false;
  if (durationRules.minIncrement <= 0.5) return true;
  return !!durationRules.allowedIncrements?.includes(0.5);
}
