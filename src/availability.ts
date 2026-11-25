import type { Room, CheckOutcome, ValidationResult } from './types';
import { minutesToLabel } from './utils';

const MINUTES_PER_DAY = 1440;
const MAX_BOOKING_MINUTES = 120;

export function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

export function validateInterval(
  start: number,
  end: number,
  currentTime: number,
): ValidationResult {
  if (Number.isNaN(start) || Number.isNaN(end) || Number.isNaN(currentTime)) {
    return {
      valid: false,
      code: 'INVALID_NUMBER',
      reason: 'Start, end, and current time must all be numbers.',
    };
  }

  if (!Number.isInteger(start) || !Number.isInteger(end) || !Number.isInteger(currentTime)) {
    return { valid: false, code: 'NOT_WHOLE_MINUTES', reason: 'Times must be whole minutes.' };
  }

  if (currentTime < 0 || currentTime > MINUTES_PER_DAY) {
    return {
      valid: false,
      code: 'INVALID_CURRENT_TIME',
      reason: 'Current time must be between 0 and 1440 minutes.',
    };
  }

  if (start < 0 || start >= MINUTES_PER_DAY) {
    return {
      valid: false,
      code: 'START_OUT_OF_RANGE',
      reason: `Start time must be between 0 and ${MINUTES_PER_DAY - 1} minutes.`,
    };
  }

  if (end <= 0 || end > MINUTES_PER_DAY) {
    return {
      valid: false,
      code: 'END_OUT_OF_RANGE',
      reason: `End time must be between 1 and ${MINUTES_PER_DAY} minutes.`,
    };
  }

  if (!(start < end)) {
    return {
      valid: false,
      code: 'START_NOT_BEFORE_END',
      reason: 'Start time must be strictly before the end time.',
    };
  }

  if (start <= currentTime) {
    return {
      valid: false,
      code: 'START_NOT_AFTER_NOW',
      reason: `Start time must be strictly after the current time (${currentTime} min).`,
    };
  }

  if (end - start > MAX_BOOKING_MINUTES) {
    return {
      valid: false,
      code: 'TOO_LONG',
      reason: `Bookings cannot be longer than ${MAX_BOOKING_MINUTES} minutes. Requested ${end - start} minutes.`,
    };
  }

  return { valid: true, code: 'AVAILABLE' };
}

export function checkAvailability(
  room: Room,
  start: number,
  end: number,
  currentTime: number,
): CheckOutcome {
  const validation = validateInterval(start, end, currentTime);
  if (!validation.valid) {
    return { status: 'unavailable', code: validation.code, reason: validation.reason };
  }

  if (room.blocked) {
    return {
      status: 'unavailable',
      code: 'ROOM_BLOCKED',
      reason: room.blockReason
        ? `${room.name} is unavailable: ${room.blockReason}.`
        : `${room.name} is currently blocked.`,
    };
  }

  const conflict = room.bookings.find((b) => overlaps({ start, end }, b));
  if (conflict) {
    return {
      status: 'unavailable',
      code: 'OVERLAP',
      reason: `Overlaps existing booking "${conflict.label}" (${minutesToLabel(conflict.start)}–${minutesToLabel(conflict.end)}).`,
    };
  }

  return { status: 'available', code: 'AVAILABLE' };
}
