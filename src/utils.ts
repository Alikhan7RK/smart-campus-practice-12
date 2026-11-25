export function minutesToLabel(min: number): string {
  if (Number.isNaN(min) || min < 0 || min > 1440) return 'Invalid';
  const h = Math.floor(min / 60);
  const mm = min % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function isValidMinutes(min: number): boolean {
  return !Number.isNaN(min) && min >= 0 && min <= 1440;
}

export function clampMinutes(min: number): number {
  if (Number.isNaN(min)) return 0;
  return Math.max(0, Math.min(1440, min));
}
