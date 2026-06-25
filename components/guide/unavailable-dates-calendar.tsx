'use client'

import { useState, useEffect, useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import {
  CalendarDays,
  Plus,
  Save,
  RotateCcw,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  CalendarRange,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  apiGetMyUnavailableDates,
  apiReplaceUnavailableDates,
} from '@/lib/api'
import { toastSuccess, toastError } from '@/lib/toast'

function toDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDisplayDate(dateStr: string): string {
  const d = toDate(dateStr)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function generateDateRange(start: Date, end: Date): string[] {
  const dates: string[] = []
  const current = new Date(start)
  while (current <= end) {
    dates.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

export function UnavailableDatesCalendar() {
  const [savedDates, setSavedDates] = useState<string[]>([])
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')
  const [reason, setReason] = useState('')
  const [month, setMonth] = useState(new Date())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDates()
  }, [])

  async function loadDates() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGetMyUnavailableDates()
      if (res.ok) {
        const dates = res.data
        setSavedDates(dates)
        setSelectedDates(dates.map((d) => toDate(d)))
      } else {
        setError(res.data.error)
      }
    } catch {
      setError('Failed to load unavailable dates')
    } finally {
      setLoading(false)
    }
  }

  const savedDateSet = useMemo(
    () => new Set(savedDates),
    [savedDates]
  )

  const sortedSelected = useMemo(
    () =>
      [...selectedDates]
        .sort((a, b) => a.getTime() - b.getTime())
        .map((d) => formatDate(d)),
    [selectedDates]
  )

  const pendingDates = useMemo(
    () => sortedSelected.filter((d) => !savedDateSet.has(d)),
    [sortedSelected, savedDateSet]
  )

  const removedDates = useMemo(
    () => savedDates.filter((d) => !sortedSelected.includes(d)),
    [savedDates, sortedSelected]
  )

  const hasChanges = pendingDates.length > 0 || removedDates.length > 0

  function handleSelect(dates: Date[] | undefined) {
    if (dates) setSelectedDates(dates)
  }

  function handleAddRange() {
    if (!rangeStart || !rangeEnd) return
    const start = toDate(rangeStart)
    const end = toDate(rangeEnd)
    if (start > end) {
      toastError({ title: 'Invalid Range', description: 'Start date must be before end date' })
      return
    }
    const newDates = generateDateRange(start, end)
    const currentSet = new Set(sortedSelected)
    for (const d of newDates) {
      currentSet.add(d)
    }
    setSelectedDates(Array.from(currentSet).map((d) => toDate(d)))
    setRangeStart('')
    setRangeEnd('')
    toastSuccess({ title: 'Range Added', description: `${newDates.length} dates selected` })
  }

  function handleRemoveDate(dateStr: string) {
    setSelectedDates((prev) =>
      prev.filter((d) => formatDate(d) !== dateStr)
    )
  }

  function handleClearAll() {
    setSelectedDates([])
  }

  async function handleSave() {
    if (!hasChanges && sortedSelected.length === savedDates.length) return
    setSaving(true)
    setError(null)
    try {
      const res = await apiReplaceUnavailableDates(sortedSelected, reason || undefined)
      if (res.ok) {
        toastSuccess({
          title: 'Availability Updated',
          description: `${sortedSelected.length} unavailable date${sortedSelected.length !== 1 ? 's' : ''} saved`,
        })
        setReason('')
        await loadDates()
      } else {
        toastError({ title: 'Save Failed', description: res.data.error })
      }
    } catch {
      toastError({ title: 'Save Failed', description: 'An unexpected error occurred' })
    } finally {
      setSaving(false)
    }
  }

  const modifiers = useMemo(() => {
    const unavailable: Date[] = savedDates.map((d) => toDate(d))
    return { unavailable }
  }, [savedDates])

  const today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })()

  if (loading) {
    return (
      <div className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl shadow-card p-8">
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading calendar...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-rose-50 p-2 rounded-xl">
            <CalendarDays className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Manage Unavailable Dates</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select dates when you are not available for tours
            </p>
          </div>
        </div>
        <a
          href="/guide/unavailable-dates"
          className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all active:scale-[0.98]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Manage
        </a>
      </div>

      {error && (
        <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3 flex justify-center">
            <div>
              <style>{`
                .rdp-day_today {
                  font-weight: 700;
                  background-color: #dcfce7 !important;
                  color: #166534 !important;
                  border-radius: 0.75rem;
                }
                .rdp-day_selected {
                  background-color: #fef2f2 !important;
                  color: #dc2626 !important;
                  border-radius: 0.75rem;
                  font-weight: 700;
                }
                .rdp-day_selected:hover {
                  background-color: #fee2e2 !important;
                }
                .rdp-day_unavailable {
                  background-color: #fef2f2 !important;
                  color: #dc2626 !important;
                  border-radius: 0.75rem;
                  font-weight: 600;
                  position: relative;
                }
                .rdp-day_unavailable::after {
                  content: '';
                  position: absolute;
                  bottom: 2px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 5px;
                  height: 5px;
                  border-radius: 50%;
                  background-color: #dc2626;
                }
                .rdp-day_disabled {
                  color: #cbd5e1 !important;
                  cursor: not-allowed;
                }
                .rdp-root {
                  --rdp-accent-color: #dc2626;
                  --rdp-day-width: 44px;
                  --rdp-day-height: 44px;
                  --rdp-day-button-border-radius: 0.75rem;
                }
                @media (max-width: 640px) {
                  .rdp-root {
                    --rdp-day-width: 38px;
                    --rdp-day-height: 38px;
                  }
                }
              `}</style>
              <DayPicker
                mode="multiple"
                selected={selectedDates}
                onSelect={handleSelect}
                month={month}
                onMonthChange={setMonth}
                modifiers={modifiers}
                modifiersClassNames={{
                  unavailable: 'rdp-day_unavailable',
                }}
                disabled={{ before: today }}
                showOutsideDays={false}
              />
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 justify-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Unavailable
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-200 border border-rose-300" />
                  Selected
                </span>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Range Selection */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <CalendarRange className="w-3.5 h-3.5" />
                Add Date Range
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                    Start
                  </label>
                  <input
                    type="date"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                    End
                  </label>
                  <input
                    type="date"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleAddRange}
                disabled={!rangeStart || !rangeEnd}
                className="flex items-center justify-center gap-1.5 w-full h-9 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all active:scale-[0.98] disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Date Range
              </button>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Personal day, holiday..."
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Selected Dates List */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Selected Dates
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                  {sortedSelected.length}
                </span>
              </div>

              {sortedSelected.length === 0 ? (
                <div className="text-center py-6">
                  <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No dates selected</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    Click dates on the calendar or use the range picker
                  </p>
                </div>
              ) : (
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {sortedSelected.map((dateStr) => (
                    <div
                      key={dateStr}
                      className={cn(
                        'flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs border transition-all',
                        savedDateSet.has(dateStr)
                          ? 'bg-red-50 border-red-100 text-red-700'
                          : 'bg-rose-50 border-rose-100 text-rose-700'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {savedDateSet.has(dateStr) ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-red-400" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                        )}
                        <span className="font-medium truncate">
                          {formatDisplayDate(dateStr)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveDate(dateStr)}
                        className="p-1 hover:bg-white/60 rounded-lg transition-colors shrink-0 text-slate-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                disabled={selectedDates.length === 0}
                className="flex items-center justify-center gap-1.5 flex-1 h-10 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] bg-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All
              </button>
              <button
                onClick={handleSave}
                disabled={saving || (!hasChanges && sortedSelected.length === savedDates.length)}
                className="flex items-center justify-center gap-1.5 flex-1 h-10 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saving ? 'Saving...' : 'Save Dates'}
              </button>
            </div>

            {pendingDates.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>{pendingDates.length} new date{pendingDates.length !== 1 ? 's' : ''} to add</span>
              </div>
            )}
            {removedDates.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{removedDates.length} date{removedDates.length !== 1 ? 's' : ''} to remove</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
