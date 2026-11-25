import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
import type { Room, Booking } from './types';

function makeRoom(overrides: Partial<Room> = {}): Room {
  const bookings: Booking[] = [{ start: 600, end: 660, label: 'Existing' }];
  return {
    id: 'room-1',
    name: 'Test Room',
    building: 'Main',
    capacity: 10,
    blocked: false,
    blockReason: undefined,
    bookings,
    ...overrides,
  };
}

const CURRENT_TIME = 540;

describe('checkAvailability', () => {
  it('T01: 660-720 -> available (AC4, touching after)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 660, 720, CURRENT_TIME);
    expect(result.status).toBe('available');
  });

  it('T02: 540-570 -> unavailable (AC1, starts now)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 540, 570, CURRENT_TIME);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toContain('current time');
  });

  it('T03: 720-720 -> unavailable (AC1, zero duration)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 720, 720, CURRENT_TIME);
    expect(result.status).toBe('unavailable');
  });

  it('T04: 750-720 -> unavailable (AC1, reversed)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 750, 720, CURRENT_TIME);
    expect(result.status).toBe('unavailable');
  });

  it('T05: 1380-1441 -> unavailable (AC1, past day end)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 1380, 1441, CURRENT_TIME);
    expect(result.status).toBe('unavailable');
  });

  it('T06: 720-840 -> available (AC2, exactly 120 min)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 720, 840, CURRENT_TIME);
    expect(result.status).toBe('available');
  });

  it('T07: 720-841 -> unavailable (AC2, 121 min)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 720, 841, CURRENT_TIME);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toContain('120');
  });

  it('T08: 570-600 -> available (AC4, touching before)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 570, 600, CURRENT_TIME);
    expect(result.status).toBe('available');
  });

  it('T09: 630-690 -> unavailable (AC4, partial overlap)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 630, 690, CURRENT_TIME);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toContain('Overlaps');
  });

  it('T10: 570-690 -> unavailable (AC4, contains booking)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 570, 690, CURRENT_TIME);
    expect(result.status).toBe('unavailable');
  });

  it('T11: 615-645 -> unavailable (AC4, inside booking)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 615, 645, CURRENT_TIME);
    expect(result.status).toBe('unavailable');
  });

  it('T12: 600-660 -> unavailable (AC4, identical)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 600, 660, CURRENT_TIME);
    expect(result.status).toBe('unavailable');
  });

  it('T13: 660-720 with blocked=true -> unavailable (AC3)', () => {
    const room = makeRoom({ blocked: true, blockReason: 'Maintenance' });
    const result = checkAvailability(room, 660, 720, CURRENT_TIME);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toContain('Maintenance');
  });

  it('T14: 630-690 with empty bookings -> available (AC4)', () => {
    const room = makeRoom({ bookings: [] });
    const result = checkAvailability(room, 630, 690, CURRENT_TIME);
    expect(result.status).toBe('available');
  });

  it('T15: bookings array unchanged after call (AC5)', () => {
    const room = makeRoom();
    const before = JSON.stringify(room.bookings);
    checkAvailability(room, 660, 720, CURRENT_TIME);
    const after = JSON.stringify(room.bookings);
    expect(after).toBe(before);
  });

  it('T16: 1380-1440 -> available (AC1, end exactly at 1440)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 1380, 1440, CURRENT_TIME);
    expect(result.status).toBe('available');
  });

  it('T17: 541-570 -> available (AC1, one minute after now)', () => {
    const room = makeRoom();
    const result = checkAvailability(room, 541, 570, CURRENT_TIME);
    expect(result.status).toBe('available');
  });

  it('T18: 630-690 overlap -> unavailable and bookings unchanged (AC4, AC5)', () => {
    const room = makeRoom();
    const before = JSON.stringify(room.bookings);
    const result = checkAvailability(room, 630, 690, CURRENT_TIME);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toContain('Overlaps');
    const after = JSON.stringify(room.bookings);
    expect(after).toBe(before);
  });
});
