'use client'

import { Users, UserSearch, SearchSlash } from 'lucide-react'
import { GuideCard } from './guide-card'
import { useApp } from '@/lib/store'
import type { GuideResult } from '@/types'

interface GuidesResultsProps {
  onHire: (guide: GuideResult) => void
  onViewDetail: (guide: GuideResult) => void
}

export function GuidesResults({ onHire, onViewDetail }: GuidesResultsProps) {
  const { guideResults } = useApp()

  return (
    <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Qualified Guides</h3>
            <p className="text-xs text-slate-400">Matching your search criteria</p>
          </div>
        </div>
        {guideResults.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
            <Users className="w-3 h-3" />
            {guideResults.length} matched
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {guideResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {guideResults.map((guide, i) => (
              <div
                key={guide.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <GuideCard guide={guide} onHire={onHire} onViewDetail={onViewDetail} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
              <UserSearch className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500">No guides found</p>
            <p className="text-xs text-slate-400 mt-1 text-center max-w-[240px]">
              Try adjusting your search filters or date range
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
