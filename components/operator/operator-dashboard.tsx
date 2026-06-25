'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/lib/store'
import { apiSearchGuides } from '@/lib/api'
import { SearchFilters } from './search-filters'
import { GuidesResults } from './guides-results'
import { SentRequestsTable } from './sent-requests-table'
import { HireModal } from '@/components/shared/hire-modal'
import { GuideDetailSheet } from './guide-detail-sheet'
import { Building2, Search, Send, AlertCircle, Settings } from 'lucide-react'
import type { GuideResult } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

export function OperatorDashboard() {
  const { session, setGuideResults } = useApp()
  const [hireTarget, setHireTarget] = useState<GuideResult | null>(null)
  const [detailGuide, setDetailGuide] = useState<GuideResult | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  if (!session || session.userType !== 'operator') return null

  async function handleSearch(filters: {
    date: string
    name?: string
    location: string
    language: string
    freeOnly: boolean
  }) {
    setSearchError(null)
    const payload = {
      date: filters.date,
      name: filters.name || undefined,
      location: filters.location || undefined,
      languages: filters.language ? [filters.language] : undefined,
      status: filters.freeOnly ? 'free' as const : undefined,
    }

    const res = await apiSearchGuides(null, payload)
    if (res.ok) {
      setGuideResults(res.data)
    } else {
      setSearchError(res.data.error)
    }
  }

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    handleSearch({ date: today, name: '', location: '', language: '', freeOnly: true })
  }, [])

  return (
    <section className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-slate-900 p-6 sm:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2563eb]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#ef3340]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#ffd100] animate-pulse" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Verified Operator Portal</p>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              {session.profilePhotoUrl ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/20 relative shadow-2xl shrink-0">
                  <Image src={session.profilePhotoUrl} alt={session.name} fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-2xl shrink-0">
                  <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-white/50" />
                </div>
              )}
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Welcome, {session.name} 🏢
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Tour & Operator Partner</p>
              </div>
            </div>

            <p className="text-slate-400 text-base mt-6 max-w-lg leading-relaxed">
              Find and hire the best licensed tour guides across Ethiopia. Track your active contracts and manage your field operations.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/operator/edit-profile"
                className="flex items-center gap-2 bg-[#ffd100] hover:bg-[#ffdf40] text-slate-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm transition-all active:scale-95 shadow-xl shadow-[#ffd100]/20"
              >
                <Settings className="w-4 h-4" />
                EDIT PROFILE
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-[2rem] px-4 sm:px-8 py-4 sm:py-6 w-full sm:w-auto">
            <div className="bg-[#ef3340] p-3 rounded-2xl shadow-lg shadow-red-500/20">
              <Building2 className="w-6 h-6 text-white shrink-0" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Operator Account
              </p>
              <p className="text-lg font-bold text-white">
                VERIFIED
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 xl:gap-8">
        {/* Filters Sidebar */}
        <div className="xl:col-span-1 animate-fade-in-up stagger-1">
          <div className="flex items-center gap-3 text-slate-900 mb-4 px-2">
            <Search className="w-5 h-5 text-[#2563eb]" />
            <span className="text-sm font-black uppercase tracking-widest">Search Guides</span>
          </div>
          <SearchFilters onSearch={handleSearch} />

          {searchError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Search Error</p>
                <p className="text-xs text-red-600 mt-1">{searchError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results + Requests */}
        <div className="xl:col-span-3 space-y-8 animate-fade-in-up stagger-2">
          <GuidesResults onHire={setHireTarget} onViewDetail={setDetailGuide} />

          <div className="flex items-center gap-3 text-slate-900 px-2">
            <Send className="w-5 h-5 text-[#ef3340]" />
            <span className="text-sm font-black uppercase tracking-widest">Active Contracts</span>
          </div>
          <SentRequestsTable />
        </div>
      </div>

      {hireTarget && (
        <HireModal
          guide={hireTarget}
          open={!!hireTarget}
          onClose={() => setHireTarget(null)}
        />
      )}

      <GuideDetailSheet
        guide={detailGuide}
        open={!!detailGuide}
        onClose={() => setDetailGuide(null)}
        onHire={setHireTarget}
      />


    </section>
  )
}
