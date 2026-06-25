'use client'

import { useState } from 'react'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { apiLogin } from '@/lib/api'
import { useApp } from '@/lib/store'
import { toastError } from '@/lib/toast'
import type { Session } from '@/types'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useApp()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiLogin({ email, password })
      if (res.ok) {
        const data = res.data as { userId: string; userType: 'guide' | 'operator'; name: string; license: string | null; profilePhotoUrl: string | null }
        const session: Session = {
          userId: data.userId,
          userType: data.userType,
          name: data.name,
          license: data.license,
          email,
          profilePhotoUrl: data.profilePhotoUrl ?? null,
        }
        login(session)
      } else {
        toastError({ title: 'Authentication Failed', description: (res.data as { error: string }).error || 'Invalid email or password' })
      }
    } catch {
      toastError({ title: 'Connection Error', description: 'Unable to reach the server. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="login-email" className="text-slate-700 font-semibold text-sm">Email Address</Label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563eb] transition-colors pointer-events-none" />
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@example.com"
            className="w-full h-12 pl-11 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password" className="text-slate-700 font-semibold text-sm">Password</Label>
        </div>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563eb] transition-colors pointer-events-none" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-12 pl-11 pr-12 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-sm font-bold bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#006625] text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
        id="login-submit-btn"
      >
        {loading ? (
          <span className="flex items-center gap-2.5">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="font-semibold">Signing in…</span>
          </span>
        ) : (
          <span className="flex items-center gap-2.5">
            <LogIn className="w-4.5 h-4.5" />
            <span className="font-semibold">Sign In to Portal</span>
          </span>
        )}
      </Button>
    </form>
  )
}
