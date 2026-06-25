'use client'

import { useState } from 'react'
import { UserPlus, User, Mail, Phone, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { apiRegister } from '@/lib/api'
import { toastSuccess, toastError } from '@/lib/toast'

export function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState<'operator' | 'guide'>('operator')
  const [loading, setLoading] = useState(false)

  const passwordStrength = getPasswordStrength(password)
  const passwordsMatch = password === confirmPassword
  const showStrength = password.length > 0
  const showConfirmError = confirmPassword.length > 0 && !passwordsMatch
  const canSubmit = password.length >= 8 && passwordsMatch

  function getPasswordStrength(pw: string) {
    if (!pw) return { score: 0, label: '', color: '', width: '0%' }
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[a-z]/.test(pw)) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^a-zA-Z0-9]/.test(pw)) score++
    const levels = [
      { label: 'Weak', color: 'bg-red-500', width: '16%' },
      { label: 'Fair', color: 'bg-orange-500', width: '33%' },
      { label: 'Good', color: 'bg-yellow-500', width: '50%' },
      { label: 'Strong', color: 'bg-lime-500', width: '66%' },
      { label: 'Very Strong', color: 'bg-green-500', width: '83%' },
      { label: 'Excellent', color: 'bg-[#2563eb]', width: '100%' },
    ]
    return levels[Math.min(score, levels.length - 1)]
  }

  const onSuccess: () => void = () => {}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await apiRegister({
        name,
        email,
        password,
        phone,
        userType,
      })

      if (res.ok) {
        toastSuccess({ title: 'Account Created', description: 'Please login with your credentials.' })
        onSuccess()
      } else {
        toastError({ title: 'Registration Failed', description: (res.data as { error: string }).error || 'Something went wrong' })
      }
    } catch {
      toastError({ title: 'Connection Error', description: 'Unable to reach the server. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-name" className="text-slate-700 font-semibold text-sm">Full Name / Agency Name</Label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563eb] transition-colors pointer-events-none" />
          <input
            id="reg-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Abebe Bikila"
            className="w-full h-11 pl-11 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
          />
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="reg-email" className="text-slate-700 font-semibold text-sm">Email</Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563eb] transition-colors pointer-events-none" />
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@address.com"
              className="w-full h-11 pl-11 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-phone" className="text-slate-700 font-semibold text-sm">Phone</Label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563eb] transition-colors pointer-events-none" />
            <input
              id="reg-phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 91 234 5678"
              className="w-full h-11 pl-11 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
            />
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-password" className="text-slate-700 font-semibold text-sm">Password</Label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563eb] transition-colors pointer-events-none" />
          <input
            id="reg-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className="w-full h-11 pl-11 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
          />
        </div>
        {showStrength && (
          <div className="pt-1 space-y-1">
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: passwordStrength.width }} />
            </div>
            <p className="text-[11px] font-bold text-slate-500">
              Strength: <span className={passwordStrength.color.replace('bg-', 'text-')}>{passwordStrength.label}</span>
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-confirm-password" className="text-slate-700 font-semibold text-sm">Confirm Password</Label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563eb] transition-colors pointer-events-none" />
          <input
            id="reg-confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className={`w-full h-11 pl-11 pr-4 text-sm bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:ring-4 ${
              showConfirmError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                : confirmPassword.length > 0 && passwordsMatch
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500/10'
                  : 'border-slate-200 focus:border-[#2563eb] focus:ring-[#2563eb]/10'
            }`}
          />
        </div>
        {showConfirmError && (
          <p className="text-[11px] font-bold text-red-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Passwords do not match
          </p>
        )}
        {confirmPassword.length > 0 && passwordsMatch && (
          <p className="text-[11px] font-bold text-green-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Passwords match
          </p>
        )}
      </div>

      {/* User Type */}
      <div className="space-y-1.5">
        <Label className="text-slate-700 font-semibold text-sm">Account Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {(['operator', 'guide'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setUserType(type)}
              className={`h-11 rounded-xl border-[1.5px] text-sm font-bold transition-all duration-300 active:scale-[0.98] ${
                userType === type
                  ? 'border-[#2563eb] bg-gradient-to-br from-[#2563eb]/10 to-[#2563eb]/5 text-[#2563eb] shadow-md shadow-blue-500/5 scale-[1.02]'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100/50 hover:text-slate-600'
              }`}
              id={`reg-type-${type}`}
            >
              {type === 'operator' ? '🏢 Tour Operator' : '🧭 Tour Guide'}
            </button>
          ))}
        </div>
      </div>


      <Button
        type="submit"
        className="w-full h-12 text-sm font-bold bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#006625] text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading || !canSubmit}
        id="register-submit-btn"
      >
        {loading ? (
          <span className="flex items-center gap-2.5">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="font-semibold">Creating Account…</span>
          </span>
        ) : (
          <span className="flex items-center gap-2.5">
            <UserPlus className="w-4.5 h-4.5" />
            <span className="font-semibold">Complete Registration</span>
          </span>
        )}
      </Button>
    </form>
  )
}
