export function startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function diffDaysInclusive(from: Date, to: Date) {
    const d0 = startOfDay(from);
    const d1 = startOfDay(to);
    const MS = 24 * 60 * 60 * 1000;
    return Math.floor((d1.getTime() - d0.getTime()) / MS) + 1;
}
