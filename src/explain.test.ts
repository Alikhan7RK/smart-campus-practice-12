import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkAvailability } from './availability';
import { explainAvailability, type ExplainMode } from './explain';
import { rooms } from './data';
import type { CheckOutcome } from './types';

const CURRENT_TIME = 540;

function findRoom(id: string) {
  const r = rooms.find((room) => room.id === id);
  if (!r) throw new Error(`unknown room ${id}`);
  return r;
}

const ALL_MODES: ExplainMode[] = ['normal', 'timeout', 'error', 'no-key'];

const FALLBACK_TEXT = 'Explanation unavailable. The booking status above is still correct.';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

async function flush() {
  // Advance fake timers and flush queued microtasks for promise resolution.
  await vi.runAllTimersAsync();
}

describe('explain availability (E01–E16)', () => {
  it('E01: A101 660–720 -> available; explanation ok, mentions "Room A101", no "unavailable"', async () => {
    const room = findRoom('A101');
    const outcome = checkAvailability(room, 660, 720, CURRENT_TIME);
    expect(outcome.status).toBe('available');

    const result = await explainAvailability({
      roomLabel: room.name,
      start: 660,
      end: 720,
      isAvailable: true,
      reasonCode: outcome.code,
      mode: 'normal',
    });
    await flush();

    expect(result.ok).toBe(true);
    expect(result.text).toContain('Room A101');
    expect(result.text.toLowerCase()).not.toContain('unavailable');
  });

  it('E02: A101 630–690 -> unavailable, code OVERLAP; explanation ok, contains "overlaps"', async () => {
    const room = findRoom('A101');
    const outcome = checkAvailability(room, 630, 690, CURRENT_TIME);
    expect(outcome.status).toBe('unavailable');
    expect(outcome.code).toBe('OVERLAP');

    const result = await explainAvailability({
      roomLabel: room.name,
      start: 630,
      end: 690,
      isAvailable: false,
      reasonCode: outcome.code,
      mode: 'normal',
    });
    await flush();

    expect(result.ok).toBe(true);
    expect(result.text.toLowerCase()).toContain('overlaps');
  });

  it('E03: B202 660–720 -> code ROOM_BLOCKED; explanation ok, contains "blocked"', async () => {
    const room = findRoom('B202');
    const outcome = checkAvailability(room, 660, 720, CURRENT_TIME);
    expect(outcome.code).toBe('ROOM_BLOCKED');

    const result = await explainAvailability({
      roomLabel: room.name,
      start: 660,
      end: 720,
      isAvailable: false,
      reasonCode: outcome.code,
      mode: 'normal',
    });
    await flush();

    expect(result.ok).toBe(true);
    expect(result.text.toLowerCase()).toContain('blocked');
  });

  it('E04: C303 1500–1550 -> unavailable; explanation ok (not fallback) and must not say the room can be booked', async () => {
    const room = findRoom('C303');
    const outcome = checkAvailability(room, 1500, 1550, CURRENT_TIME);
    expect(outcome.status).toBe('unavailable');

    const result = await explainAvailability({
      roomLabel: room.name,
      start: 1500,
      end: 1550,
      isAvailable: false,
      reasonCode: outcome.code,
      mode: 'normal',
    });
    await flush();

    expect(result.ok).toBe(true);
    expect(result.text).not.toBe(FALLBACK_TEXT);
    expect(result.text.toLowerCase()).not.toContain('can be booked');
  });

  it('E05: C303 500–560 -> code START_NOT_AFTER_NOW; explanation ok, contains "current time"', async () => {
    const room = findRoom('C303');
    const outcome = checkAvailability(room, 500, 560, CURRENT_TIME);
    expect(outcome.code).toBe('START_NOT_AFTER_NOW');

    const result = await explainAvailability({
      roomLabel: room.name,
      start: 500,
      end: 560,
      isAvailable: false,
      reasonCode: outcome.code,
      mode: 'normal',
    });
    await flush();

    expect(result.ok).toBe(true);
    expect(result.text.toLowerCase()).toContain('current time');
  });

  it('E06: empty roomLabel -> fallback text, ok false', async () => {
    const room = findRoom('A101');
    const outcome = checkAvailability(room, 660, 720, CURRENT_TIME);

    const result = await explainAvailability({
      roomLabel: '',
      start: 660,
      end: 720,
      isAvailable: outcome.status === 'available',
      reasonCode: outcome.code,
      mode: 'normal',
    });
    await flush();

    expect(result.ok).toBe(false);
    expect(result.text).toBe(FALLBACK_TEXT);
  });

  it('E07: roomLabel of 61 characters -> fallback, ok false', async () => {
    const room = findRoom('A101');
    const outcome = checkAvailability(room, 660, 720, CURRENT_TIME);
    const longLabel = 'X'.repeat(61);

    const result = await explainAvailability({
      roomLabel: longLabel,
      start: 660,
      end: 720,
      isAvailable: outcome.status === 'available',
      reasonCode: outcome.code,
      mode: 'normal',
    });
    await flush();

    expect(result.ok).toBe(false);
    expect(result.text).toBe(FALLBACK_TEXT);
  });

  it('E08: mode "timeout", advance timers by 3000 ms -> fallback, ok false', async () => {
    const room = findRoom('A101');
    const outcome = checkAvailability(room, 660, 720, CURRENT_TIME);

    const pending = explainAvailability({
      roomLabel: room.name,
      start: 660,
      end: 720,
      isAvailable: true,
      reasonCode: outcome.code,
      mode: 'timeout',
    });

    await vi.advanceTimersByTimeAsync(3000);
    const result = await pending;

    expect(result.ok).toBe(false);
    expect(result.text).toBe(FALLBACK_TEXT);
  });

  it('E09: mode "error" -> fallback; mode "no-key" -> fallback', async () => {
    const room = findRoom('A101');
    const outcome = checkAvailability(room, 660, 720, CURRENT_TIME);

    const errorResult = await explainAvailability({
      roomLabel: room.name,
      start: 660,
      end: 720,
      isAvailable: true,
      reasonCode: outcome.code,
      mode: 'error',
    });
    await flush();

    expect(errorResult.ok).toBe(false);
    expect(errorResult.text).toBe(FALLBACK_TEXT);

    const noKeyResult = await explainAvailability({
      roomLabel: room.name,
      start: 660,
      end: 720,
      isAvailable: true,
      reasonCode: outcome.code,
      mode: 'no-key',
    });
    await flush();

    expect(noKeyResult.ok).toBe(false);
    expect(noKeyResult.text).toBe(FALLBACK_TEXT);
  });

  it('E10: decision never changes — outcome deep-equals copy and bookings JSON unchanged across all modes', async () => {
    const room = findRoom('A101');
    const outcome = checkAvailability(room, 660, 720, CURRENT_TIME);
    const outcomeCopy: CheckOutcome = JSON.parse(JSON.stringify(outcome));
    const bookingsBefore = JSON.stringify(room.bookings);

    for (const mode of ALL_MODES) {
      const pending = explainAvailability({
        roomLabel: room.name,
        start: 660,
        end: 720,
        isAvailable: outcome.status === 'available',
        reasonCode: outcome.code,
        mode,
      });
      if (mode === 'timeout') {
        await vi.advanceTimersByTimeAsync(3000);
      } else {
        await flush();
      }
      await pending;
    }

    expect(outcome).toEqual(outcomeCopy);
    expect(JSON.stringify(room.bookings)).toBe(bookingsBefore);
  });

  it('E11: isAvailable true with reasonCode OVERLAP -> fallback', async () => {
    const result = await explainAvailability({
      roomLabel: 'Room A101',
      start: 630,
      end: 690,
      isAvailable: true,
      reasonCode: 'OVERLAP',
      mode: 'normal',
    });
    await flush();

    expect(result.ok).toBe(false);
    expect(result.text).toBe(FALLBACK_TEXT);
  });

  it('E12: C303 600.5–660 -> code NOT_WHOLE_MINUTES; explanation ok, contains "whole minutes"', async () => {
    const room = findRoom('C303');
    const outcome = checkAvailability(room, 600.5, 660, CURRENT_TIME);
    expect(outcome.code).toBe('NOT_WHOLE_MINUTES');

    const result = await explainAvailability({
      roomLabel: room.name,
      start: 600.5,
      end: 660,
      isAvailable: false,
      reasonCode: outcome.code,
      mode: 'normal',
    });
    await flush();

    expect(result.ok).toBe(true);
    expect(result.text.toLowerCase()).toContain('whole minutes');
  });

  it('E13: NaN start -> code INVALID_NUMBER; explanation ok (not the fallback)', async () => {
    const room = findRoom('C303');
    const outcome = checkAvailability(room, Number.NaN, 660, CURRENT_TIME);
    expect(outcome.code).toBe('INVALID_NUMBER');

    const result = await explainAvailability({
      roomLabel: room.name,
      start: Number.NaN,
      end: 660,
      isAvailable: false,
      reasonCode: outcome.code,
      mode: 'normal',
    });
    await flush();

    expect(result.ok).toBe(true);
    expect(result.text).not.toBe(FALLBACK_TEXT);
  });

  it('E14: START_NOT_AFTER_NOW with non-integer start 500.5 -> fallback (integer checks still apply to non-input-error codes)', async () => {
    const result = await explainAvailability({
      roomLabel: 'Room C303',
      start: 500.5,
      end: 560,
      isAvailable: false,
      reasonCode: 'START_NOT_AFTER_NOW',
      mode: 'normal',
    });
    await flush();

    expect(result.ok).toBe(false);
    expect(result.text).toBe(FALLBACK_TEXT);
  });

  it('E15: A101 660–720 -> AVAILABLE explanation contains "11:00" and "12:00"', async () => {
    const room = findRoom('A101');
    const outcome = checkAvailability(room, 660, 720, CURRENT_TIME);
    expect(outcome.code).toBe('AVAILABLE');

    const result = await explainAvailability({
      roomLabel: room.name,
      start: 660,
      end: 720,
      isAvailable: true,
      reasonCode: outcome.code,
      mode: 'normal',
    });
    await flush();

    expect(result.ok).toBe(true);
    expect(result.text).toContain('11:00');
    expect(result.text).toContain('12:00');
  });

  it('E16: two error-mode calls return independent fallback objects — mutating the first does not affect the second', async () => {
    const room = findRoom('A101');
    const outcome = checkAvailability(room, 660, 720, CURRENT_TIME);

    const first = await explainAvailability({
      roomLabel: room.name,
      start: 660,
      end: 720,
      isAvailable: true,
      reasonCode: outcome.code,
      mode: 'error',
    });
    await flush();

    first.text = 'tampered';

    const second = await explainAvailability({
      roomLabel: room.name,
      start: 660,
      end: 720,
      isAvailable: true,
      reasonCode: outcome.code,
      mode: 'error',
    });
    await flush();

    expect(second.text).toBe(FALLBACK_TEXT);
  });
});
