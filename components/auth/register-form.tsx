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
  const [userType, setUserType] = useState<'operator' | 'guide'>('operator')
  const [loading, setLoading] = useState(false)

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
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#009739] transition-colors pointer-events-none" />
          <input
            id="reg-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Abebe Bikila"
            className="w-full h-11 pl-11 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#009739] focus:ring-4 focus:ring-[#009739]/10"
          />
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="reg-email" className="text-slate-700 font-semibold text-sm">Email</Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#009739] transition-colors pointer-events-none" />
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@address.com"
              className="w-full h-11 pl-11 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#009739] focus:ring-4 focus:ring-[#009739]/10"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-phone" className="text-slate-700 font-semibold text-sm">Phone</Label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#009739] transition-colors pointer-events-none" />
            <input
              id="reg-phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 91 234 5678"
              className="w-full h-11 pl-11 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#009739] focus:ring-4 focus:ring-[#009739]/10"
            />
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-password" className="text-slate-700 font-semibold text-sm">Password</Label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#009739] transition-colors pointer-events-none" />
          <input
            id="reg-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className="w-full h-11 pl-11 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#009739] focus:ring-4 focus:ring-[#009739]/10"
          />
        </div>
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
                  ? 'border-[#009739] bg-gradient-to-br from-[#009739]/10 to-[#009739]/5 text-[#009739] shadow-md shadow-green-500/5 scale-[1.02]'
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
        className="w-full h-12 text-sm font-bold bg-gradient-to-r from-[#009739] to-[#007a2e] hover:from-[#007a2e] hover:to-[#006625] text-white rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
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
