import { useMemo, useState } from 'react';
import { Building2, Clock, Sparkles, Info, Loader2 } from 'lucide-react';
import { rooms } from '@/data';
import { checkRequest, type ContractResult } from '@/contract';
import { explainAvailability, type ExplainMode } from '@/explain';
import type { ReasonCode } from '@/types';
import { minutesToLabel, isValidMinutes } from '@/utils';
import RoomSelector from '@/components/RoomSelector';
import TimeInput from '@/components/TimeInput';
import BookingsList from '@/components/BookingsList';

const MODES: ExplainMode[] = ['normal', 'timeout', 'error', 'no-key'];

interface CheckedRequest {
  roomName: string;
  start: number;
  end: number;
}

interface ResultState {
  result: ContractResult;
  request: CheckedRequest;
}

export default function App() {
  const [roomId, setRoomId] = useState(rooms[0].id);
  const [currentTime, setCurrentTime] = useState(540);
  const [start, setStart] = useState(660);
  const [duration, setDuration] = useState(60);
  const [result, setResult] = useState<ResultState | null>(null);
  const [demoMode, setDemoMode] = useState<ExplainMode>('normal');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);

  const room = useMemo(() => rooms.find((r) => r.id === roomId) ?? rooms[0], [roomId]);
  const end = Number.isFinite(duration) ? start + duration : NaN;

  const clearResult = () => {
    setResult(null);
    setExplanation(null);
  };

  const handleRoomChange = (id: string) => {
    setRoomId(id);
    clearResult();
  };

  const handleTimeChange = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    clearResult();
  };

  const handleCheck = () => {
    const result = checkRequest({
      start,
      duration,
      blocked: room.blocked,
      now: currentTime,
      bookings: room.bookings,
    });
    setResult({
      result,
      request: { roomName: room.name, start, end },
    });
    setExplanation(null);
  };

  const handleReset = clearResult;

  const handleExplain = async () => {
    if (!result) return;
    setExplaining(true);
    setExplanation(null);
    const { result: contractResult, request } = result;
    const explainResult = await explainAvailability({
      roomLabel: request.roomName,
      start: request.start,
      end: request.end,
      isAvailable: contractResult.available,
      reasonCode: contractResult.reasonCode as ReasonCode,
      mode: demoMode,
    });
    setExplanation(explainResult.text);
    setExplaining(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-8 text-center sm:mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/70 px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Campus
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Room Availability Checker
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Pick a room and a candidate time window to see whether it can be booked.
            No bookings are saved — this is a read-only preview.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-5">
          {/* Left: form card */}
          <section className="md:col-span-3 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
            <RoomSelector rooms={rooms} selectedId={roomId} onSelect={handleRoomChange} />

            <div className="my-5 h-px bg-slate-100" />

            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Time Window (minutes from midnight)
            </div>

            <div className="space-y-4">
              <TimeInput
                label="Current time"
                value={currentTime}
                onChange={handleTimeChange(setCurrentTime)}
                hint='The reference "now" — candidate start must be after this.'
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TimeInput
                  label="Start time"
                  value={start}
                  onChange={handleTimeChange(setStart)}
                  hint="Must be > current time."
                />
                <TimeInput
                  label="Duration (minutes)"
                  value={duration}
                  onChange={handleTimeChange(setDuration)}
                  placeholder="1–120"
                  hint="Max 120 minutes."
                  badge={`End ${minutesToLabel(end)}`}
                />
              </div>
            </div>

            {/* Quick summary line */}
            <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Requested window:{' '}
              <span className="font-semibold text-slate-700 tabular-nums">
                {minutesToLabel(start)} – {minutesToLabel(end)}
              </span>{' '}
              ({isValidMinutes(start) && isValidMinutes(end) ? duration : '—'} min)
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleCheck}
                className="flex-1 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              >
                Check availability
              </button>
              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Clear result
              </button>
            </div>
          </section>

          {/* Right: bookings + result */}
          <section className="md:col-span-2 space-y-4">
            <BookingsList
              room={room}
              outcome={
                result
                  ? {
                      status: result.result.available ? 'available' : 'unavailable',
                      reason: result.result.message,
                      reasonCode: result.result.reasonCode,
                    }
                  : null
              }
              interval={{ start, end }}
            />
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm">
              <div className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                <Building2 className="h-3.5 w-3.5" />
                Rules at a glance
              </div>
              <ul className="space-y-1.5 leading-relaxed">
                <li>• 0 ≤ start &lt; end ≤ 1440, start strictly after "now".</li>
                <li>• Max booking length: 120 minutes.</li>
                <li>• Blocked rooms can't be booked.</li>
                <li>• Touching endpoints are allowed (600–660 then 660–720).</li>
              </ul>
            </div>

            {result ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <button
                  onClick={handleExplain}
                  disabled={explaining}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {explaining ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                  {explaining ? 'Generating…' : 'Explain availability'}
                </button>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Demo: adapter mode
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {MODES.map((m) => (
                      <button
                        key={m}
                        onClick={() => setDemoMode(m)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                          demoMode === m
                            ? 'bg-slate-800 text-white'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {explanation ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                      AI-generated explanation (mock) — the status above is the official decision
                    </p>
                    <p className="text-xs leading-relaxed text-slate-700">{explanation}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Fictional sample data · Read-only prototype · No bookings are saved.
        </footer>
      </div>
    </div>
  );
}
