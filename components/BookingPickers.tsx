import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Room } from '../types';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export function parseISODateLocal(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

export function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function monthStartsOnWeekday(year: number, monthIndex: number): number {
  return new Date(year, monthIndex, 1).getDay();
}

type BookingRoomSelectProps = {
  id: string;
  rooms: Room[];
  value: string;
  onChange: (roomId: string) => void;
  formatRoomLabel: (room: Room) => string;
  emptyLabel?: string;
};

export function BookingRoomSelect({
  id,
  rooms,
  value,
  onChange,
  formatRoomLabel,
  emptyLabel = 'Select a room…',
}: BookingRoomSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = useMemo(() => rooms.find((r) => r.id === value) ?? null, [rooms, value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={toggle}
        className="loma-booking-trigger flex w-full min-h-12 items-center justify-between gap-3 rounded-xl border border-deep-sea-blue/15 bg-sand-tan/40 px-4 py-3 text-left text-deep-sea-blue shadow-sm transition-colors hover:border-sunset-pink/35 hover:bg-sand-tan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2"
      >
        <span className={`font-medium ${selected ? '' : 'text-deep-sea-brown/45'}`}>
          {selected ? formatRoomLabel(selected) : emptyLabel}
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-deep-sea-blue/50 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={id}
          className="absolute z-[70] mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-deep-sea-blue/15 bg-sand-tan py-1 shadow-xl shadow-deep-sea-blue/10 ring-1 ring-deep-sea-blue/5"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === ''}
              className={`flex w-full px-4 py-3 text-left text-sm transition-colors hover:bg-white/70 focus:bg-white/70 focus:outline-none ${
                value === '' ? 'bg-sunset-pink/15 font-medium text-deep-sea-blue' : 'text-deep-sea-brown/70'
              }`}
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              {emptyLabel}
            </button>
          </li>
          {rooms.map((room) => (
            <li key={room.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === room.id}
                className={`flex w-full px-4 py-3 text-left text-sm transition-colors hover:bg-white/70 focus:bg-white/70 focus:outline-none ${
                  value === room.id ? 'bg-sunset-pink/25 font-semibold text-deep-sea-blue' : 'text-deep-sea-blue'
                }`}
                onClick={() => {
                  onChange(room.id);
                  setOpen(false);
                }}
              >
                {formatRoomLabel(room)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type BookingDateFieldProps = {
  id: string;
  value: string;
  onChange: (iso: string) => void;
  min: string;
};

export function BookingDateField({ id, value, onChange, min }: BookingDateFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const gridId = useId();

  const minDate = useMemo(() => parseISODateLocal(min), [min]);
  const valueDate = useMemo(() => (value ? parseISODateLocal(value) : null), [value]);

  const [viewYear, setViewYear] = useState(() => valueDate?.getFullYear() ?? minDate?.getFullYear() ?? new Date().getFullYear());
  const [viewMonthIndex, setViewMonthIndex] = useState(
    () => valueDate?.getMonth() ?? minDate?.getMonth() ?? new Date().getMonth(),
  );

  useEffect(() => {
    if (!open) return;
    const v = valueDate ?? minDate;
    if (v) {
      setViewYear(v.getFullYear());
      setViewMonthIndex(v.getMonth());
    }
  }, [open, valueDate, minDate]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const monthLabel = useMemo(
    () =>
      new Date(viewYear, viewMonthIndex, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [viewYear, viewMonthIndex],
  );

  const canPrevMonth = useMemo(() => {
    if (!minDate) return true;
    if (viewYear > minDate.getFullYear()) return true;
    if (viewYear === minDate.getFullYear() && viewMonthIndex > minDate.getMonth()) return true;
    return false;
  }, [minDate, viewYear, viewMonthIndex]);

  const prevMonth = () => {
    if (!canPrevMonth) return;
    if (viewMonthIndex === 0) {
      setViewMonthIndex(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonthIndex((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonthIndex === 11) {
      setViewMonthIndex(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonthIndex((m) => m + 1);
    }
  };

  const dim = daysInMonth(viewYear, viewMonthIndex);
  const pad = monthStartsOnWeekday(viewYear, viewMonthIndex);
  const cells: ({ day: number; iso: string } | 'pad')[] = [];
  for (let i = 0; i < pad; i++) cells.push('pad');
  for (let day = 1; day <= dim; day++) {
    const iso = toISODateLocal(new Date(viewYear, viewMonthIndex, day));
    cells.push({ day, iso });
  }

  const isDisabled = (iso: string) => (minDate ? iso < min : false);

  const displayValue = valueDate
    ? valueDate.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Choose a date…';

  const todayIso = toISODateLocal(new Date());

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={gridId}
        onClick={() => setOpen((o) => !o)}
        className="loma-booking-trigger flex w-full min-h-12 items-center justify-between gap-3 rounded-xl border border-deep-sea-blue/15 bg-sand-tan/40 px-4 py-3 text-left text-deep-sea-blue shadow-sm transition-colors hover:border-sunset-pink/35 hover:bg-sand-tan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2"
      >
        <span className={`font-medium tabular-nums ${valueDate ? '' : 'text-deep-sea-brown/45'}`}>{displayValue}</span>
        <Calendar size={20} className="shrink-0 text-deep-sea-blue/50" aria-hidden />
      </button>
      {open && minDate && (
        <div
          id={gridId}
          role="dialog"
          aria-label="Choose date"
          className="absolute z-[70] mt-2 w-[min(100%,19rem)] rounded-2xl border border-deep-sea-blue/15 bg-sand-tan p-3 shadow-xl shadow-deep-sea-blue/15 ring-1 ring-deep-sea-blue/5"
        >
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canPrevMonth}
              className="flex min-h-10 min-w-10 items-center justify-center rounded-full border border-deep-sea-blue/15 text-deep-sea-blue transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <span className="font-serif text-base italic text-deep-sea-blue">{monthLabel}</span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex min-h-10 min-w-10 items-center justify-center rounded-full border border-deep-sea-blue/15 text-deep-sea-blue transition-colors hover:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink"
              aria-label="Next month"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-deep-sea-brown/55">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1" role="grid">
            {cells.map((cell, idx) =>
              cell === 'pad' ? (
                <div key={`pad-${idx}`} className="aspect-square" />
              ) : (
                <button
                  key={cell.iso}
                  type="button"
                  role="gridcell"
                  disabled={isDisabled(cell.iso)}
                  onClick={() => {
                    if (isDisabled(cell.iso)) return;
                    onChange(cell.iso);
                    setOpen(false);
                  }}
                  className={`flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink ${
                    isDisabled(cell.iso)
                      ? 'cursor-not-allowed text-deep-sea-brown/25'
                      : 'text-deep-sea-blue hover:bg-white/65'
                  } ${
                    cell.iso === value
                      ? 'bg-sunset-pink text-white shadow-md hover:bg-sunset-pink'
                      : cell.iso === todayIso && cell.iso !== value
                        ? 'ring-1 ring-deep-sea-blue/25 ring-offset-1 ring-offset-sand-tan'
                        : ''
                  }`}
                >
                  {cell.day}
                </button>
              ),
            )}
          </div>
          <div className="mt-3 flex justify-center gap-3 border-t border-deep-sea-blue/10 pt-3">
            <button
              type="button"
              className="text-xs font-bold uppercase tracking-widest text-deep-sea-blue/70 hover:text-sunset-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink rounded-sm px-2 min-h-[2.25rem]"
              onClick={() => {
                setOpen(false);
              }}
            >
              Close
            </button>
            {!isDisabled(todayIso) && (
              <button
                type="button"
                className="text-xs font-bold uppercase tracking-widest text-sunset-pink hover:text-deep-sea-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink rounded-sm px-2 min-h-[2.25rem]"
                onClick={() => {
                  onChange(todayIso);
                  setOpen(false);
                }}
              >
                Today
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
