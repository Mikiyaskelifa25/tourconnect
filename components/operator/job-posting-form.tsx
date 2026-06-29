'use client'

import { useState } from 'react'
import { Briefcase, MapPin, DollarSign, CalendarRange, Globe, X } from 'lucide-react'
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
import { apiCreateJobPosting } from '@/lib/api'
import { toastSuccess, toastError } from '@/lib/toast'

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'Amharic' },
  { code: 'om', label: 'Oromo' },
  { code: 'ti', label: 'Tigrinya' },
  { code: 'so', label: 'Somali' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'es', label: 'Spanish' },
  { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
]

interface JobPostingFormProps {
  open: boolean
  onClose: () => void
}

export function JobPostingForm({ open, onClose }: JobPostingFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dailyRate, setDailyRate] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function toggleLanguage(code: string) {
    setLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (languages.length === 0) {
      toastError({ title: 'Languages Required', description: 'Select at least one language' })
      return
    }
    setLoading(true)

    try {
      const res = await apiCreateJobPosting({
        title,
        description,
        location,
        startDate,
        endDate,
        dailyRate: dailyRate ? Number(dailyRate) : 0,
        languagesRequired: languages,
      })

      if (res.ok) {
        toastSuccess({ title: 'Job Posted', description: 'Your job listing is now live for guides to see' })
        onClose()
        setTitle('')
        setDescription('')
        setLocation('')
        setStartDate('')
        setEndDate('')
        setDailyRate('')
        setLanguages([])
      } else {
        toastError({ title: 'Failed to Post', description: (res.data as { error: string }).error || 'Could not create job posting' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 overflow-hidden border-0 max-w-lg max-sm:mx-2">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-3.5 sm:p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Post a Job
                  </DialogTitle>
                  <p className="text-emerald-100 text-xs mt-0.5">Find the perfect guide for your tour</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogDescription className="sr-only">
          Create a new job posting for tour guides
        </DialogDescription>

        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-5 bg-white max-h-[65vh] overflow-y-auto">
          <div className="space-y-1.5">
            <Label htmlFor="job-title" className="flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 text-slate-400" />
              Job Title
            </Label>
            <Input
              id="job-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. English-Speaking Guide for Lalibela Tour"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="job-description" className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-slate-400" />
              Description
            </Label>
            <Textarea
              id="job-description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the tour, group size, duration, special requirements..."
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="job-location" className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              Location
            </Label>
            <Input
              id="job-location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lalibela, Bahir Dar, Addis Ababa"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="job-start-date" className="flex items-center gap-1.5">
                <CalendarRange className="w-3 h-3 text-slate-400" />
                Start Date
              </Label>
              <Input
                id="job-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job-end-date" className="flex items-center gap-1.5">
                <CalendarRange className="w-3 h-3 text-slate-400" />
                End Date
              </Label>
              <Input
                id="job-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="job-rate" className="flex items-center gap-1.5">
              <DollarSign className="w-3 h-3 text-slate-400" />
              Daily Rate (USD)
            </Label>
            <Input
              id="job-rate"
              type="number"
              min="0"
              step="0.01"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              placeholder="e.g. 100"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-slate-400" />
              Languages Required
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => toggleLanguage(lang.code)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                    languages.includes(lang.code)
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-h-[44px] sm:min-h-0"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 min-h-[44px] sm:min-h-0 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-emerald-600"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting…
                </span>
              ) : (
                <>
                  <Briefcase className="w-4 h-4" />
                  Post Job
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
