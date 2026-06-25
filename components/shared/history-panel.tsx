'use client'

import { useEffect, useState, useRef } from 'react'
import { Clock, User, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/lib/store'
import { apiGetHistory } from '@/lib/api'
import type { RequestHistoryItem } from '@/types'

const STATUS_STYLES: Record<string, { variant: 'primary' | 'destructive' | 'warning'; label: string }> = {
  accepted: { variant: 'primary', label: 'Accepted' },
  rejected: { variant: 'destructive', label: 'Declined' },
  pending: { variant: 'warning', label: 'Pending' },
}

export function HistoryPanel() {
  const { setSelectedHireId } = useApp()
  const [items, setItems] = useState<RequestHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('pointerdown', handlePointerDown)
    }
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  useEffect(() => {
    apiGetHistory().then((res) => {
      if (res.ok) {
        setItems(res.data)
      }
      setLoading(false)
    })
  }, [])

  function handleItemClick(item: RequestHistoryItem) {
    setSelectedHireId(item.id)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
        id="history-btn"
      >
        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {open && (
        <div ref={panelRef} className="fixed sm:absolute right-2 sm:right-0 top-[72px] sm:top-full mt-0 sm:mt-2 z-[70] w-[calc(100vw-16px)] sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-black text-slate-800">Recent History</span>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    {items.length} entries
                  </span>
                )}
                {items.length > 0 && (
                  <button
                    onClick={() => setItems([])}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 px-2 py-1 rounded-full transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="h-32 flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Clock className="w-8 h-8 opacity-50" />
                  <p className="text-xs">No history yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const badge = STATUS_STYLES[item.status]
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-xs font-semibold text-slate-800 truncate">
                              {item.counterparty_name}
                            </span>
                          </div>
                          <Badge variant={badge.variant} className="text-[9px] shrink-0">
                            {badge.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.start_date} → {item.end_date}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            ${item.daily_rate}
                            <span className="text-[10px] text-slate-400 font-normal">/day</span>
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
      )}
    </div>
  )
}