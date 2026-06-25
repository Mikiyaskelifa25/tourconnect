'use client'

import { useEffect, useState } from 'react'
import { Clock, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { apiGetHistory } from '@/lib/api'
import type { RequestHistoryItem } from '@/types'

const STATUS_STYLES: Record<string, { variant: 'primary' | 'destructive' | 'warning'; label: string }> = {
  accepted: { variant: 'primary', label: 'Accepted' },
  rejected: { variant: 'destructive', label: 'Declined' },
  pending: { variant: 'warning', label: 'Pending' },
}

export function RecentHistory() {
  const [items, setItems] = useState<RequestHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGetHistory().then((res) => {
      if (res.ok) {
        setItems(res.data)
      }
      setLoading(false)
    })
  }, [])

  return (
    <div
      className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
        <div className="bg-slate-50 p-2 rounded-xl">
          <Clock className="w-4 h-4 text-slate-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Recent History</h3>
          <p className="text-[11px] text-slate-500">Past contract responses</p>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-400 border border-dashed border-blue-200/40 rounded-xl bg-slate-50/50">
            <Clock className="w-8 h-8 opacity-50" />
            <p className="text-xs text-center">No history yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Counterparty</th>
                    <th>Dates</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const badge = STATUS_STYLES[item.status]
                    return (
                      <tr
                        key={item.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        <td className="font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {item.counterparty_name}
                          </div>
                        </td>
                        <td>
                          <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                            {item.start_date} → {item.end_date}
                          </span>
                        </td>
                        <td className="text-center">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card list view */}
            <div className="block md:hidden divide-y divide-slate-100 p-2 space-y-3">
              {items.map((item, i) => {
                const badge = STATUS_STYLES[item.status]
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/65 rounded-xl border border-blue-100/50 space-y-2.5 animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-800 text-sm truncate">{item.counterparty_name}</span>
                      </div>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="text-slate-500 font-mono">
                        {item.start_date} → {item.end_date}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
