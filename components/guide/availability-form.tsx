'use client'

import { useState } from 'react'
import { CalendarRange, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiUpdateAvailability } from '@/lib/api'
import { toastSuccess, toastError } from '@/lib/toast'
const STATUS_OPTIONS = [
  { value: 'free', label: 'Open / Available', icon: '🟢', color: 'green' },
  { value: 'close', label: 'Close / Busy', icon: '🔴', color: 'red' },
] as const

interface AvailabilityFormProps {
  onStatusChange?: () => void
}

export function AvailabilityForm({ onStatusChange }: AvailabilityFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState<'free' | 'close'>('free')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await apiUpdateAvailability(null, { date, status, notes: '' })
      if (res.ok) {
        toastSuccess({ title: 'Status Updated', description: `Set as "${status}" for ${date}` })
        setSuccess(true)
        onStatusChange?.()
        setTimeout(() => setSuccess(false), 2500)
      } else {
        toastError({ title: 'Update Failed', description: (res.data as { error: string }).error || 'Could not update status' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
        <div className="bg-indigo-50 p-2 rounded-xl">
          <CalendarRange className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Open/Close Status</h3>
          <p className="text-[11px] text-slate-500">Manage your daily availability</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="avail-date">Calendar Date</Label>
          <Input
            id="avail-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Availability Status</Label>
          <div className="grid grid-cols-1 gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] text-sm font-bold transition-all duration-200 text-left ${
                  status === opt.value
                    ? opt.value === 'free'
                      ? 'border-blue-400 bg-blue-50 text-blue-800 shadow-sm'
                      : 'border-red-400 bg-red-50 text-red-800 shadow-sm'
                    : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300 hover:bg-white'
                }`}
                id={`avail-status-${opt.value}`}
              >
                <span className="text-base">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          variant={success ? 'primary' : 'default'}
          className="w-full h-10"
          disabled={loading}
          id="avail-submit-btn"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </span>
          ) : success ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Updated!
            </>
          ) : (
            <>
              <CalendarRange className="w-4 h-4" />
              Update Date Slot
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
