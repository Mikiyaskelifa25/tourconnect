'use client'

import type { CalendarView } from '@/types'
import { MONTH_NAMES } from './date-utils'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

interface CalendarToolbarProps {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  currentDate: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onAddRecurring: () => void
}

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'list', label: 'List' },
]

export function CalendarToolbar({
  view,
  onViewChange,
  currentDate,
  onPrev,
  onNext,
  onToday,
  onAddRecurring,
}: CalendarToolbarProps) {
  const monthName = MONTH_NAMES[currentDate.getMonth()]
  const year = currentDate.getFullYear()

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrev}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all border border-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNext}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all border border-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
          {monthName} {year}
        </h2>

        <button
          onClick={onToday}
          className="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all border border-green-200"
        >
          Today
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              onClick={() => onViewChange(v.value)}
              className={`
                px-3.5 py-1.5 text-xs font-bold rounded-[10px] transition-all
                ${view === v.value
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              {v.label}
            </button>
          ))}
        </div>

        <button
          onClick={onAddRecurring}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all border border-purple-200"
        >
          <Plus className="w-3 h-3" />
          Recurring
        </button>
      </div>
    </div>
  )
}
