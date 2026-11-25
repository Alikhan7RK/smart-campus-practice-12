export type ReasonCode =
  | 'AVAILABLE'
  | 'INVALID_NUMBER'
  | 'NOT_WHOLE_MINUTES'
  | 'INVALID_CURRENT_TIME'
  | 'START_OUT_OF_RANGE'
  | 'END_OUT_OF_RANGE'
  | 'START_NOT_BEFORE_END'
  | 'START_NOT_AFTER_NOW'
  | 'TOO_LONG'
  | 'ROOM_BLOCKED'
  | 'OVERLAP';

export interface Booking {
  start: number;
  end: number;
  label: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  blockReason?: string;
  bookings: Booking[];
}

export type CheckOutcome = {
  status: 'available' | 'unavailable';
  code: ReasonCode;
  reason?: string;
};

export type ValidationResult = {
  valid: boolean;
  code: ReasonCode;
  reason?: string;
};
