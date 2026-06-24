'use client'

import { useEffect } from 'react'
import { Inbox, Building2, CalendarDays, ArchiveRestore, RefreshCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/store'
import { apiGetGuideRequests, apiRespondToRequest } from '@/lib/api'
import { toastSuccess, toastError } from '@/lib/toast'

export function HireRequestsList() {
  const { session, guideRequests, setGuideRequests } = useApp()

  useEffect(() => {
    if (session?.userType === 'guide') {
      loadRequests()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  async function loadRequests() {
    const res = await apiGetGuideRequests()
    if (res.ok) {
      setGuideRequests(res.data)
    }
  }

  async function respondToRequest(requestId: string, action: 'accept' | 'reject') {
    const res = await apiRespondToRequest(requestId, action)
    if (res.ok) {
      toastSuccess({ title: action === 'accept' ? 'Contract Accepted' : 'Contract Declined', description: `You have ${action === 'accept' ? 'accepted' : 'declined'} the hire proposal.` })
      loadRequests()
    } else {
      toastError({ title: 'Action Failed', description: (res.data as { error: string }).error || 'Could not process your response' })
    }
  }

  return (
    <div
      className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 p-2 rounded-xl">
            <Inbox className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Incoming Contract Requests</h3>
            <p className="text-[11px] text-slate-500">Agency hire proposals</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {guideRequests.length > 0 && (
            <Badge variant="warning">{guideRequests.length} Pending</Badge>
          )}
          <button
            onClick={loadRequests}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
            title="Refresh"
            id="refresh-requests-btn"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Request List */}
      <div className="p-4 sm:p-6">
        <div className="overflow-y-auto max-h-[420px] space-y-3 pr-0.5">
          {guideRequests.length > 0 ? (
            guideRequests.map((req, i) => (
              <div
                key={req.id}
                className="group bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3 hover:border-slate-300 hover:bg-white transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex-shrink-0 bg-indigo-100 text-indigo-700 p-2 rounded-lg">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{req.operator_name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{req.operator_email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[9px]">
                    ${req.daily_rate}/day
                  </Badge>
                </div>

                <blockquote className="text-xs text-slate-600 bg-white border border-slate-100 p-3 rounded-lg italic leading-relaxed">
                  &ldquo;{req.message}&rdquo;
                </blockquote>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.start_date}</span>
                    <span className="text-slate-300">→</span>
                    <span>{req.end_date}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => respondToRequest(req.id, 'reject')}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-xs"
                      id={`reject-btn-${req.id}`}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => respondToRequest(req.id, 'accept')}
                      className="text-xs"
                      id={`accept-btn-${req.id}`}
                    >
                      Accept ✓
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-40 flex flex-col items-center justify-center gap-3 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <ArchiveRestore className="w-9 h-9 opacity-50" />
              <p className="text-xs text-center">No contract proposals right now.<br />Check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
