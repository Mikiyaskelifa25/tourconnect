import { Suspense } from 'react'
import { AppProvider } from '@/lib/store'
import { GuideCalendarContent } from './content'

export default function GuideCalendarPage() {
  return (
    <AppProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
        </div>
      }>
        <GuideCalendarContent />
      </Suspense>
    </AppProvider>
  )
}
