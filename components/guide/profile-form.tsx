'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Phone, ShieldCheck, Languages, MapPin, Save, Loader2, Plus, X, Camera, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { apiGetProfile, apiUpdateProfile, apiUploadAvatar } from '@/lib/api'
import { useApp } from '@/lib/store'
import { getSession } from '@/lib/auth'
import { LANGUAGES, DESTINATIONS, getLanguageName, getLanguageFlag } from '@/lib/languages'
import Image from 'next/image'

export function ProfileForm({ onSuccess }: { onSuccess?: () => void }) {
  const { login } = useApp()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    profilePhotoUrl: '',
    website: '',
    languages: [] as { code: string; proficiency: string }[],
    locations: [] as string[],
  })

  const [newLang, setNewLang] = useState({ code: '', proficiency: 'fluent' })
  const [newLoc, setNewLoc] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const res = await apiGetProfile()
      if (res.ok) {
        const data = res.data as any
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          licenseNumber: data.license_number || '',
          profilePhotoUrl: data.profile_photo_url || '',
          website: data.website || '',
          languages: data.guide_languages.map((l: any) => ({ code: l.language_code, proficiency: l.proficiency })),
          locations: data.guide_locations.map((l: any) => l.location_name),
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

    const res = await apiUpdateProfile(formData)
    if (res.ok) {
      // Refresh session in store
      const updatedSession = await getSession()
      if (updatedSession) login(updatedSession)
      onSuccess?.()
    } else {
      setError((res.data as any).error || 'Failed to update profile')
    }
    setSaving(false)
  }

  const addLanguage = () => {
    if (newLang.code && !formData.languages.some(l => l.code.toLowerCase() === newLang.code.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, { ...newLang, code: newLang.code.toLowerCase() }]
      }))
      setNewLang({ code: '', proficiency: 'fluent' })
    }
  }

  const removeLanguage = (code: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l.code !== code)
    }))
  }

  const addLocation = () => {
    if (newLoc && !formData.locations.some(l => l.toLowerCase() === newLoc.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, newLoc]
      }))
      setNewLoc('')
    }
  }

  const removeLocation = (loc: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== loc)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
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

      {/* Top Header Section inside the form */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-lg mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffd100]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#2563eb]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            Guide Portfolio
          </span>
          <h3 className="text-xl sm:text-2xl font-black mt-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Update Profile Information
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Keep your credentials, languages, and service locations updated. This helps operators find you for active tours.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-slate-50 border-4 border-white shadow-xl relative transition-transform duration-300 group-hover:scale-[1.02]">
              {formData.profilePhotoUrl ? (
                <Image
                  src={formData.profilePhotoUrl}
                  alt="Profile Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                  <ImageIcon className="w-12 h-12 text-slate-300" />
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
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Professional Headshot</p>
            <p className="text-[9px] text-slate-400 mt-1">Recommended: Clear face shot</p>
          </div>
        </div>

        {/* Section 1: Personal Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-[#2563eb]" />
            Basic Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563eb] transition-colors" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-[#2563eb]/10 focus:border-[#2563eb]/30 transition-all text-slate-900 font-medium"
                  placeholder="Abebe Bikila"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Phone Number
              </Label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563eb] transition-colors" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-[#2563eb]/10 focus:border-[#2563eb]/30 transition-all text-slate-900 font-medium"
                  placeholder="+251 911 000000"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="website" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Website
            </Label>
            <div className="relative group">
              <Input
                id="website"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                className="h-14 bg-slate-50 border-slate-100 rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-[#2563eb]/10 focus:border-[#2563eb]/30 transition-all text-slate-900 font-medium pl-4"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Section 2: License Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2563eb]" />
            Official Credentials
          </h4>
          <div className="grid gap-2">
            <Label htmlFor="license" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Tour Guide License Number
            </Label>
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563eb] transition-colors" />
              <Input
                id="license"
                value={formData.licenseNumber}
                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-[#2563eb]/10 focus:border-[#2563eb]/30 transition-all text-slate-900 font-medium"
                placeholder="ET-G-XXXX"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Languages & Proficiency */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#2563eb]" />
            Languages Spoken
          </h4>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Active Languages
            </Label>
            <div className="flex flex-wrap gap-2 mb-1 min-h-[3rem] items-center p-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              {formData.languages.length === 0 && <span className="text-xs text-slate-400 italic">No languages added yet</span>}
              {formData.languages.map(l => (
                <Badge key={l.code} variant="secondary" className="pl-3 pr-1.5 py-1.5 gap-2 rounded-xl bg-white border-slate-200 shadow-sm text-slate-700 normal-case">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">{getLanguageFlag(l.code)}</span>
                    <span className="text-xs font-bold text-slate-800">{getLanguageName(l.code)}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{l.proficiency}</span>
                  </div>
                  <button type="button" onClick={() => removeLanguage(l.code)} className="p-1 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={newLang.code}
                onChange={e => setNewLang({ ...newLang, code: e.target.value })}
                className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 ring-[#2563eb]/10 focus:border-[#2563eb]/30 appearance-none flex-1 min-w-0"
              >
                <option value="">Select language...</option>
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                ))}
              </select>
              <select
                value={newLang.proficiency}
                onChange={e => setNewLang({ ...newLang, proficiency: e.target.value })}
                className="h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs sm:text-sm font-bold text-slate-600 outline-none focus:bg-white focus:ring-4 ring-[#2563eb]/10 focus:border-[#2563eb]/30 appearance-none flex-1 min-w-0"
              >
                <option value="native">Native</option>
                <option value="fluent">Fluent</option>
                <option value="intermediate">Intermediate</option>
                <option value="conversational">Conversational</option>
              </select>
              <Button type="button" variant="primary" onClick={addLanguage} className="h-12 px-5 shrink-0 rounded-xl font-bold gap-2 text-sm">
                <Plus className="w-5 h-5" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Section 4: Service Locations */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2563eb]" />
            Operating Regions
          </h4>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Active Coverage Locations
            </Label>
            <div className="flex flex-wrap gap-2 mb-1 min-h-[3rem] items-center p-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              {formData.locations.length === 0 && <span className="text-xs text-slate-400 italic">No locations added yet</span>}
              {formData.locations.map(loc => (
                <Badge key={loc} variant="default" className="pl-3 pr-1.5 py-1.5 gap-2 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-700 normal-case">
                  <span className="font-bold text-slate-700">{loc}</span>
                  <button type="button" onClick={() => removeLocation(loc)} className="p-1 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search or type a destination..."
                  value={newLoc}
                  onChange={e => setNewLoc(e.target.value)}
                  className="pl-12 h-12 bg-slate-50 border-slate-100 rounded-xl focus:bg-white transition-all text-slate-900 font-medium"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                />
              </div>
              <Button type="button" variant="primary" onClick={addLocation} className="h-12 px-5 shrink-0 rounded-xl font-bold gap-2 text-sm">
                <Plus className="w-5 h-5" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DESTINATIONS.filter(d => !formData.locations.some(l => l.toLowerCase() === d.name.toLowerCase())).slice(0, 10).map(d => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => {
                    if (!formData.locations.some(l => l.toLowerCase() === d.name.toLowerCase())) {
                      setFormData(prev => ({ ...prev, locations: [...prev.locations, d.name] }))
                    }
                  }}
                  className="text-[11px] font-bold text-slate-500 bg-slate-50 hover:bg-[#2563eb] hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-100 hover:border-[#2563eb] transition-all whitespace-nowrap"
                >
                  {d.icon} {d.name}
                </button>
              ))}
              {DESTINATIONS.filter(d => !formData.locations.some(l => l.toLowerCase() === d.name.toLowerCase())).length > 10 && (
                <span className="text-[10px] text-slate-400 self-center ml-1">+more</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 sticky bottom-0 bg-white border-t border-slate-100/80">
        <Button
          type="submit"
          disabled={saving || uploading}
          className="w-full h-14 sm:h-16 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-[1.25rem] sm:rounded-[1.5rem] shadow-xl shadow-blue-500/20 font-black gap-2 sm:gap-3 text-sm sm:text-lg transition-all active:scale-[0.98]"
        >
          {saving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Save className="w-6 h-6" />
              Save & Update Profile
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
