'use client'

import { useMemo } from 'react'
import type { CalendarDateInfo, DateStatus } from '@/types'
import { DAY_NAMES_FULL, getWeekDates, formatDate, isToday } from './date-utils'

interface WeekViewProps {
  currentDate: Date
  dates: Map<string, CalendarDateInfo>
  onDateClick: (date: string, info: CalendarDateInfo | null) => void
}

const STATUS_STYLES: Record<DateStatus, { bg: string; dot: string; label: string }> = {
  available: { bg: 'bg-blue-50 border-blue-300', dot: 'bg-blue-500', label: 'Available' },
  unavailable: { bg: 'bg-red-50 border-red-300', dot: 'bg-red-500', label: 'Unavailable' },
  pending: { bg: 'bg-yellow-50 border-yellow-300', dot: 'bg-yellow-500', label: 'Pending' },
  confirmed: { bg: 'bg-blue-50 border-blue-300', dot: 'bg-blue-500', label: 'Confirmed' },
}

export function WeekView({ currentDate, dates, onDateClick }: WeekViewProps) {
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const dateStr = formatDate(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
          )
          const info = dates.get(dateStr)
          const status = info?.status || null
          const style = status ? STATUS_STYLES[status] : null
          const isDateToday = isToday(date.getFullYear(), date.getMonth() + 1, date.getDate())

          return (
            <button
              key={dateStr}
              onClick={() => onDateClick(dateStr, info || null)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all min-h-[120px]
                ${style ? style.bg : 'bg-white border-slate-100 hover:border-slate-200'}
                ${isDateToday ? 'ring-2 ring-blue-500/20' : ''}
              `}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDateToday ? 'text-blue-600' : 'text-slate-400'}`}>
                {DAY_NAMES_FULL[date.getDay()].slice(0, 3)}
              </span>
              <span className={`text-2xl font-black ${isDateToday ? 'text-blue-600' : 'text-slate-800'}`}>
                {date.getDate()}
              </span>
              {status && (
                <div className={`flex items-center gap-1.5 mt-1 ${style!.bg.split(' ')[0]} px-3 py-1.5 rounded-full border ${style!.bg.split(' ')[1]}`}>
                  <div className={`w-2 h-2 rounded-full ${style!.dot}`} />
                  <span className="text-[10px] font-bold text-slate-600">{style!.label}</span>
                </div>
              )}
              {info?.notes && (
                <span className="text-[10px] text-slate-400 text-center line-clamp-2 mt-1">{info.notes}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
