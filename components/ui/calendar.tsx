'use client'

import * as React from 'react'
import { DayPicker, type DayPickerProps } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'space-y-4',
        month_caption: 'flex justify-center relative items-center h-9',
        caption_label: 'text-sm font-bold text-slate-700',
        nav: 'flex items-center gap-1',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 text-[11px] font-bold uppercase text-slate-400 pt-2 pb-1',
        week: 'flex w-full mt-1',
        day: 'flex-1 text-center text-sm p-0 relative',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal mx-auto aria-selected:opacity-100'
        ),
        outside: 'text-slate-300 opacity-50',
        range_start: 'rounded-l-xl',
        range_end: 'rounded-r-xl',
        selected: 'bg-green-600 text-white hover:bg-green-700 focus:bg-green-600',
        today: 'bg-green-50 text-green-700 font-bold',
        disabled: 'text-slate-300 opacity-50 cursor-not-allowed',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: (props) => (
          <svg
            {...props}
            className={cn('size-4 text-slate-500', props.className)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        ),
      }}
      {...props}
    />
  )
}

export { Calendar }
