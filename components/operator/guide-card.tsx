'use client'

import { useMemo } from 'react'
import { Star, Languages, MapPin, Handshake, Phone, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GuideResult } from '@/types'
import Image from 'next/image'
import Link from 'next/link'

interface GuideCardProps {
  guide: GuideResult
  onHire: (guide: GuideResult) => void
}

export function GuideCard({ guide, onHire }: GuideCardProps) {
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
    <div className="relative group">
      {/* Gradient border wrapper */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 via-blue-400 to-purple-400 opacity-40 group-hover:opacity-70 group-active:opacity-70 transition-opacity duration-300" />
      <div className="relative m-[1.5px] bg-white/95 backdrop-blur-sm rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 active:-translate-y-0.5 min-h-full"
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
        }}
      >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-50/0 to-green-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden shadow-sm relative border-2 border-white ${isAvailable ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-slate-300'}`}>
            {guide.profile_photo_url ? (
              <Image
                src={guide.profile_photo_url}
                alt={guide.name}
                fill
                className={`object-cover ${!isAvailable ? 'grayscale' : ''}`}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={`font-bold text-sm leading-tight truncate ${isAvailable ? 'text-slate-800' : 'text-slate-400'}`}>{guide.name}</h4>
              <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {isAvailable ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{guide.email}</p>
          </div>
        </div>

        {isAvailable && (
          <div className="space-y-3.5 mt-3.5">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 w-fit">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= Math.round(parseFloat(rating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                />
              ))}
              <span className="text-xs font-bold text-amber-700 ml-1">{rating}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                <Languages className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-500 shrink-0">Languages:</span>
                <span className="font-semibold text-slate-700 truncate uppercase">
                  {guide.languages}
                </span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-500 shrink-0">Areas:</span>
                <span className="font-semibold text-slate-700 line-clamp-1">
                  {guide.locations}
                </span>
              </div>
            </div>

            <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Phone className="w-3 h-3" />
                <span className="font-mono">{guide.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/operator/guide-calendar?id=${guide.id}`}
                  className="inline-flex items-center gap-1 h-8 px-3 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all whitespace-nowrap"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  Calendar
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onHire(guide)}
                  className="text-xs gap-1.5"
                  id={`hire-btn-${guide.id}`}
                >
                  <Handshake className="w-3.5 h-3.5" />
                  Hire
                </Button>
              </div>
            </div>
          </div>
        )}

        {nextAvailable && !isAvailable && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
            <CalendarDays className="w-3 h-3" />
            <span>Next available: <strong>{new Date(nextAvailable + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
