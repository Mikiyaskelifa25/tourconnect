'use client'

import { useState, useEffect } from 'react'
import { Briefcase, MapPin, DollarSign, CalendarRange, Globe, Send, Building2, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { apiGetOpenJobPostings, apiApplyToJob } from '@/lib/api'
import { toastSuccess, toastError } from '@/lib/toast'
import type { JobPostingWithOperator } from '@/types'

export function AvailableJobs() {
  const [jobs, setJobs] = useState<JobPostingWithOperator[]>([])
  const [search, setSearch] = useState('')
  const [applyTarget, setApplyTarget] = useState<JobPostingWithOperator | null>(null)
  const [applyMessage, setApplyMessage] = useState('')
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    const res = await apiGetOpenJobPostings()
    if (res.ok) setJobs(res.data)
  }

  const filtered = search
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.location.toLowerCase().includes(search.toLowerCase()) ||
          j.description.toLowerCase().includes(search.toLowerCase())
      )
    : jobs

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!applyTarget) return
    setApplying(true)
    const res = await apiApplyToJob(applyTarget.id, applyMessage)
    if (res.ok) {
      toastSuccess({ title: 'Application Sent', description: `You have applied to "${applyTarget.title}"` })
      setApplyTarget(null)
      setApplyMessage('')
      loadJobs()
    } else {
      toastError({ title: 'Failed to Apply', description: (res.data as { error: string }).error || 'Could not submit application' })
    }
    setApplying(false)
  }

  return (
    <div
      className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 p-2 rounded-xl">
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Available Jobs</h3>
            <p className="text-[11px] text-slate-500">Tour opportunities from operators</p>
          </div>
        </div>
        {jobs.length > 0 && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {jobs.length} open
          </span>
        )}
      </div>

      <div className="px-4 sm:px-6 pt-3 sm:pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="Search jobs by title, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-0.5">
          {filtered.length > 0 ? (
            filtered.map((job) => (
              <div
                key={job.id}
                className="bg-slate-50/80 border border-emerald-100/50 rounded-xl p-4 space-y-3 hover:border-emerald-200/50 hover:bg-white transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 text-sm">{job.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {job.operator_name}
                    </p>
                  </div>
                  <Badge variant="success">Open</Badge>
                </div>

                {job.description && (
                  <p className="text-xs text-slate-600 bg-white border border-slate-100 p-2.5 rounded-lg leading-relaxed line-clamp-2">
                    {job.description}
                  </p>
                )}

                <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </span>
                  {job.daily_rate && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${job.daily_rate}/day
                    </span>
                  )}
                  {job.start_date && (
                    <span className="flex items-center gap-1">
                      <CalendarRange className="w-3 h-3" />
                      {job.start_date} {job.end_date ? `→ ${job.end_date}` : ''}
                    </span>
                  )}
                  {job.languages_required && job.languages_required.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {job.languages_required.join(', ')}
                    </span>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setApplyTarget(job)}
                  >
                    <Send className="w-3 h-3" />
                    Apply Now
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-400 border border-dashed border-emerald-200/40 rounded-xl bg-slate-50/50">
              <Briefcase className="w-8 h-8 opacity-50" />
              <p className="text-xs text-center">
                {search ? 'No jobs match your search.' : 'No job openings right now.<br />Check back later.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!applyTarget} onOpenChange={(open) => !open && setApplyTarget(null)}>
        <DialogContent className="p-0 overflow-hidden border-0 max-w-lg max-sm:mx-2">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3.5 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Apply for Job
                  </DialogTitle>
                  <p className="text-blue-100 text-xs mt-0.5">
                    {applyTarget?.title} at {applyTarget?.operator_name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogDescription className="sr-only">Submit your application</DialogDescription>

          <form onSubmit={handleApply} className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-5 bg-white">
            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-3 h-3" />
                {applyTarget?.location}
              </div>
              {applyTarget?.daily_rate && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <DollarSign className="w-3 h-3" />
                  ${applyTarget.daily_rate}/day
                </div>
              )}
              {applyTarget?.start_date && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CalendarRange className="w-3 h-3" />
                  {applyTarget.start_date} {applyTarget.end_date ? `→ ${applyTarget.end_date}` : ''}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apply-message" className="flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-slate-400" />
                Cover Message
              </Label>
              <Textarea
                id="apply-message"
                required
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                placeholder="Tell the operator why you are a great fit for this tour..."
                rows={3}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 min-h-[44px] sm:min-h-0"
                onClick={() => { setApplyTarget(null); setApplyMessage('') }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 min-h-[44px] sm:min-h-0"
                disabled={applying}
              >
                {applying ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Applying…
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
