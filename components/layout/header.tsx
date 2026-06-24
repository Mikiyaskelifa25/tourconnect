'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useApp } from '@/lib/store'
import { NotificationsPanel } from '@/components/shared/notifications-panel'
import { HistoryPanel } from '@/components/shared/history-panel'

export function Header() {
  const { session, logout } = useApp()

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-5 flex items-center justify-between shrink-0 z-50 sticky top-0 gap-2 sm:gap-3">
      {/* Logo + Brand */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="group cursor-pointer shrink-0">
            <div className="p-1 sm:p-2 transition-all duration-300 group-hover:scale-110 active:scale-110">
              <Image src="/websitelogo.svg" alt="Ethio Tour Guider Portal" width={48} height={48} className="w-8 h-8 sm:w-12 sm:h-12" unoptimized />
            </div>
          </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-xl font-black tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="sm:hidden">Ethio TGP</span>
            <span className="hidden sm:inline">Ethio <span className="text-slate-900">Tour Guider Portal</span></span>
          </h1>
          <p className="hidden sm:flex text-[10px] font-bold text-slate-400 uppercase tracking-widest items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef3340]" />
            Guide & Operator Network
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {session ? (
          <>
            <HistoryPanel />
            <NotificationsPanel />

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-9 sm:h-10 px-2.5 sm:px-4 text-slate-400 hover:text-[#ef3340] hover:bg-red-50 gap-1 sm:gap-2 rounded-xl transition-all font-bold text-[11px] sm:text-xs"
              id="logout-btn"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-xs font-bold text-slate-400 uppercase tracking-widest">Platform Status:</span>
            <div className="flex items-center gap-2 bg-green-50 text-[#009739] px-2 sm:px-3 py-1.5 rounded-full border border-green-100">
              <div className="w-1.5 h-1.5 rounded-full bg-[#009739] animate-pulse shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase whitespace-nowrap">Live & Secure</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
