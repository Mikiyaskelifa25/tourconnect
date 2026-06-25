'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiUpsertAvailability } from '@/lib/api'
import { toastSuccess, toastError } from '@/lib/toast'
import { formatDateDisplay } from './date-utils'
import { X, CalendarDays, FileText, CheckCircle2, Ban, User } from 'lucide-react'
import type { CalendarDateInfo, DateStatus } from '@/types'

interface DateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dateStr: string | null
  dateInfo: CalendarDateInfo | null
  onSaved: () => void
}

const STATUS_ACTIONS = [
  { value: 'free' as const, label: 'Mark Available', icon: CheckCircle2, color: 'green', desc: 'Open for tours' },
  { value: 'close' as const, label: 'Mark Unavailable', icon: Ban, color: 'red', desc: 'Not available' },
]

export function DateDialog({ open, onOpenChange, dateStr, dateInfo, onSaved }: DateDialogProps) {
  const [status, setStatus] = useState<'free' | 'close'>('free')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && dateInfo) {
      setStatus(dateInfo.availabilityStatus || 'free')
      setNotes(dateInfo.notes || '')
    } else if (open) {
      setStatus('free')
      setNotes('')
    }
  }, [open, dateInfo])

  if (!dateStr) return null

  async function handleSave() {
    if (!dateStr) return
    setLoading(true)
    try {
      const res = await apiUpsertAvailability(
        dateStr,
        status,
        notes
      )
      if (res.ok) {
        toastSuccess({
          title: 'Availability Updated',
          description: `${formatDateDisplay(dateStr)} marked as ${status === 'free' ? 'available' : 'unavailable'}`,
        })
        onSaved()
        onOpenChange(false)
      } else {
        toastError({
          title: 'Update Failed',
          description: (res.data as { error: string }).error || 'Could not update',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const existingStatus = dateInfo?.status

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle className="text-lg font-black tracking-tight">
              {formatDateDisplay(dateStr)}
            </DialogTitle>
          </div>
          <DialogClose className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </DialogClose>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {existingStatus && (
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-2.5">
              <span className="font-medium">Current:</span>
              <span className={`inline-flex items-center gap-1.5 font-bold ${
                existingStatus === 'available' ? 'text-blue-600' :
                existingStatus === 'unavailable' ? 'text-red-600' :
                existingStatus === 'pending' ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  existingStatus === 'available' ? 'bg-blue-500' :
                  existingStatus === 'unavailable' ? 'bg-red-500' :
                  existingStatus === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                {existingStatus.charAt(0).toUpperCase() + existingStatus.slice(1)}
              </span>
            </div>
          )}

          {dateInfo?.bookings && dateInfo.bookings.length > 0 && (
            <div className="space-y-2">
              <Label>Bookings on this date</Label>
              {dateInfo.bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
                >
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{b.operatorName}</p>
                    <p className="text-[11px] text-slate-500">
                      {b.status} &middot; ${b.dailyRate}/day
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    b.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : b.status === 'accepted'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label>Set Availability</Label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_ACTIONS.map((action) => {
                const Icon = action.icon
                const selected = status === action.value
                return (
                  <button
                    key={action.value}
                    type="button"
                    onClick={() => setStatus(action.value)}
                    className={`
                      flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-[1.5px] transition-all
                      ${selected && action.value === 'free'
                        ? 'border-blue-400 bg-blue-50 shadow-sm'
                        : selected && action.value === 'close'
                        ? 'border-red-400 bg-red-50 shadow-sm'
                        : 'border-slate-200 bg-white/60 text-slate-500 hover:border-slate-300'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${
                      selected && action.value === 'free' ? 'text-blue-600' :
                      selected && action.value === 'close' ? 'text-red-600' :
                      'text-slate-400'
                    }`} />
                    <span className={`text-xs font-bold ${
                      selected && action.value === 'free' ? 'text-blue-700' :
                      selected && action.value === 'close' ? 'text-red-700' :
                      'text-slate-600'
                    }`}>
                      {action.label}
                    </span>
                    <span className="text-[9px] text-slate-400">{action.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                Notes
              </div>
            </Label>
            <Textarea
              placeholder="Add notes about your availability..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
