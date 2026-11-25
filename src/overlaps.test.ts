import { describe, it, expect } from 'vitest';
import { overlaps } from './availability';

describe('overlaps', () => {
  it('O01: {660,720} vs {600,660} -> false (touching after, AC4)', () => {
    expect(overlaps({ start: 660, end: 720 }, { start: 600, end: 660 })).toBe(false);
  });

  it('O02: {570,600} vs {600,660} -> false (touching before, AC4)', () => {
    expect(overlaps({ start: 570, end: 600 }, { start: 600, end: 660 })).toBe(false);
  });

  it('O03: {630,690} vs {600,660} -> true (partial overlap)', () => {
    expect(overlaps({ start: 630, end: 690 }, { start: 600, end: 660 })).toBe(true);
  });

  it('O04: {615,645} vs {600,660} -> true (inside)', () => {
    expect(overlaps({ start: 615, end: 645 }, { start: 600, end: 660 })).toBe(true);
  });

  it('O05: {570,690} vs {600,660} -> true (contains)', () => {
    expect(overlaps({ start: 570, end: 690 }, { start: 600, end: 660 })).toBe(true);
  });

  it('O06: overlaps is symmetric across the cases above', () => {
    const cases: [a: { start: number; end: number }, b: { start: number; end: number }][] = [
      [{ start: 660, end: 720 }, { start: 600, end: 660 }],
      [{ start: 570, end: 600 }, { start: 600, end: 660 }],
      [{ start: 630, end: 690 }, { start: 600, end: 660 }],
      [{ start: 615, end: 645 }, { start: 600, end: 660 }],
      [{ start: 570, end: 690 }, { start: 600, end: 660 }],
    ];
    for (const [a, b] of cases) {
      expect(overlaps(a, b)).toBe(overlaps(b, a));
    }
  });
});
