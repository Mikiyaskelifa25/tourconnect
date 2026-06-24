'use client'

import { ShieldCheck, Inbox, Settings, User, CalendarDays, ExternalLink } from 'lucide-react'
import { useApp } from '@/lib/store'
import { HireRequestsList } from './hire-requests-list'
import { RecentHistory } from '@/components/shared/recent-history'
import { DashboardWidgets } from '@/components/calendar/dashboard-widgets'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

export function GuideDashboard() {
  const { session } = useApp()
  const [globalStatus, setGlobalStatus] = useState<'free' | 'close'>('free')

  useEffect(() => {
    if (!session?.userType) return
    fetchGlobalStatus()
  }, [session])

  function fetchGlobalStatus() {
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('tour_guides')
      .select('id')
      .eq('email', session!.email)
      .single()
      .then(({ data: profile }) => {
        if (!profile) return
        supabase
          .from('guide_unavailable_dates')
          .select('date')
          .eq('guide_id', profile.id)
          .eq('date', today)
          .maybeSingle()
          .then(({ data }) => {
            setGlobalStatus(data ? 'close' : 'free')
          })
      })
  }

  if (!session || session.userType !== 'guide') return null

  return (
    <section className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-slate-900 p-6 sm:p-10 text-white shadow-2xl">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#009739]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#ef3340]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#ffd100] animate-pulse" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Professional Guide Portal</p>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              {session.profilePhotoUrl ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/20 relative shadow-2xl">
                  <Image src={session.profilePhotoUrl} alt={session.name} fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-2xl">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-white/50" />
                </div>
              )}
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Selam, {session.name} 👋
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Ethiopian Certified Guide</p>
              </div>
            </div>

            <p className="text-slate-400 text-base mt-6 max-w-lg leading-relaxed">
              Manage your professional availability and respond to contract requests from verified tour operators across Ethiopia.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/guide/edit-profile"
                className="flex items-center gap-2 bg-[#ffd100] hover:bg-[#ffdf40] text-slate-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm transition-all active:scale-95 shadow-xl shadow-[#ffd100]/20"
              >
                <Settings className="w-4 h-4" />
                EDIT PROFILE
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Status Badge */}
            <div className={`flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-[2rem] px-4 sm:px-6 py-3 sm:py-6 ${
              globalStatus === 'free' ? 'border-green-500/30' : 'border-red-500/30'
            }`}>
              <div className={`p-2.5 sm:p-3 rounded-2xl shadow-lg ${
                globalStatus === 'free' ? 'bg-[#009739] shadow-green-500/20' : 'bg-[#ef3340] shadow-red-500/20'
              }`}>
                <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 border-white/60 ${
                  globalStatus === 'free' ? 'bg-green-200' : 'bg-red-200'
                }`} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Global Status
                </p>
                <p className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  {globalStatus === 'free' ? 'OPEN' : 'CLOSED'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-[2rem] px-4 sm:px-8 py-3 sm:py-6">
              <div className="bg-[#009739] p-2.5 sm:p-3 rounded-2xl shadow-lg shadow-green-500/20">
                <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-white shrink-0" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Verified License
                </p>
                <p className="text-base sm:text-lg font-bold text-white">
                  {session.license || 'PENDING'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="animate-fade-in-up stagger-1">
        <DashboardWidgets />
      </div>

      {/* Unavailable Dates */}
      <div className="animate-fade-in-up stagger-2">
        <a
          href="/guide/unavailable-dates"
          className="flex items-center justify-between bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-rose-50 p-3 rounded-xl group-hover:bg-rose-100 transition-colors">
              <CalendarDays className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Manage Unavailable Dates</h3>
              <p className="text-xs text-slate-500 mt-0.5">Select dates when you are not available for tours</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 group-hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            Open
          </span>
        </a>
      </div>

      {/* Contract Inbox */}
      <div className="space-y-4 animate-fade-in-up stagger-3">
        <div className="flex items-center gap-3 text-slate-900 px-2">
          <Inbox className="w-5 h-5 text-[#ef3340]" />
          <span className="text-sm font-black uppercase tracking-widest">Contract Inbox</span>
        </div>
        <HireRequestsList />
      </div>

      <div className="animate-fade-in-up stagger-5">
        <RecentHistory />
      </div>
    </section>
  )
}
