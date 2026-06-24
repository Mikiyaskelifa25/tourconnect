'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { GuideResult } from '@/types'
import type { DateRange } from 'react-day-picker'
import { apiGetGuideUnavailableDates, apiCheckGuideAvailabilityRange } from '@/lib/api'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Loader2, XCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OperatorCalendarViewProps {
  guide: GuideResult
}

function fmt(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function OperatorCalendarView({ guide }: OperatorCalendarViewProps) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])

  const [loading, setLoading] = useState(true)
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  const [dateRange, setDateRange] = useState<DateRange>()
  const [availabilityResult, setAvailabilityResult] = useState<{
    checking: boolean
    conflicts: string[]
    allAvailable: boolean
  }>({ checking: false, conflicts: [], allAvailable: false })

  const unavailableSet = useMemo(() => new Set(unavailableDates.map(fmt)), [unavailableDates])

  useEffect(() => {
    apiGetGuideUnavailableDates(guide.id).then((res) => {
      if (res.ok) setUnavailableDates(res.data.map((d: string) => new Date(d + 'T00:00:00')))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [guide.id])

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) {
      setAvailabilityResult({ checking: false, conflicts: [], allAvailable: false })
      return
    }
    const from = dateRange.from
    const to = dateRange.to
    let cancelled = false
    async function check() {
      setAvailabilityResult((p) => ({ ...p, checking: true }))
      try {
        const res = await apiCheckGuideAvailabilityRange(guide.id, fmt(from), fmt(to))
        if (cancelled) return
        if (res.ok) {
          const conflicts = res.data.filter((d) => !d.available).map((d) => d.date)
          setAvailabilityResult({ checking: false, conflicts, allAvailable: conflicts.length === 0 })
        } else {
          setAvailabilityResult({ checking: false, conflicts: [], allAvailable: false })
        }
      } catch {
        if (!cancelled) setAvailabilityResult({ checking: false, conflicts: [], allAvailable: false })
      }
    }
    check()
    return () => { cancelled = true }
  }, [dateRange?.from, dateRange?.to, guide.id])

  const dateCount = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0
    return Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }, [dateRange])

  const isDisabled = useCallback((date: Date) => {
    date.setHours(0, 0, 0, 0)
    return date < today || unavailableSet.has(fmt(date))
  }, [today, unavailableSet])

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-sky-50 to-white px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-sm shrink-0 ring-1 ring-sky-100">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">{guide.name}&apos;s Availability</h3>
            <p className="text-[11px] sm:text-xs text-slate-500">Select dates to check availability</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6">
        {dateRange?.from && dateRange?.to && (
          <div className={`mb-4 sm:mb-5 p-3 sm:p-4 rounded-lg border transition-colors ${
            availabilityResult.checking
              ? 'bg-slate-50 border-slate-200'
              : availabilityResult.allAvailable
              ? 'bg-green-50/80 border-green-200'
              : 'bg-red-50/80 border-red-200'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Selected Range</p>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  {dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' — '}
                  {dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  <span className="text-slate-400 font-normal ml-1.5">({dateCount} day{dateCount !== 1 ? 's' : ''})</span>
                </p>
              </div>
              {availabilityResult.checking ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-slate-400 shrink-0" />
              ) : availabilityResult.allAvailable ? (
                <Badge variant="primary" className="text-[11px]">Available</Badge>
              ) : (
                <Badge variant="destructive" className="text-[11px]">Conflict</Badge>
              )}
            </div>
            {!availabilityResult.checking && !availabilityResult.allAvailable && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs text-red-600">
                <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>{availabilityResult.conflicts.length} date{availabilityResult.conflicts.length !== 1 ? 's' : ''} unavailable</span>
              </div>
            )}
            {!availabilityResult.checking && availabilityResult.allAvailable && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs text-green-600">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>All dates in range are available</span>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 sm:py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="flex justify-center">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              disabled={isDisabled}
              modifiers={{ unavailable: unavailableDates }}
              navLayout="around"
              modifiersClassNames={{ unavailable: 'ring-2 ring-inset ring-red-300 bg-red-50 rounded-full' }}
              classNames={{
                month: 'flex flex-wrap items-center w-full gap-1 gap-y-3',
                month_caption: 'flex-1 flex items-center justify-center h-9',
                caption_label: 'text-sm font-bold text-slate-700',
                button_previous: 'flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-100 disabled:cursor-pointer',
                button_next: 'flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-100 disabled:cursor-pointer',
                month_grid: 'w-full basis-full border-collapse',
                week: 'flex w-full',
                weekday: 'w-9 sm:w-10 pt-2 pb-1.5 text-center text-xs font-semibold text-slate-400 tracking-wide',
                day: 'flex-1 text-center text-sm relative flex justify-center p-0',
                day_button: 'h-9 w-9 sm:h-10 sm:w-10 p-0 font-medium text-slate-700 aria-selected:opacity-100 hover:bg-slate-100 rounded-full transition-colors',
                selected: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:bg-emerald-600 rounded-full',
                range_start: 'rounded-full',
                range_end: 'rounded-full',
                range_middle: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded-none',
                today: 'ring-2 ring-emerald-400 ring-offset-1 font-bold text-emerald-700 rounded-full',
                disabled: 'text-slate-300 opacity-40 cursor-not-allowed',
                outside: 'text-slate-300 opacity-50',
              }}
              components={{
                Chevron: (props) => {
                  const cls = cn(
                    'size-5 rounded-md transition-colors',
                    props.disabled
                      ? 'text-slate-300'
                      : 'text-slate-500 hover:text-slate-700',
                    props.className
                  )
                  return props.orientation === 'left'
                    ? <ChevronLeft className={cls} strokeWidth={2.5} />
                    : <ChevronRight className={cls} strokeWidth={2.5} />
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
