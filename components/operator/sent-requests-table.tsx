'use client'

import { useState, useEffect } from 'react'
import { Send, ClipboardList, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/lib/store'
import { apiGetOperatorSentRequests } from '@/lib/api'
import type { HireRequestWithOperator } from '@/types'
import Link from 'next/link'

const DISPLAY_LIMIT = 6

export function SentRequestsTable() {
  const { session } = useApp()
  const [requests, setRequests] = useState<HireRequestWithOperator[]>([])

  useEffect(() => {
    if (session?.userType !== 'operator') return

    apiGetOperatorSentRequests().then((res) => {
      if (res.ok) {
        setRequests(res.data)
      }
    })
  }, [session])

  const visible = requests.slice(0, DISPLAY_LIMIT)
  const hasMore = requests.length > DISPLAY_LIMIT

  return (
    <div
      className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2 rounded-xl">
            <Send className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Sent Requests & Offers</h3>
            <p className="text-[11px] text-slate-500">Track your contract proposals</p>
          </div>
        </div>
        {requests.length > 0 && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {requests.length} sent
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        {requests.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center gap-3 text-slate-400">
            <ClipboardList className="w-9 h-9 opacity-50" />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">No requests sent yet</p>
              <p className="text-xs text-slate-400 mt-1">Search for guides and send a contract to get started</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Tour Guide</th>
                    <th>Dates</th>
                    <th>Message</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((req, i) => {
                    const statusBadge =
                      req.status === 'accepted' ? (
                        <Badge variant="primary">✓ Accepted</Badge>
                      ) : req.status === 'rejected' ? (
                        <Badge variant="destructive">✗ Rejected</Badge>
                      ) : (
                        <Badge variant="warning">⏳ Pending</Badge>
                      )

                    return (
                      <tr
                        key={req.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        <td className="font-semibold text-slate-800">{req.operator_name}</td>
                        <td>
                          <span className="text-xs text-slate-500 font-mono">
                            {req.start_date} → {req.end_date}
                          </span>
                        </td>
                        <td className="max-w-[200px]">
                          <p className="text-xs text-slate-500 truncate" title={req.message}>
                            {req.message}
                          </p>
                        </td>
                        <td className="text-center">{statusBadge}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card list view */}
            <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-3">
              {visible.map((req, i) => {
                const statusBadge =
                  req.status === 'accepted' ? (
                    <Badge variant="primary">✓ Accepted</Badge>
                  ) : req.status === 'rejected' ? (
                    <Badge variant="destructive">✗ Rejected</Badge>
                  ) : (
                    <Badge variant="warning">⏳ Pending</Badge>
                  )

                return (
                  <div
                    key={req.id}
                    className="p-3 bg-slate-50/65 rounded-xl border border-blue-100/50 space-y-2.5 animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">{req.operator_name}</span>
                      {statusBadge}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {req.start_date} → {req.end_date}
                    </div>
                    {req.message && (
                      <p className="text-[11px] text-slate-500 italic bg-white border border-slate-100 p-2 rounded-lg leading-relaxed">
                        &ldquo;{req.message}&rdquo;
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {hasMore && (
              <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-2">
                <Link
                  href="/operator/sent-requests"
                  className="flex items-center justify-center gap-2 w-full h-10 text-sm font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  See All {requests.length} Requests
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
