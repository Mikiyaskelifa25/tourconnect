'use client'

import { AppProvider } from '@/lib/store'
import { ProfileForm } from '@/components/guide/profile-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function PageContent() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <ProfileForm onSuccess={() => {}} />
        </div>
      </div>
    </div>
  )
}

export default function GuideEditProfilePage() {
  return (
    <AppProvider>
      <PageContent />
    </AppProvider>
  )
}
