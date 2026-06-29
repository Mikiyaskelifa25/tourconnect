'use client'

import { useState, useEffect } from 'react'
import { Send, Briefcase, MapPin, DollarSign, CalendarRange, Building2, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { apiGetMyApplications } from '@/lib/api'

type ApplicationWithJob = {
  id: string
  job_id: string
  guide_id: string
  message: string | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  job: {
    id: string
    title: string
    description: string
    location: string
    start_date: string | null
    end_date: string | null
    daily_rate: number | null
    status: string
    operator_name: string
  } | null
}

export function MyApplications() {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([])

  useEffect(() => {
    loadApplications()
  }, [])

  async function loadApplications() {
    const res = await apiGetMyApplications()
    if (res.ok) setApplications(res.data as unknown as ApplicationWithJob[])
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">⏳ Pending</Badge>
      case 'accepted': return <Badge variant="success">✓ Accepted</Badge>
      case 'rejected': return <Badge variant="destructive">✗ Rejected</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div
      className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-xl">
            <Send className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">My Applications</h3>
            <p className="text-[11px] text-slate-500">Jobs you have applied to</p>
          </div>
        </div>
        {applications.length > 0 && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {applications.length}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-6">
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-0.5">
          {applications.length > 0 ? (
            applications.map((app) => (
              <div
                key={app.id}
                className="bg-slate-50/80 border border-blue-100/50 rounded-xl p-4 space-y-3 hover:border-blue-200/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-sm">{app.job?.title || 'Unknown Job'}</h4>
                      {statusBadge(app.status)}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {app.job?.operator_name || 'Unknown Operator'}
                    </p>
                  </div>
                </div>

                {app.message && (
                  <p className="text-xs text-slate-600 bg-white border border-slate-100 p-2.5 rounded-lg italic leading-relaxed">
                    &ldquo;{app.message}&rdquo;
                  </p>
                )}

                <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-500">
                  {app.job?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {app.job.location}
                    </span>
                  )}
                  {app.job?.daily_rate && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${app.job.daily_rate}/day
                    </span>
                  )}
                  {app.job?.start_date && (
                    <span className="flex items-center gap-1">
                      <CalendarRange className="w-3 h-3" />
                      {app.job.start_date} {app.job.end_date ? `→ ${app.job.end_date}` : ''}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-400 border border-dashed border-blue-200/40 rounded-xl bg-slate-50/50">
              <Briefcase className="w-8 h-8 opacity-50" />
              <p className="text-xs text-center">You haven&apos;t applied to any jobs yet.<br />Browse available jobs and apply!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
