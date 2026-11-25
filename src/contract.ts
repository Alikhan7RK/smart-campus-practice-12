import { validateInterval, overlaps } from './availability';
import { minutesToLabel } from './utils';
import type { Booking } from './types';

export type ContractReasonCode =
  | 'AVAILABLE'
  | 'OVERLAP'
  | 'ROOM_BLOCKED'
  | 'INVALID_DURATION'
  | 'DURATION_TOO_LONG'
  | 'START_IN_PAST';

export interface ContractRequest {
  start: number;
  duration: number;
  blocked: boolean;
  now: number;
  bookings: Booking[];
}

export interface ContractResult {
  available: boolean;
  reasonCode: ContractReasonCode;
  message: string;
}

const MAX_DURATION = 120;

export function checkRequest(req: ContractRequest): ContractResult {
  const { start, duration, blocked, now, bookings } = req;
  const end = start + duration;

  if (!Number.isFinite(duration) || duration <= 0) {
    return {
      available: false,
      reasonCode: 'INVALID_DURATION',
      message: 'Duration must be greater than 0 minutes.',
    };
  }

  if (duration > MAX_DURATION) {
    return {
      available: false,
      reasonCode: 'DURATION_TOO_LONG',
      message: `Duration cannot exceed ${MAX_DURATION} minutes.`,
    };
  }

  if (!Number.isFinite(start) || start <= now) {
    return {
      available: false,
      reasonCode: 'START_IN_PAST',
      message: 'Start time must be strictly after the current time.',
    };
  }

  // Reuse the existing rule engine for range and integrality checks.
  // The pre-checks above already cover duration and start-in-past, so any
  // remaining failure is a range/number issue from validateInterval.
  const validation = validateInterval(start, end, now);
  if (!validation.valid) {
    return {
      available: false,
      reasonCode: validation.code as ContractReasonCode,
      message: validation.reason ?? 'The request does not satisfy the booking rules.',
    };
  }

  if (blocked) {
    return {
      available: false,
      reasonCode: 'ROOM_BLOCKED',
      message: 'Room is blocked and cannot be booked.',
    };
  }

  const conflict = bookings.find((b) => overlaps({ start, end }, b));
  if (conflict) {
    return {
      available: false,
      reasonCode: 'OVERLAP',
      message: `Overlaps existing booking "${conflict.label}" (${minutesToLabel(conflict.start)}–${minutesToLabel(conflict.end)}).`,
    };
  }

  return {
    available: true,
    reasonCode: 'AVAILABLE',
    message: 'Room is available for the requested time.',
  };
}
