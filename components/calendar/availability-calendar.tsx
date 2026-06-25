'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CalendarView, CalendarDateInfo, DateStatus, MonthAvailability, BookingWithOperator } from '@/types'
import { apiGetMonthAvailability, apiGetGuideMonthBookings } from '@/lib/api'
import { MonthView } from './month-view'
import { WeekView } from './week-view'
import { ListView } from './list-view'
import { DateDialog } from './date-dialog'
import { RecurringSchedule } from './recurring-schedule'
import { CalendarToolbar } from './calendar-toolbar'
import { formatDate, addMonths, addWeeks } from './date-utils'
import { CalendarDays, RefreshCw } from 'lucide-react'

interface AvailabilityCalendarProps {
  compact?: boolean
}

export function AvailabilityCalendar({ compact }: AvailabilityCalendarProps) {
  const [view, setView] = useState<CalendarView>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dates, setDates] = useState<Map<string, CalendarDateInfo>>(new Map())
  const [loading, setLoading] = useState(true)

  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null)
  const [selectedDateInfo, setSelectedDateInfo] = useState<CalendarDateInfo | null>(null)

  const [showRecurring, setShowRecurring] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const todayStr = new Date().toISOString().split('T')[0]

  const loadData = useCallback(async () => {
    setLoading(true)
    const [availRes, bookingsRes] = await Promise.all([
      apiGetMonthAvailability(year, month),
      apiGetGuideMonthBookings(year, month),
    ])

    if (availRes.ok && bookingsRes.ok) {
      const availability = availRes.data as MonthAvailability[]
      const bookings = bookingsRes.data as BookingWithOperator[]

      const availMap = new Map<string, MonthAvailability>()
      for (const a of availability) {
        availMap.set(a.date, a)
      }

      const bookingsByDate = new Map<string, BookingWithOperator[]>()
      for (const b of bookings) {
        const sd = new Date(b.start_date)
        const ed = new Date(b.end_date)
        for (let d = new Date(sd); d <= ed; d.setDate(d.getDate() + 1)) {
          const ds = d.toISOString().split('T')[0]
          if (!bookingsByDate.has(ds)) bookingsByDate.set(ds, [])
          bookingsByDate.get(ds)!.push(b)
        }
      }

      const daysInMonth = new Date(year, month, 0).getDate()
      const firstDay = new Date(year, month - 1, 1).getDay()

      const allDates = new Map<string, CalendarDateInfo>()

      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      const prevMonthDays = new Date(prevYear, prevMonth, 0).getDate()

      for (let i = firstDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i
        const dateStr = formatDate(prevYear, prevMonth, day)
        allDates.set(dateStr, {
          date: dateStr,
          day,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          status: null,
          availabilityStatus: null,
          notes: '',
          bookings: [],
        })
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(year, month, day)
        const avail = availMap.get(dateStr)
        const dayBookings = bookingsByDate.get(dateStr) || []

        let status: DateStatus | null = null
        if (dayBookings.length > 0) {
          const hasAccepted = dayBookings.some((b) => b.status === 'accepted')
          const hasPending = dayBookings.some((b) => b.status === 'pending')
          if (hasAccepted) status = 'confirmed'
          else if (hasPending) status = 'pending'
        } else if (avail) {
          status = avail.status === 'free' ? 'available' : 'unavailable'
        }

        allDates.set(dateStr, {
          date: dateStr,
          day,
          isCurrentMonth: true,
          isToday: dateStr === todayStr,
          status,
          availabilityStatus: avail?.status as 'free' | 'close' | null,
          notes: avail?.notes || '',
          bookings: dayBookings.map((b) => ({
            id: b.id,
            operatorId: b.operator_id,
            operatorName: b.operator_name,
            status: b.status,
            startDate: b.start_date,
            endDate: b.end_date,
            dailyRate: b.daily_rate,
            message: b.message,
          })),
        })
      }

      const remaining = 42 - firstDay - daysInMonth
      const nextMonth = month === 12 ? 1 : month + 1
      const nextYear = month === 12 ? year + 1 : year
      for (let day = 1; day <= remaining; day++) {
        const dateStr = formatDate(nextYear, nextMonth, day)
        allDates.set(dateStr, {
          date: dateStr,
          day,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          status: null,
          availabilityStatus: null,
          notes: '',
          bookings: [],
        })
      }

      setDates(allDates)
    }
    setLoading(false)
  }, [year, month, todayStr])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleDateClick(dateStr: string, info: CalendarDateInfo | null) {
    setSelectedDateStr(dateStr)
    setSelectedDateInfo(info)
    setDateDialogOpen(true)
  }

  function handlePrev() {
    if (view === 'week') setCurrentDate(addWeeks(currentDate, -1))
    else setCurrentDate(addMonths(currentDate, -1))
  }

  function handleNext() {
    if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else setCurrentDate(addMonths(currentDate, 1))
  }

  function handleToday() {
    setCurrentDate(new Date())
  }

  return (
    <div className="space-y-4">
      <CalendarToolbar
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onAddRecurring={() => setShowRecurring(!showRecurring)}
      />

      {showRecurring && (
        <RecurringSchedule onClose={() => setShowRecurring(false)} />
      )}

      <div className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl overflow-hidden shadow-card">
        {!compact && (
          <div className="flex items-center gap-2 px-5 pt-4 pb-2">
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-500">Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-slate-500">Unavailable</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="text-slate-500">Pending</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-500">Confirmed</span>
              </span>
            </div>
            <button
              onClick={loadData}
              className="ml-auto p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}

        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-[2px]">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-[72px] sm:h-[88px] bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {view === 'month' && (
                <MonthView
                  year={year}
                  month={month}
                  dates={dates}
                  onDateClick={handleDateClick}
                />
              )}
              {view === 'week' && (
                <WeekView
                  currentDate={currentDate}
                  dates={dates}
                  onDateClick={handleDateClick}
                />
              )}
              {view === 'list' && (
                <ListView
                  dates={dates}
                  onDateClick={handleDateClick}
                />
              )}
            </>
          )}
        </div>
      </div>

      <DateDialog
        open={dateDialogOpen}
        onOpenChange={setDateDialogOpen}
        dateStr={selectedDateStr}
        dateInfo={selectedDateInfo}
        onSaved={loadData}
      />
    </div>
  )
}
