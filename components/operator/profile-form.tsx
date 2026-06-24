'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Phone, Save, Loader2, Camera, Image as ImageIcon, Building2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiGetProfile, apiUpdateProfile, apiUploadAvatar } from '@/lib/api'
import { useApp } from '@/lib/store'
import { getSession } from '@/lib/auth'
import Image from 'next/image'

export function OperatorProfileForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useApp()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    profilePhotoUrl: '',
  })

  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const res = await apiGetProfile()
      if (res.ok) {
        const data = res.data as any
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          profilePhotoUrl: data.profile_photo_url || '',
        })
      } else {
        setError('Failed to load profile')
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccess(null)
    const url = await apiUploadAvatar(file)
    if (url) {
      setFormData(prev => ({ ...prev, profilePhotoUrl: url }))
    } else {
      setError('Failed to upload image')
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const res = await apiUpdateProfile(formData)
    if (res.ok) {
      const updatedSession = await getSession()
      if (updatedSession) login(updatedSession)
      setSuccess('Profile updated successfully!')
      onSuccess?.()
    } else {
      setError((res.data as any).error || 'Failed to update profile')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <Loader2 className="w-10 h-10 text-[#009739] animate-spin" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading profile details...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6 sm:p-10">
      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100/50 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-bold border border-emerald-100/50 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Logo/Photo Upload */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-slate-50 border-4 border-white shadow-xl relative transition-transform duration-300 group-hover:scale-[1.02]">
              {formData.profilePhotoUrl ? (
                <Image
                  src={formData.profilePhotoUrl}
                  alt="Company Logo Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                  <Building2 className="w-12 h-12 text-slate-300" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-[#ffd100] text-slate-900 p-2.5 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-white"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Company Logo / Avatar</p>
            <p className="text-[9px] text-slate-400 mt-1">Recommended: Square format image</p>
          </div>
        </div>

        {/* Company Name */}
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
            Company Name
          </Label>
          <div className="relative group">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#009739] transition-colors" />
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-[#009739]/10 focus:border-[#009739]/30 transition-all text-slate-900 font-medium"
              placeholder="e.g. Lalibela Eco Tours"
              required
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="grid gap-2">
          <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
            Phone Number
          </Label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#009739] transition-colors" />
            <Input
              id="phone"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-[#009739]/10 focus:border-[#009739]/30 transition-all text-slate-900 font-medium"
              placeholder="+251 911 000000"
            />
          </div>
        </div>

        {/* Email (Read-Only) */}
        <div className="grid gap-2 opacity-80">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
            Email Address (Read-Only)
          </Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="email"
              value={formData.email}
              disabled
              className="pl-12 h-14 bg-slate-100 border-slate-100 rounded-[1.25rem] text-slate-500 font-medium cursor-not-allowed select-none"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 sticky bottom-0 bg-white">
        <Button
          type="submit"
          disabled={saving || uploading}
          className="w-full h-14 sm:h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.25rem] sm:rounded-[1.5rem] shadow-xl shadow-slate-200 font-black gap-2 sm:gap-3 text-sm sm:text-lg transition-all active:scale-[0.98]"
        >
          {saving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Save className="w-6 h-6" />
              Save Operator Profile
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
