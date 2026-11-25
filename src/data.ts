import type { Room } from './types';

export const rooms: Room[] = [
  {
    id: 'A101',
    name: 'Room A101',
    building: 'Science Block',
    capacity: 30,
    blocked: false,
    bookings: [{ start: 600, end: 660, label: 'Calculus 101' }],
  },
  {
    id: 'B202',
    name: 'Room B202',
    building: 'Humanities Wing',
    capacity: 24,
    blocked: true,
    blockReason: 'Scheduled maintenance — plumbing upgrade',
    bookings: [],
  },
  {
    id: 'C303',
    name: 'Room C303',
    building: 'Library Tower',
    capacity: 18,
    blocked: false,
    bookings: [],
  },
];
