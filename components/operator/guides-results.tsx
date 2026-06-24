'use client'

import { Users, UserSearch } from 'lucide-react'
import { GuideCard } from './guide-card'
import { useApp } from '@/lib/store'
import type { GuideResult } from '@/types'

interface GuidesResultsProps {
  onHire: (guide: GuideResult) => void
}

export function GuidesResults({ onHire }: GuidesResultsProps) {
  const { guideResults } = useApp()

  return (
    <div
      className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-green-50 p-2 rounded-xl">
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Qualified Guides</h3>
            <p className="text-[11px] text-slate-500">Matching your search criteria</p>
          </div>
        </div>
        {guideResults.length > 0 && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {guideResults.length} matched
          </span>
        )}
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guideResults.length > 0 ? (
            guideResults.map((guide, i) => (
              <div
                key={guide.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <GuideCard guide={guide} onHire={onHire} />
              </div>
            ))
          ) : (
            <div className="col-span-full h-48 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 gap-3">
              <UserSearch className="w-11 h-11 opacity-50" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-500">No guides found yet</p>
                <p className="text-xs text-slate-400 mt-1">Use the filters to search for available guides</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
