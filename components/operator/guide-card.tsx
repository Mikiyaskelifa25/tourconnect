'use client'

import { useMemo } from 'react'
import { Star, Languages, MapPin, Handshake, Phone, CalendarDays, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GuideResult } from '@/types'
import { getLanguageName } from '@/lib/languages'
import Image from 'next/image'
import Link from 'next/link'

interface GuideCardProps {
  guide: GuideResult
  onHire: (guide: GuideResult) => void
  onViewDetail: (guide: GuideResult) => void
}

export function GuideCard({ guide, onHire, onViewDetail }: GuideCardProps) {
  const nextAvailable = useMemo(() => {
    if (!guide.unavailable_dates || guide.unavailable_dates.length === 0) return null
    const today = new Date().toISOString().split('T')[0]
    const sorted = [...guide.unavailable_dates].sort()
    const lastUnavailable = sorted[sorted.length - 1]
    if (lastUnavailable < today) return null
    const date = new Date(lastUnavailable + 'T00:00:00')
    date.setDate(date.getDate() + 1)
    const nextStr = date.toISOString().split('T')[0]
    if (guide.unavailable_dates.includes(nextStr)) return null
    return nextStr
  }, [guide.unavailable_dates])

  const isAvailable = guide.availability_status === 'free' || !guide.availability_status

  const rating = guide.rating_avg ? guide.rating_avg.toFixed(1) : '5.0'
  const initials = guide.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="group bg-white rounded-2xl border border-blue-200 shadow-sm hover:shadow-lg hover:shadow-blue-200/30 hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="p-5">
        {/* Clickable area for detail view */}
        <div className="cursor-pointer" onClick={() => onViewDetail(guide)}>
          {/* Header */}
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 ${isAvailable ? 'border-blue-200' : 'border-slate-200'}`}>
                {guide.profile_photo_url ? (
                  <Image
                    src={guide.profile_photo_url}
                    alt={guide.name}
                    width={56}
                    height={56}
                    className={`w-full h-full object-cover ${!isAvailable ? 'grayscale' : ''}`}
                    unoptimized
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center font-bold text-white text-sm ${isAvailable ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-slate-300'}`}>
                    {initials}
                  </div>
                )}
              </div>
              {isAvailable && (
                <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 truncate">{guide.name}</h4>
                    {isAvailable && (
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{guide.email}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  isAvailable
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="mt-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${s <= Math.round(parseFloat(rating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
              />
            ))}
            <span className="text-xs font-bold text-amber-600 ml-1.5">{rating}</span>
            <span className="text-[10px] text-slate-400 ml-0.5">/ 5.0</span>
          </div>

          {/* Info Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {guide.languages && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                <Languages className="w-3 h-3 text-slate-400" />
                <span>{guide.languages.split(',').map(l => getLanguageName(l.trim())).join(', ')}</span>
              </div>
            )}
            {guide.locations && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span className="truncate max-w-[140px]">{guide.locations}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions (not clickable for detail) */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Phone className="w-3 h-3" />
            <span className="font-mono">{guide.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/operator/guide-calendar?id=${guide.id}`}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onHire(guide) }}
              className="text-xs gap-1.5 h-8"
              id={`hire-btn-${guide.id}`}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hire</span>
              <span className="sm:hidden">Hire</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Next Available Banner */}
      {nextAvailable && !isAvailable && (
        <div className="mx-5 mb-4 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2">
          <CalendarDays className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="text-[11px] font-medium text-amber-700">
            Available <strong>{new Date(nextAvailable + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
          </span>
        </div>
      )}
    </div>
  )
}
