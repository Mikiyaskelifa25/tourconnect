'use client'

import { useEffect, useState } from 'react'
import { User, Star, MapPin, Globe, CalendarDays, MessageSquareText, Building2, X, ThumbsUp } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/lib/store'
import { apiGetHireDetails, apiSubmitRating } from '@/lib/api'
import { toastSuccess, toastError } from '@/lib/toast'
import type { HireDetails } from '@/types'
import Image from 'next/image'

export function GuideDetailDialog() {
  const { selectedHireId, setSelectedHireId, session } = useApp()
  const [details, setDetails] = useState<HireDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [hoverScore, setHoverScore] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [rated, setRated] = useState(false)

  useEffect(() => {
    if (!selectedHireId) {
      setDetails(null)
      setHoverScore(0)
      setRated(false)
      return
    }

    setLoading(true)
    apiGetHireDetails(selectedHireId).then((res) => {
      if (res.ok) {
        setDetails(res.data)
        setRated(res.data.operatorRating != null)
      }
      setLoading(false)
    })
  }, [selectedHireId])

  function handleClose() {
    setSelectedHireId(null)
  }

  async function handleRate(score: number) {
    if (!details || submitting) return
    setSubmitting(true)
    const res = await apiSubmitRating(details.guide.id, score, selectedHireId!)
    if (res.ok) {
      toastSuccess({ title: 'Rating submitted', description: `You rated ${details.guide.name} ${score}/5` })
      setRated(true)
      setDetails({
        ...details,
        operatorRating: score,
        guide: { ...details.guide, rating_avg: details.guide.rating_avg },
      })
    } else {
      toastError({ title: 'Rating failed', description: (res.data as { error: string }).error })
    }
    setSubmitting(false)
  }

  const isOperator = session?.userType === 'operator'

  return (
    <Dialog open={!!selectedHireId} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="p-0 overflow-hidden border-0 max-w-lg max-sm:mx-2 max-h-[90dvh] overflow-y-auto">
        <DialogTitle className="sr-only">Guide Details</DialogTitle>

        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}

        {!loading && details && (
          <>
            {/* Header with guide info */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <h3 className="text-white text-lg font-bold flex items-center gap-2">
                    Guide Details
                  </h3>
                  <button
                    onClick={handleClose}
                    className="p-1.5 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  {details.guide.profile_photo_url ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shrink-0 relative">
                      <Image src={details.guide.profile_photo_url} alt={details.guide.name} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/30 shrink-0">
                      <User className="w-8 h-8 text-white/70" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-white truncate">{details.guide.name}</h3>
                    <p className="text-indigo-200 text-sm truncate">{details.guide.email}</p>
                    {details.guide.phone && (
                      <p className="text-indigo-200 text-xs mt-0.5">{details.guide.phone}</p>
                    )}
                  </div>
                </div>

                {details.guide.rating_avg != null && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-white">{details.guide.rating_avg.toFixed(1)}</span>
                    <span className="text-indigo-200 text-xs">/ 5.0</span>
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Languages & Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5" />
                    Languages
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {details.guide.languages ? (
                      details.guide.languages.split(', ').map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-[10px]">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Not specified</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    Locations
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {details.guide.locations ? (
                      details.guide.locations.split(', ').map((loc) => (
                        <Badge key={loc} variant="outline" className="text-[10px]">
                          {loc}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Not specified</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Hire Request Details */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-500" />
                  Contract Details
                </h4>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Status</span>
                    <Badge
                      variant={
                        details.hireRequest.status === 'accepted'
                          ? 'primary'
                          : details.hireRequest.status === 'rejected'
                          ? 'destructive'
                          : 'warning'
                      }
                      className="text-[10px]"
                    >
                      {details.hireRequest.status === 'accepted'
                        ? 'Accepted'
                        : details.hireRequest.status === 'rejected'
                        ? 'Rejected'
                        : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Dates</span>
                    <span className="text-xs font-mono text-slate-700">
                      {details.hireRequest.start_date} → {details.hireRequest.end_date}
                    </span>
                  </div>
                </div>
              </div>

              {details.hireRequest.message && (
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <MessageSquareText className="w-4 h-4 text-indigo-500" />
                    Message
                  </h4>
                  <blockquote className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl italic leading-relaxed">
                    &ldquo;{details.hireRequest.message}&rdquo;
                  </blockquote>
                </div>
              )}

              {/* Rate the Guide (operators only) */}
              {isOperator && (
                <>
                  <div className="border-t border-slate-100" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-amber-500" />
                      {rated ? 'Your Rating' : 'Rate this Guide'}
                    </h4>
                    <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-4">
                      {rated ? (
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-6 h-6 ${
                                s <= (details.operatorRating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                          <span className="text-sm font-bold text-slate-600 ml-2">
                            {details.operatorRating}/5
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleRate(s)}
                                onMouseEnter={() => setHoverScore(s)}
                                onMouseLeave={() => setHoverScore(0)}
                                disabled={submitting}
                                className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
                              >
                                <Star
                                  className={`w-7 h-7 ${
                                    s <= (hoverScore || details.operatorRating || 0)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          {hoverScore > 0 && (
                            <p className="text-xs font-semibold text-slate-500">
                              {hoverScore === 1 ? 'Poor' : hoverScore === 2 ? 'Fair' : hoverScore === 3 ? 'Good' : hoverScore === 4 ? 'Very Good' : 'Excellent'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="border-t border-slate-100" />

              {/* Operator info (shown for operator users to see counterparty) */}
              {isOperator && (
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    Requested by
                  </h4>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{details.operator.name}</p>
                      <p className="text-xs text-slate-500">{details.operator.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!loading && !details && selectedHireId && (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <p className="text-sm">Could not load details.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}