'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useApp } from '@/lib/store'
import { apiGetGuideById } from '@/lib/api'
import type { GuideResult } from '@/types'
import { OperatorCalendarView } from '@/components/operator/operator-calendar-view'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export function GuideCalendarContent() {
  const searchParams = useSearchParams()
  const guideId = searchParams.get('id')
  const { guideResults } = useApp()
  const [fetchedGuide, setFetchedGuide] = useState<GuideResult | 'loading' | null>('loading')

  const storeGuide = guideId ? guideResults.find((g) => g.id === guideId) : undefined
  const guide = storeGuide ?? (typeof fetchedGuide === 'object' && fetchedGuide ? fetchedGuide : null)
  const guideError = fetchedGuide === null && !storeGuide

  useEffect(() => {
    if (!guideId) return
    if (storeGuide) {
      setFetchedGuide('loading')
      return
    }
    let cancelled = false
    apiGetGuideById(guideId).then((res) => {
      if (cancelled) return
      setFetchedGuide(res.ok ? res.data : null)
    }).catch(() => {
      if (!cancelled) setFetchedGuide(null)
    })
    return () => { cancelled = true }
  }, [guideId])

  if (!guideId) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold text-slate-500">No guide selected</p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (guideError) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold text-red-500">Could not load guide information.</p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Loading guide information...</p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <OperatorCalendarView guide={guide} />
      </div>
    </div>
  )
}
