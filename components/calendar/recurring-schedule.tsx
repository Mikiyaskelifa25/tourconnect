'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toastSuccess, toastInfo } from '@/lib/toast'
import { DAY_NAMES_FULL } from './date-utils'
import { Repeat, Sun, Briefcase, X } from 'lucide-react'

const PATTERNS = [
  { value: 'weekdays' as const, label: 'Weekdays', icon: Briefcase, desc: 'Monday - Friday' },
  { value: 'weekends' as const, label: 'Weekends', icon: Sun, desc: 'Saturday & Sunday' },
  { value: 'custom' as const, label: 'Custom', icon: Repeat, desc: 'Pick specific days' },
]

interface RecurringScheduleProps {
  onClose: () => void
}

export function RecurringSchedule({ onClose }: RecurringScheduleProps) {
  const [pattern, setPattern] = useState<'weekdays' | 'weekends' | 'custom'>('weekdays')
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  function handlePatternChange(newPattern: typeof pattern) {
    setPattern(newPattern)
    if (newPattern === 'weekdays') setSelectedDays([1, 2, 3, 4, 5])
    else if (newPattern === 'weekends') setSelectedDays([0, 6])
  }

  function handleSave() {
    const dayNames = selectedDays.map((d) => DAY_NAMES_FULL[d]).join(', ')
    toastSuccess({
      title: 'Recurring Schedule Saved',
      description: `${pattern.charAt(0).toUpperCase() + pattern.slice(1)} - ${dayNames}`,
    })
    toastInfo({
      title: 'Coming Soon',
      description: 'Full recurring schedule backend integration will be available in the next update.',
    })
    onClose()
  }

  return (
    <div className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl overflow-hidden shadow-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-purple-50 p-2 rounded-xl">
            <Repeat className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Recurring Schedule</h3>
            <p className="text-[11px] text-slate-500">Set a repeating availability pattern</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div className="space-y-2">
          <Label>Recurring Pattern</Label>
          <div className="grid grid-cols-3 gap-2">
            {PATTERNS.map((p) => {
              const Icon = p.icon
              const active = pattern === p.value
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handlePatternChange(p.value)}
                  className={`
                    flex flex-col items-center gap-1.5 p-3 rounded-xl border-[1.5px] transition-all
                    ${active ? 'border-purple-400 bg-purple-50 shadow-sm' : 'border-slate-200 bg-white/60 text-slate-500 hover:border-slate-300'}
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-bold ${active ? 'text-purple-700' : 'text-slate-600'}`}>
                    {p.label}
                  </span>
                  <span className="text-[8px] text-slate-400">{p.desc}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Days of Week</Label>
          <div className="flex gap-1.5">
            {DAY_NAMES_FULL.map((name, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                disabled={pattern !== 'custom'}
                className={`
                  flex-1 aspect-square rounded-xl text-[10px] font-bold border-[1.5px] transition-all
                  ${selectedDays.includes(i)
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'border-slate-200 text-slate-400 bg-white/60'
                  }
                  ${pattern !== 'custom' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-purple-200'}
                `}
              >
                {name.slice(0, 2)}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          className="w-full"
          onClick={handleSave}
        >
          <Repeat className="w-4 h-4" />
          Save Recurring Schedule
        </Button>
      </div>
    </div>
  )
}
