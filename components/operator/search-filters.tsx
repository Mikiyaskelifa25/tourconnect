'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LANGUAGES, DESTINATIONS } from '@/lib/languages'

interface SearchFiltersProps {
  onSearch: (filters: {
    date: string
    name: string
    location: string
    language: string
    freeOnly: boolean
  }) => void
}

const SELECT_BASE =
  'flex h-10 w-full rounded-xl border-[1.5px] border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 hover:border-slate-300 backdrop-blur-sm appearance-none cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap'

export function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [language, setLanguage] = useState('')
  const [freeOnly, setFreeOnly] = useState(true)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch({ date, name, location, language, freeOnly })
  }

  return (
    <div
      className="bg-white/85 backdrop-blur-sm border border-white/70 rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm">Find a Guide</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">Filter by date, location & language</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="search-name">Guide Name</Label>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563eb] transition-colors pointer-events-none" />
            <input
              id="search-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search by name..."
              className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="search-date">Target Date</Label>
          <Input
            id="search-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="search-location">Destination</Label>
          <div className="relative">
            <select
              id="search-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={SELECT_BASE}
            >
              <option value="">Any Destination</option>
              {DESTINATIONS.map(d => (
                <option key={d.name} value={d.name}>{d.icon} {d.name}</option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="search-languages">Language</Label>
          <div className="relative">
            <select
              id="search-languages"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={SELECT_BASE}
            >
              <option value="">Any Language</option>
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Free only switch */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <div
            onClick={() => setFreeOnly(!freeOnly)}
            className="flex items-center gap-3 cursor-pointer select-none w-full"
          >
            <div className="relative">
              <input
                type="checkbox"
                id="search-status-free"
                className="sr-only"
                checked={freeOnly}
                readOnly
              />
              <div className={`w-10 h-6 rounded-full transition-all duration-200 relative ${
                freeOnly ? 'bg-blue-500' : 'bg-slate-300'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                  freeOnly ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Available Only</p>
              <p className="text-[10px] text-slate-500">Show free / available guides</p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full h-11"
          id="search-guides-btn"
        >
          <Search className="w-4 h-4" />
          Search Guides
        </Button>
      </form>
    </div>
  )
}
