'use client'

import { useState, useEffect, useMemo } from 'react'
import { Handshake, CalendarRange, FileText, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { apiSendHireRequest, apiCheckGuideAvailabilityRange } from '@/lib/api'
import { toastSuccess, toastError } from '@/lib/toast'
import type { GuideResult } from '@/types'

interface HireModalProps {
  guide: GuideResult
  open: boolean
  onClose: () => void
}

function generateDateRange(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start + 'T00:00:00')
  const last = new Date(end + 'T00:00:00')
  while (current <= last) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

export function HireModal({ guide, open, onClose }: HireModalProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [availabilityCheck, setAvailabilityCheck] = useState<{
    checking: boolean
    unavailableDates: string[]
  }>({ checking: false, unavailableDates: [] })

  async function checkAvailability() {
    if (!startDate || !endDate) return
    setAvailabilityCheck((prev) => ({ ...prev, checking: true }))
    const res = await apiCheckGuideAvailabilityRange(guide.id, startDate, endDate)
    if (res.ok) {
      const unavailable = res.data
        .filter((d) => !d.available)
        .map((d) => d.date)
      setAvailabilityCheck({ checking: false, unavailableDates: unavailable })
    } else {
      setAvailabilityCheck({ checking: false, unavailableDates: [] })
    }
  }

  useEffect(() => {
    if (!open) {
      setStartDate('')
      setEndDate('')
      setMessage('')
      setAvailabilityCheck({ checking: false, unavailableDates: [] })
    }
  }, [open])

  useEffect(() => {
    if (startDate && endDate && startDate <= endDate) {
      checkAvailability()
    } else {
      setAvailabilityCheck({ checking: false, unavailableDates: [] })
    }
  }, [startDate, endDate, guide.id])

  const dateCount = useMemo(() => {
    if (!startDate || !endDate) return 0
    return generateDateRange(startDate, endDate).length
  }, [startDate, endDate])

  const hasUnavailable = availabilityCheck.unavailableDates.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hasUnavailable) {
      toastError({
        title: 'Date Conflicts',
        description: `${availabilityCheck.unavailableDates.length} selected date(s) are unavailable. Please adjust your dates.`,
      })
      return
    }
    setLoading(true)

    try {
      const res = await apiSendHireRequest(null, {
        guideId: guide.id,
        startDate,
        endDate,
        message,
        dailyRate: 0,
      })

      if (res.ok) {
        toastSuccess({ title: 'Contract Sent', description: `Your hire proposal has been sent to ${guide.name}.` })
        onClose()
        setStartDate('')
        setEndDate('')
        setMessage('')
        setAvailabilityCheck({ checking: false, unavailableDates: [] })
      } else {
        toastError({ title: 'Failed to Send', description: (res.data as { error: string }).error || 'Could not send hire request' })
      }
    } finally {
      setLoading(false)
    }
  }

  const initials = guide.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 overflow-hidden border-0 max-w-lg max-sm:mx-2">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3.5 sm:p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Handshake className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Draft Contract
                  </DialogTitle>
                  <p className="text-blue-100 text-xs mt-0.5">Send an official hire proposal</p>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 flex items-center gap-2.5 sm:gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-white/30">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/30 flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate">{guide.name}</p>
                <p className="text-[10px] sm:text-[11px] text-blue-100 truncate">{guide.email}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogDescription className="sr-only">
          Draft a hire contract for {guide.name}
        </DialogDescription>

        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-5 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hire-start-date" className="flex items-center gap-1.5">
                <CalendarRange className="w-3 h-3 text-slate-400" />
                Start Date
              </Label>
              <Input
                id="hire-start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hire-end-date" className="flex items-center gap-1.5">
                <CalendarRange className="w-3 h-3 text-slate-400" />
                End Date
              </Label>
              <Input
                id="hire-end-date"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Availability Status */}
          {startDate && endDate && startDate <= endDate && (
            <div className={`rounded-xl p-3 border ${
              availabilityCheck.checking
                ? 'bg-slate-50 border-slate-200'
                : hasUnavailable
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {availabilityCheck.checking ? (
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                  ) : hasUnavailable ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      {availabilityCheck.checking ? 'Checking availability...' :
                       hasUnavailable ? 'Date Conflict Detected' : 'All Dates Available'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {dateCount} day{dateCount !== 1 ? 's' : ''} in range
                      {hasUnavailable && ` · ${availabilityCheck.unavailableDates.length} unavailable`}
                    </p>
                  </div>
                </div>
                {hasUnavailable && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                    {Math.round((availabilityCheck.unavailableDates.length / dateCount) * 100)}% conflict
                  </span>
                )}
              </div>
              {hasUnavailable && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {availabilityCheck.unavailableDates.slice(0, 5).map((d) => (
                    <span key={d} className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  ))}
                  {availabilityCheck.unavailableDates.length > 5 && (
                    <span className="text-[10px] text-red-500 px-1 py-0.5">
                      +{availabilityCheck.unavailableDates.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="hire-message" className="flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-slate-400" />
              Tour Instructions & Details
            </Label>
            <Textarea
              id="hire-message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Seeking expert trekker for 4 adults to Semien Mountains, 5 days, English-speaking..."
              rows={3}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-h-[44px] sm:min-h-0"
              onClick={onClose}
              id="hire-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 min-h-[44px] sm:min-h-0"
              disabled={loading || hasUnavailable}
              id="hire-submit-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending…
                </span>
              ) : (
                <>
                  <Handshake className="w-4 h-4" />
                  Send Contract
                </>
              )}
            </Button>
          </div>

          {hasUnavailable && (
            <div className="flex items-start gap-2 text-[10px] text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
              <span>Remove conflicting dates or choose different dates before sending.</span>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
