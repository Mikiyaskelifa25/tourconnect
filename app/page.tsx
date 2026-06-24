'use client'

import { AppProvider, useApp } from '@/lib/store'
import { FlagBanner } from '@/components/layout/flag-banner'
import { Header } from '@/components/layout/header'
import { AuthView } from '@/components/auth/auth-view'
import { GuideDashboard } from '@/components/guide/guide-dashboard'
import { OperatorDashboard } from '@/components/operator/operator-dashboard'
import { GuideDetailDialog } from '@/components/shared/guide-detail-dialog'

function AppContent() {
  const { session } = useApp()

  if (!session) {
    return <AuthView />
  }

  return (
    <main
      className="flex-1 overflow-y-auto"
      id="main-content-panel"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {session.userType === 'guide' && <GuideDashboard />}
        {session.userType === 'operator' && <OperatorDashboard />}
      </div>
    </main>
  )
}

function MainLayout() {
  const { session } = useApp()
  return (
    <>
      {session && (
        <>
          <FlagBanner />
          <Header />
        </>
      )}
      <AppContent />
      <GuideDetailDialog />
    </>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  )
}
