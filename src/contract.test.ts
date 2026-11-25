import { describe, it, expect } from 'vitest';
import { checkRequest } from './contract';

const NOW = 540;
const BOOKINGS = [{ start: 600, end: 660, label: 'Calculus 101' }];

describe('checkRequest (T1–T8)', () => {
  it('T1: start 720, duration 60 -> available', () => {
    const result = checkRequest({ start: 720, duration: 60, blocked: false, now: NOW, bookings: BOOKINGS });
    expect(result.available).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
  });

  it('T2: start 630, duration 60 -> unavailable, OVERLAP', () => {
    const result = checkRequest({ start: 630, duration: 60, blocked: false, now: NOW, bookings: BOOKINGS });
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('OVERLAP');
  });

  it('T3: start 720, duration 60, blocked -> unavailable, ROOM_BLOCKED', () => {
    const result = checkRequest({ start: 720, duration: 60, blocked: true, now: NOW, bookings: BOOKINGS });
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('ROOM_BLOCKED');
  });

  it('T4: start 720, duration 0 -> INVALID_DURATION', () => {
    const result = checkRequest({ start: 720, duration: 0, blocked: false, now: NOW, bookings: BOOKINGS });
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('INVALID_DURATION');
  });

  it('T5: start 720, duration 121 -> DURATION_TOO_LONG', () => {
    const result = checkRequest({ start: 720, duration: 121, blocked: false, now: NOW, bookings: BOOKINGS });
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('DURATION_TOO_LONG');
  });

  it('T6: start 500, duration 30 -> START_IN_PAST', () => {
    const result = checkRequest({ start: 500, duration: 30, blocked: false, now: NOW, bookings: BOOKINGS });
    expect(result.available).toBe(false);
    expect(result.reasonCode).toBe('START_IN_PAST');
  });

  it('T7: start 660, duration 60 -> available (touching endpoint allowed)', () => {
    const result = checkRequest({ start: 660, duration: 60, blocked: false, now: NOW, bookings: BOOKINGS });
    expect(result.available).toBe(true);
    expect(result.reasonCode).toBe('AVAILABLE');
  });

  it('T8: running T1–T7 does not mutate bookings', () => {
    const bookings = [{ start: 600, end: 660, label: 'Calculus 101' }];
    const before = JSON.stringify(bookings);

    checkRequest({ start: 720, duration: 60, blocked: false, now: NOW, bookings });
    checkRequest({ start: 630, duration: 60, blocked: false, now: NOW, bookings });
    checkRequest({ start: 720, duration: 60, blocked: true, now: NOW, bookings });
    checkRequest({ start: 720, duration: 0, blocked: false, now: NOW, bookings });
    checkRequest({ start: 720, duration: 121, blocked: false, now: NOW, bookings });
    checkRequest({ start: 500, duration: 30, blocked: false, now: NOW, bookings });
    checkRequest({ start: 660, duration: 60, blocked: false, now: NOW, bookings });

    expect(JSON.stringify(bookings)).toBe(before);
  });
});
