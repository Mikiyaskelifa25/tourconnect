'use client'

import { useEffect, useState } from 'react'
import {
  Star, Languages, MapPin, Phone, Mail, CalendarDays, Briefcase, Handshake, X, Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { apiGetGuideCompletedTours } from '@/lib/api'
import { getLanguageName } from '@/lib/languages'
import type { GuideResult } from '@/types'
import Image from 'next/image'

interface GuideDetailSheetProps {
  guide: GuideResult | null
  open: boolean
  onClose: () => void
  onHire: (guide: GuideResult) => void
}

export function GuideDetailSheet({ guide, open, onClose, onHire }: GuideDetailSheetProps) {
  const [tours, setTours] = useState<{ id: string; operator_name: string; start_date: string; end_date: string; daily_rate: number; status: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !guide) return
    setLoading(true)
    apiGetGuideCompletedTours(guide.id).then((res) => {
      if (res.ok) setTours(res.data)
      setLoading(false)
    })
  }, [open, guide])

  const initials = guide?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || ''

  const rating = guide?.rating_avg ? guide.rating_avg.toFixed(1) : '5.0'

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 flex flex-col">
        <SheetHeader className="shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-500" />
            Guide Profile
          </SheetTitle>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors -mr-1.5"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Guide Header */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-blue-100 shrink-0 bg-gradient-to-br from-blue-400 to-blue-600">
                {guide?.profile_photo_url ? (
                  <Image src={guide.profile_photo_url} alt={guide?.name || ''} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {initials}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black text-slate-900 truncate">{guide?.name}</h2>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(parseFloat(rating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-1">{rating}</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2.5 text-sm text-slate-500">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{guide?.email}</span>
              </div>
              {guide?.phone && (
                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{guide.phone}</span>
                </div>
              )}
              {guide?.website && (
                <div className="flex items-center gap-2.5 text-sm text-blue-600">
                  <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                  <a
                    href={guide.website.startsWith('http') ? guide.website : `https://${guide.website}`}
                    target="_blank"
                    rel="dofollow"
                    className="truncate hover:underline font-medium"
                  >
                    {guide.website}
                  </a>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {guide?.languages && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                  <Languages className="w-3.5 h-3.5 text-slate-400" />
                  {guide.languages.split(',').map(l => getLanguageName(l.trim())).join(', ')}
                </div>
              )}
              {guide?.locations && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {guide.locations}
                </div>
              )}
            </div>

            {/* Hire Button */}
            {guide && (
              <Button
                variant="primary"
                onClick={() => { onHire(guide); onClose() }}
                className="w-full mt-4 gap-2"
              >
                <Handshake className="w-4 h-4" />
                Hire {guide.name.split(' ')[0]}
              </Button>
            )}
          </div>

          {/* Recent Work */}
          <div className="border-t border-slate-100">
            <div className="px-5 py-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-500" />
              <h4 className="text-sm font-bold text-slate-800">Recent Work</h4>
            </div>
            <div className="px-5 pb-5">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : tours.length > 0 ? (
                <div className="space-y-2">
                  {tours.map((tour) => (
                    <div key={tour.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-700">{tour.operator_name}</span>
                        <Badge variant={tour.status === 'accepted' ? 'primary' : 'warning'} className="text-[9px]">
                          {tour.status === 'accepted' ? 'Completed' : tour.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{tour.start_date} → {tour.end_date}</span>
                        <span className="font-mono text-slate-500">{tour.daily_rate}/day</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-slate-500">No completed tours yet</p>
                  <p className="text-xs mt-1">This guide hasn&apos;t completed any contracts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}