import { minutesToLabel } from '@/utils';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  min?: number;
  max?: number;
  placeholder?: string;
  badge?: string;
}

export default function TimeInput({
  label,
  value,
  onChange,
  hint,
  min,
  max,
  placeholder = '0–1440',
  badge,
}: Props) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
        <input
          type="number"
          {...(min !== undefined ? { min } : {})}
          {...(max !== undefined ? { max } : {})}
          value={Number.isNaN(value) ? '' : value}
          onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
          className="w-full px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none"
          placeholder={placeholder}
        />
        <div className="flex items-center bg-slate-50 px-3 text-xs font-semibold text-slate-500 tabular-nums">
          {badge ?? minutesToLabel(value)}
        </div>
      </div>
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
