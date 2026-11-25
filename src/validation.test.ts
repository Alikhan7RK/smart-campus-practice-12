import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
import type { Room } from './types';

function emptyRoom(): Room {
  return {
    id: 'C303',
    name: 'Room C303',
    building: 'Library Tower',
    capacity: 18,
    blocked: false,
    blockReason: undefined,
    bookings: [],
  };
}

describe('R-01 validateInterval edge cases', () => {
  it('V01: now 540, 600.5–660 -> unavailable, reason contains "whole minutes"', () => {
    const result = checkAvailability(emptyRoom(), 600.5, 660, 540);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toContain('whole minutes');
  });

  it('V02: now 540, 600–660.5 -> unavailable, reason contains "whole minutes"', () => {
    const result = checkAvailability(emptyRoom(), 600, 660.5, 540);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toContain('whole minutes');
  });

  it('V03: now -500, 600–660 -> unavailable, reason contains "Current time"', () => {
    const result = checkAvailability(emptyRoom(), 600, 660, -500);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toContain('Current time');
  });

  it('V04: now 1441, 600–660 -> unavailable, reason contains "Current time"', () => {
    const result = checkAvailability(emptyRoom(), 600, 660, 1441);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toContain('Current time');
  });

  it('V05: now 540, 600–660 -> available (valid request still works)', () => {
    const result = checkAvailability(emptyRoom(), 600, 660, 540);
    expect(result.status).toBe('available');
  });
});
