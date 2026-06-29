'use client'

import { useState, useEffect } from 'react'
import { Briefcase, MapPin, DollarSign, CalendarRange, Users, Eye, X, Check, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { apiGetOperatorJobPostings, apiGetJobApplications, apiUpdateApplicationStatus, apiCloseJobPosting } from '@/lib/api'
import { toastSuccess, toastError } from '@/lib/toast'
import type { JobPostingWithOperator, JobApplicationWithGuide } from '@/types'

export function OperatorJobPostings() {
  const [postings, setPostings] = useState<JobPostingWithOperator[]>([])
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [applications, setApplications] = useState<JobApplicationWithGuide[]>([])
  const [loadingApps, setLoadingApps] = useState(false)

  useEffect(() => {
    loadPostings()
  }, [])

  async function loadPostings() {
    const res = await apiGetOperatorJobPostings()
    if (res.ok) setPostings(res.data)
  }

  async function viewApplications(jobId: string) {
    setSelectedJob(jobId)
    setLoadingApps(true)
    const res = await apiGetJobApplications(jobId)
    if (res.ok) setApplications(res.data)
    else toastError({ title: 'Error', description: 'Could not load applications' })
    setLoadingApps(false)
  }

  async function handleApplication(action: 'accept' | 'reject', appId: string) {
    const res = await apiUpdateApplicationStatus(appId, action)
    if (res.ok) {
      toastSuccess({ title: action === 'accept' ? 'Application Accepted' : 'Application Rejected' })
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId ? { ...a, status: action === 'accept' ? 'accepted' : 'rejected' } : a
        )
      )
      loadPostings()
    } else {
      toastError({ title: 'Error', description: (res.data as { error: string }).error })
    }
  }

  async function closeJob(jobId: string) {
    const res = await apiCloseJobPosting(jobId)
    if (res.ok) {
      toastSuccess({ title: 'Job Closed' })
      loadPostings()
    } else {
      toastError({ title: 'Error', description: (res.data as { error: string }).error })
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="success">● Open</Badge>
      case 'filled': return <Badge variant="primary">● Filled</Badge>
      case 'closed': return <Badge variant="destructive">● Closed</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Briefcase className="w-4 h-4 text-emerald-600" />
          My Job Postings
        </CardTitle>
        {postings.length > 0 && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {postings.length}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {postings.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Briefcase className="w-8 h-8 opacity-50" />
            <p className="text-xs text-center">No job postings yet.<br />Post a job to find guides.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {postings.map((job) => (
              <div
                key={job.id}
                className="bg-slate-50/80 border rounded-xl p-4 space-y-3 hover:border-emerald-200/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-sm">{job.title}</h4>
                      {statusBadge(job.status)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => closeJob(job.id)}
                    title="Close job"
                    disabled={job.status !== 'open'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {job.description && (
                  <p className="text-xs text-slate-600 bg-white border border-slate-100 p-2.5 rounded-lg leading-relaxed line-clamp-2">
                    {job.description}
                  </p>
                )}

                <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-500">
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
                      {job.languages_required.join(', ')}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {(job.application_count ?? 0)} applicant{(job.application_count ?? 0) !== 1 ? 's' : ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => viewApplications(job.id)}
                  >
                    <Eye className="w-3 h-3" />
                    View Applications
                  </Button>
                </div>

                {selectedJob === job.id && (
                  <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Applications</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => { setSelectedJob(null); setApplications([]) }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    {loadingApps ? (
                      <div className="flex items-center justify-center py-6">
                        <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                      </div>
                    ) : applications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No applications yet</p>
                    ) : (
                      applications.map((app) => (
                        <div key={app.id} className="bg-slate-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-800">{app.guide_name}</span>
                            <Badge variant={
                              app.status === 'accepted' ? 'success' :
                              app.status === 'rejected' ? 'destructive' : 'warning'
                            }>
                              {app.status}
                            </Badge>
                          </div>
                          {app.message && (
                            <p className="text-xs text-slate-600 italic leading-relaxed">
                              &ldquo;{app.message}&rdquo;
                            </p>
                          )}
                          {app.status === 'pending' && (
                            <div className="flex gap-2 pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                onClick={() => handleApplication('reject', app.id)}
                              >
                                <X className="w-3 h-3" />
                                Reject
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleApplication('accept', app.id)}
                              >
                                <Check className="w-3 h-3" />
                                Accept
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
