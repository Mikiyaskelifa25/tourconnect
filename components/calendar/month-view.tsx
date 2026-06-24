'use client'

import { useMemo, useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import type { CalendarDateInfo, DateStatus } from '@/types'

interface MonthViewProps {
  year: number
  month: number
  dates: Map<string, CalendarDateInfo>
  onDateClick: (date: string, info: CalendarDateInfo | null) => void
}

export function MonthView({ year, month, dates, onDateClick }: MonthViewProps) {
  const [monthDate, setMonthDate] = useState<Date>(new Date(year, month - 1, 1))

  useEffect(() => {
    setMonthDate(new Date(year, month - 1, 1))
  }, [year, month])

  const modifiers = useMemo(() => {
    const available: Date[] = []
    const unavailable: Date[] = []
    const pending: Date[] = []
    const confirmed: Date[] = []

    dates.forEach((info, dateStr) => {
      if (!info.isCurrentMonth) return
      const d = new Date(dateStr + 'T00:00:00')
      switch (info.status) {
        case 'available': available.push(d); break
        case 'unavailable': unavailable.push(d); break
        case 'pending': pending.push(d); break
        case 'confirmed': confirmed.push(d); break
      }
    })

    return { available, unavailable, pending, confirmed }
  }, [dates])

  function handleDayClick(day: Date) {
    const dateStr = day.toISOString().split('T')[0]
    const info = dates.get(dateStr) || null
    onDateClick(dateStr, info)
  }

  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        month={monthDate}
        onMonthChange={setMonthDate}
        onDayClick={handleDayClick}
        modifiers={modifiers}
        modifiersClassNames={{
          available: 'rdp-available',
          unavailable: 'rdp-unavailable',
          pending: 'rdp-pending',
          confirmed: 'rdp-confirmed',
        }}
        className="[&_.rdp-available]:!bg-green-50 [&_.rdp-available]:!text-green-700 [&_.rdp-available]:!border-green-200 [&_.rdp-available_.rdp-day_button]:!bg-green-50 [&_.rdp-available_.rdp-day_button]:!text-green-700 [&_.rdp-available_.rdp-day_button]:!border-green-200 [&_.rdp-available_.rdp-day_button]:hover:!bg-green-100 [&_.rdp-unavailable]:!bg-red-50 [&_.rdp-unavailable]:!text-red-700 [&_.rdp-unavailable]:!border-red-200 [&_.rdp-unavailable_.rdp-day_button]:!bg-red-50 [&_.rdp-unavailable_.rdp-day_button]:!text-red-700 [&_.rdp-unavailable_.rdp-day_button]:hover:!bg-red-100 [&_.rdp-pending]:!bg-yellow-50 [&_.rdp-pending]:!text-yellow-700 [&_.rdp-pending]:!border-yellow-200 [&_.rdp-pending_.rdp-day_button]:!bg-yellow-50 [&_.rdp-pending_.rdp-day_button]:!text-yellow-700 [&_.rdp-pending_.rdp-day_button]:hover:!bg-yellow-100 [&_.rdp-confirmed]:!bg-blue-50 [&_.rdp-confirmed]:!text-blue-700 [&_.rdp-confirmed]:!border-blue-200 [&_.rdp-confirmed_.rdp-day_button]:!bg-blue-50 [&_.rdp-confirmed_.rdp-day_button]:!text-blue-700 [&_.rdp-confirmed_.rdp-day_button]:hover:!bg-blue-100"
      />
    </div>
  )
}
