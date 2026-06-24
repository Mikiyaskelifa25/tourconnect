'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Send, ClipboardList, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AppProvider, useApp } from '@/lib/store'
import { apiGetOperatorSentRequests } from '@/lib/api'
import type { HireRequestWithOperator } from '@/types'
import Link from 'next/link'

function SentRequestsContent() {
  const { session } = useApp()
  const [requests, setRequests] = useState<HireRequestWithOperator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.userType !== 'operator') return
    apiGetOperatorSentRequests().then((res) => {
      if (res.ok) setRequests(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [session])

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-xl">
                <Send className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">All Sent Requests & Offers</h3>
                <p className="text-[11px] text-slate-500">Full list of your contract proposals</p>
              </div>
            </div>
            {requests.length > 0 && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {requests.length} total
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : requests.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center gap-3 text-slate-400">
              <ClipboardList className="w-9 h-9 opacity-50" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-500">No requests sent yet</p>
                <p className="text-xs text-slate-400 mt-1">Search for guides and send a contract to get started</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                    {requests.map((req, i) => (
                      <tr key={req.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.025}s` }}>
                        <td className="font-semibold text-slate-800">{req.operator_name}</td>
                        <td>
                          <span className="text-xs text-slate-500 font-mono">
                            {req.start_date} → {req.end_date}
                          </span>
                        </td>
                        <td className="max-w-[250px]">
                          <p className="text-xs text-slate-500 line-clamp-2" title={req.message}>
                            {req.message}
                          </p>
                        </td>
                        <td className="text-center">
                          {req.status === 'accepted' ? (
                            <Badge variant="primary">✓ Accepted</Badge>
                          ) : req.status === 'rejected' ? (
                            <Badge variant="destructive">✗ Rejected</Badge>
                          ) : (
                            <Badge variant="warning">⏳ Pending</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-3">
                {requests.map((req) => (
                  <div key={req.id} className="p-3 bg-slate-50/65 rounded-xl border border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">{req.operator_name}</span>
                      {req.status === 'accepted' ? (
                        <Badge variant="primary">✓ Accepted</Badge>
                      ) : req.status === 'rejected' ? (
                        <Badge variant="destructive">✗ Rejected</Badge>
                      ) : (
                        <Badge variant="warning">⏳ Pending</Badge>
                      )}
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SentRequestsPage() {
  return (
    <AppProvider>
      <SentRequestsContent />
    </AppProvider>
  )
}
