import type { ReasonCode } from './types';
import { minutesToLabel } from './utils';

export type ExplainMode = 'normal' | 'timeout' | 'error' | 'no-key';

export interface ExplainInput {
  roomLabel: string;
  start: number;
  end: number;
  isAvailable: boolean;
  reasonCode: ReasonCode;
  mode?: ExplainMode;
}

export interface ExplainResult {
  text: string;
  ok: boolean;
}

const FALLBACK_TEXT = 'Explanation unavailable. The booking status above is still correct.';

function fallback(): ExplainResult {
  return { text: FALLBACK_TEXT, ok: false };
}

const TIMEOUT_MS = 3000;
const MAX_CHARS = 300;
const MAX_SENTENCES = 2;

const KNOWN_CODES: ReadonlySet<ReasonCode> = new Set<ReasonCode>([
  'AVAILABLE',
  'INVALID_NUMBER',
  'NOT_WHOLE_MINUTES',
  'INVALID_CURRENT_TIME',
  'START_OUT_OF_RANGE',
  'END_OUT_OF_RANGE',
  'START_NOT_BEFORE_END',
  'START_NOT_AFTER_NOW',
  'TOO_LONG',
  'ROOM_BLOCKED',
  'OVERLAP',
]);

const AVAILABLE_CODES: ReadonlySet<ReasonCode> = new Set<ReasonCode>(['AVAILABLE']);

const INPUT_ERROR_CODES: ReadonlySet<ReasonCode> = new Set<ReasonCode>([
  'INVALID_NUMBER',
  'NOT_WHOLE_MINUTES',
  'INVALID_CURRENT_TIME',
  'START_OUT_OF_RANGE',
  'END_OUT_OF_RANGE',
]);

function validTime(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 1440;
}

function validateInput(input: ExplainInput): string | null {
  const { roomLabel, start, end, isAvailable, reasonCode } = input;
  if (typeof roomLabel !== 'string' || roomLabel.trim() === '' || roomLabel.length > 60) {
    return 'roomLabel must be a non-empty string of at most 60 characters.';
  }
  if (!KNOWN_CODES.has(reasonCode)) {
    return 'reasonCode is not a known reason code.';
  }
  // Input-error codes describe times the checker already rejected; the
  // explanation does not print them, so we do not re-validate range/integrality.
  if (!INPUT_ERROR_CODES.has(reasonCode)) {
    if (!validTime(start)) return 'start must be a whole number between 0 and 1440.';
    if (!validTime(end)) return 'end must be a whole number between 0 and 1440.';
  }
  const codeMeansAvailable = AVAILABLE_CODES.has(reasonCode);
  if (codeMeansAvailable !== isAvailable) {
    return 'isAvailable does not agree with reasonCode.';
  }
  return null;
}

function buildExplanation(input: ExplainInput): string {
  const { roomLabel, start, end, reasonCode } = input;
  switch (reasonCode) {
    case 'AVAILABLE':
      return `${roomLabel} can be booked from ${minutesToLabel(start)} to ${minutesToLabel(end)}. The requested window satisfies all booking rules.`;
    case 'INVALID_NUMBER':
      return `${roomLabel} could not be checked because one of the times was not a number.`;
    case 'NOT_WHOLE_MINUTES':
      return `${roomLabel} could not be checked because times must be whole minutes.`;
    case 'INVALID_CURRENT_TIME':
      return `${roomLabel} could not be checked because the current time must be between 0 and 1440.`;
    case 'START_OUT_OF_RANGE':
      return `${roomLabel} could not be checked because the start time is out of range.`;
    case 'END_OUT_OF_RANGE':
      return `${roomLabel} could not be checked because the end time is out of range.`;
    case 'START_NOT_BEFORE_END':
      return `${roomLabel} could not be checked because the start must be before the end.`;
    case 'START_NOT_AFTER_NOW':
      return `${roomLabel} could not be checked because the start must be after the current time.`;
    case 'TOO_LONG':
      return `${roomLabel} cannot be booked because the requested window exceeds 120 minutes.`;
    case 'ROOM_BLOCKED':
      return `${roomLabel} is blocked and cannot be booked.`;
    case 'OVERLAP':
      return `${roomLabel} is unavailable because the requested window overlaps an existing booking.`;
    default:
      return FALLBACK_TEXT;
  }
}

function contradictsAvailability(text: string, isAvailable: boolean): boolean {
  const lower = text.toLowerCase();
  if (isAvailable) {
    return /unavailable|cannot be booked|blocked|overlaps|could not be checked/.test(lower);
  }
  return /\bcan be booked\b|\bis available\b/.test(lower);
}

function validateOutput(text: string, isAvailable: boolean): boolean {
  if (typeof text !== 'string' || text.trim() === '') return false;
  if (text.length > MAX_CHARS) return false;
  const sentenceCount = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  if (sentenceCount > MAX_SENTENCES) return false;
  if (contradictsAvailability(text, isAvailable)) return false;
  return true;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

function runAdapter(input: ExplainInput): Promise<string> {
  const mode = input.mode ?? 'normal';
  switch (mode) {
    case 'timeout':
      return new Promise<string>(() => {
        // Never resolves; the timeout guard produces the fallback.
      });
    case 'error':
      return Promise.reject(new Error('adapter error'));
    case 'no-key':
      return Promise.reject(new Error('no API key configured'));
    case 'normal':
    default:
      return Promise.resolve(buildExplanation(input));
  }
}

export async function explainAvailability(input: ExplainInput): Promise<ExplainResult> {
  const inputError = validateInput(input);
  if (inputError) return fallback();

  try {
    const text = await withTimeout(runAdapter(input), TIMEOUT_MS);
    if (validateOutput(text, input.isAvailable)) {
      return { text, ok: true };
    }
    return fallback();
  } catch {
    return fallback();
  }
}
