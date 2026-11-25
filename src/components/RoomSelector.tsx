import { ChevronDown, MapPin, Users, Wrench } from 'lucide-react';
import type { Room } from '@/types';

interface Props {
  rooms: Room[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function RoomSelector({ rooms, selectedId, onSelect }: Props) {
  const selected = rooms.find((r) => r.id === selectedId) ?? rooms[0];

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Select Room
      </label>
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-800 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        >
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.building}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {selected.building}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {selected.capacity} seats
        </span>
        {selected.blocked ? (
          <span className="inline-flex items-center gap-1 font-medium text-rose-600">
            <Wrench className="h-3.5 w-3.5" />
            Under maintenance
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Operational
          </span>
        )}
      </div>
    </div>
  );
}
