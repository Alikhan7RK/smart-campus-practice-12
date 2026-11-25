import { Calendar, CheckCircle2, XCircle, Clock4, AlertTriangle } from 'lucide-react';
import type { Room } from '@/types';
import { minutesToLabel } from '@/utils';
import { overlaps } from '@/availability';

interface Props {
  room: Room;
  outcome: { status: 'available' | 'unavailable'; reason?: string; reasonCode?: string } | null;
  interval: { start: number; end: number };
}

export default function BookingsList({ room, outcome, interval }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-800">
          Existing bookings for {room.name}
        </h3>
      </div>

      {room.blocked ? (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span>
            This room is blocked: {room.blockReason ?? 'Under maintenance'}.
            New bookings cannot be requested.
          </span>
        </div>
      ) : room.bookings.length === 0 ? (
        <p className="text-sm text-slate-400">No existing bookings.</p>
      ) : (
        <ul className="space-y-2">
          {room.bookings.map((b, i) => {
            const overlapsRequest = overlaps(interval, b);
            return (
              <li
                key={i}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition ${
                  overlapsRequest
                    ? 'border-rose-200 bg-rose-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span className="font-medium text-slate-700">{b.label}</span>
                <span className="flex items-center gap-1.5 font-semibold tabular-nums text-slate-600">
                  <Clock4 className="h-3.5 w-3.5 text-slate-400" />
                  {minutesToLabel(b.start)} – {minutesToLabel(b.end)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {outcome ? (
        <div
          className={`mt-4 rounded-lg p-3 text-sm font-medium ${
            outcome.status === 'available'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <div className="flex items-start gap-2">
            {outcome.status === 'available' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">
                  {outcome.status === 'available'
                    ? 'Available — this time can be booked.'
                    : 'Unavailable'}
                </p>
                {outcome.reasonCode ? (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-600">
                    {outcome.reasonCode}
                  </span>
                ) : null}
              </div>
              {outcome.reason ? (
                <p className="mt-0.5 text-xs font-normal opacity-90">
                  {outcome.reason}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
