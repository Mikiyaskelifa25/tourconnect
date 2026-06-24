'use client'

import type { CalendarDateInfo, DateStatus } from '@/types'
import { formatDateDisplay } from './date-utils'

interface ListViewProps {
  dates: Map<string, CalendarDateInfo>
  onDateClick: (date: string, info: CalendarDateInfo | null) => void
}

const STATUS_CONFIG: Record<DateStatus, { dot: string; bg: string; text: string; label: string }> = {
  available: { dot: 'bg-green-500', bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'Available' },
  unavailable: { dot: 'bg-red-500', bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Unavailable' },
  pending: { dot: 'bg-yellow-500', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', label: 'Pending Booking' },
  confirmed: { dot: 'bg-blue-500', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Confirmed Tour' },
}

export function ListView({ dates, onDateClick }: ListViewProps) {
  const sorted = Array.from(dates.entries())
    .filter(([_, info]) => info.isCurrentMonth)
    .sort(([a], [b]) => a.localeCompare(b))

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold">No dates in this view</p>
        <p className="text-xs mt-1">Add availability to see it here</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {sorted.map(([dateStr, info]) => {
        const status = info.status
        const config = status ? STATUS_CONFIG[status] : null

        return (
          <button
            key={dateStr}
            onClick={() => onDateClick(dateStr, info)}
            className={`
              w-full flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-150 text-left
              ${config ? config.bg : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'}
              ${info.isToday ? 'ring-2 ring-green-500/20' : ''}
            `}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-2 h-2 rounded-full shrink-0 ${config ? config.dot : 'bg-slate-200'}`} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800">
                    {formatDateDisplay(dateStr)}
                  </span>
                  {info.isToday && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-0.5">
                  {status && (
                    <span className={`text-[11px] font-semibold ${config!.text}`}>
                      {config!.label}
                    </span>
                  )}
                </div>

                {info.notes && (
                  <p className="text-[11px] text-slate-500 mt-1 truncate">{info.notes}</p>
                )}
              </div>

              {info.bookings.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  {info.bookings.slice(0, 2).map((b) => (
                    <span
                      key={b.id}
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        b.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : b.status === 'accepted'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {b.operatorName}
                    </span>
                  ))}
                  {info.bookings.length > 2 && (
                    <span className="text-[10px] text-slate-400 font-bold">
                      +{info.bookings.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
