'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Session, HireRequestWithOperator, GuideResult } from '@/types'
import { getSession, logout as authLogout, onAuthChange } from './auth'

interface AppContextType {
  session: Session | null
  guideRequests: HireRequestWithOperator[]
  guideResults: GuideResult[]
  selectedHireId: string | null
  login: (session: Session) => void
  logout: () => void
  setGuideRequests: (requests: HireRequestWithOperator[]) => void
  setGuideResults: (results: GuideResult[]) => void
  setSelectedHireId: (id: string | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null)
  const [guideRequests, setGuideRequests] = useState<HireRequestWithOperator[]>([])
  const [guideResults, setGuideResults] = useState<GuideResult[]>([])
  const [selectedHireId, setSelectedHireId] = useState<string | null>(null)

  useEffect(() => {
    getSession().then(setSessionState)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthChange((newSession) => {
      setSessionState(newSession)
    })
    return unsubscribe
  }, [])

  const login = useCallback((session: Session) => {
    setSessionState(session)
  }, [])

  const logout = useCallback(() => {
    authLogout()
    setSessionState(null)
    setGuideRequests([])
    setGuideResults([])
    setSelectedHireId(null)
  }, [])

  return (
    <AppContext.Provider
      value={{
        session,
        guideRequests,
        guideResults,
        selectedHireId,
        login,
        logout,
        setGuideRequests,
        setGuideResults,
        setSelectedHireId,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
