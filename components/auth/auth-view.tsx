'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
import { useApp } from '@/lib/store'
import Image from 'next/image'
import Link from 'next/link'

export function AuthView() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [mounted, setMounted] = useState(false)
  const { session } = useApp()

  useEffect(() => { setMounted(true) }, [])

  if (session) return null

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-hidden bg-slate-950">
      
      {/* ═══════════════════════════════════════ */}
      {/* LEFT SIDE — Brand & Scenic Hero Panel   */}
      {/* ═══════════════════════════════════════ */}
      <div className="relative hidden lg:flex lg:w-[55%] xl:w-[60%] flex-col justify-between p-12 overflow-hidden select-none">
        
        {/* Full-bleed high-res background image of Lalibela */}
        <img 
          src="/ethiopia_hero_landscape.png" 
          alt="Historic Lalibela rock church at sunset"
          className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-10000 hover:scale-105"
        />
        
        {/* Elegant overlay to guarantee readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20 z-10" />
        
        {/* Fine grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiN3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjA1Ij48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] z-10 opacity-70" />

        {/* ── Brand Logo Header ── */}
        <Link href="/" className={`relative z-20 flex items-center gap-3 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="relative">
            <div>
              <Image src="/websitelogo.svg" alt="Ethio Tour Guider Portal" width={80} height={80} className="w-14 h-14 sm:w-20 sm:h-20 brightness-0 invert" unoptimized />
            </div>
          </div>
          <div>
            <span className="text-lg font-black text-white tracking-tight leading-none block font-sans">
              Ethio <span className="text-white">Tour Guider Portal</span>
            </span>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.15em] mt-0.5 block flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ef3340]" />
              Guide & Operator Network
            </span>
          </div>
        </Link>

        {/* ── Hero Centerpiece ── */}
        <div className={`relative z-20 my-auto max-w-xl space-y-6 pr-4 ${mounted ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
          <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.15] tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Guide Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd100] via-[#fbbf24] to-[#f59e0b]">Way</span>
            <br />
            Through{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef3340] to-[#dc2626]">Ethiopia</span>
          </h2>

          <p className="text-slate-200 text-base leading-relaxed">
            The premier digital gateway connecting verified tour operators with elite licensed guides. Step into secure, reliable, and authentic journeys.
          </p>


        </div>

      </div>

      {/* ═══════════════════════════════════════ */}
      {/* RIGHT SIDE — Interactive Auth Column   */}
      {/* ═══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col px-5 sm:px-12 lg:px-16 xl:px-24 py-4 sm:py-12 bg-slate-50 relative overflow-y-auto h-full">
        
        {/* Mobile background image */}
        <div className="absolute inset-0 sm:hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/mob.webp)' }} />
        <div className="absolute inset-0 sm:hidden bg-white/60" />
        
        {/* Subtle decorative color ambient orbs */}
        <div className="absolute top-0 right-0 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-gradient-to-b from-[#2563eb]/5 to-transparent rounded-full blur-[60px] sm:blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-gradient-to-t from-[#ef3340]/5 to-transparent rounded-full blur-[60px] sm:blur-[100px] pointer-events-none" />


        {/* Brand Header for Mobile / Tablet (hidden on desktop) */}
        <div className={`flex lg:hidden items-center justify-center mb-5 shrink-0 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="text-center">
            <span className="text-lg font-black text-black tracking-tight leading-none block">
              Ethio <span className="text-black">Tour Guider Portal</span>
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1 block">
              Guide & Operator Network
            </span>
          </div>
        </div>

        {/* ── Main Form Card ── */}
        <div className={`w-full max-w-lg mx-auto my-auto relative ${mounted ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
          
          <div className="relative bg-white rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100/80">
            
            {/* ── Card Header ── */}
            <div className="relative bg-slate-950 p-5 sm:p-9 text-white overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/[0.02] rounded-full pointer-events-none" />
              <div className="absolute top-1/2 right-6 w-2 h-2 rounded-full bg-[#ffd100]/40 pointer-events-none" />
              <div className="absolute bottom-6 right-12 w-1.5 h-1.5 rounded-full bg-[#2563eb]/40 pointer-events-none" />
              
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-[#2563eb] opacity-75" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Secure Portal</span>
              </div>
              
              <h3 className="text-xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {activeTab === 'login' ? 'Welcome Back' : 'Join the Network'}
              </h3>
              
              <p className="text-slate-400 text-[11px] sm:text-sm mt-1 max-w-md leading-relaxed font-medium">
                {activeTab === 'login'
                  ? 'Sign in to access your professional dashboard and manage your tourism operations.'
                  : 'Create a professional account and connect with Ethiopia\'s leading operators and guides.'}
              </p>
            </div>

            {/* ── Tab Switcher ── */}
            <div className="flex p-1 bg-slate-50 border-b border-slate-100">
              {(['login', 'register'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex-1 py-2.5 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all duration-300 capitalize ${
                    activeTab === tab
                      ? 'text-slate-950 bg-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                  {activeTab === tab && (
                    <span className="absolute inset-x-4 bottom-0 h-0.5 bg-gradient-to-r from-[#2563eb] via-[#ffd100] to-[#ef3340] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* ── Form Body ── */}
            <div className="p-4 sm:p-8">
              {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
              
              {/* Card Footer toggle */}
              <div className="text-center mt-6 text-xs text-slate-400">
                {activeTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                  className="text-[#2563eb] font-bold hover:text-[#1d4ed8] hover:underline transition-colors"
                >
                  {activeTab === 'login' ? 'Register here' : 'Sign in'}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
