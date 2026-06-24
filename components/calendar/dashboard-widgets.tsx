'use client'

import { useState, useEffect } from 'react'
import { apiGetDashboardStats } from '@/lib/api'
import type { DashboardStats } from '@/types'
import { Inbox, CheckCircle } from 'lucide-react'

const WIDGETS = [
  {
    key: 'pendingRequests' as const,
    icon: Inbox,
    label: 'Pending Requests',
    color: 'bg-amber-500',
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-600',
    format: (v: number) => `${v}`,
  },
  {
    key: 'completedTours' as const,
    icon: CheckCircle,
    label: 'Completed Tours',
    color: 'bg-sky-500',
    colorBg: 'bg-sky-50',
    colorText: 'text-sky-600',
    format: (v: number) => `${v}`,
  },
]

export function DashboardWidgets() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    const res = await apiGetDashboardStats()
    if (res.ok) {
      setStats(res.data)
    }
    setLoading(false)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {WIDGETS.map((widget) => {
        const Icon = widget.icon
        const value = stats ? stats[widget.key] : null

        return (
          <div
            key={widget.key}
            className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-200"
          >
            <div className={`${widget.colorBg} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${widget.colorText}`} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {widget.label}
              </p>
              {loading ? (
                <div className="h-7 w-16 bg-slate-100 rounded-lg animate-pulse" />
              ) : (
                <p className={`text-lg sm:text-xl font-black ${widget.colorText}`}>
                  {value !== null ? widget.format(value) : '—'}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
