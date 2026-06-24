import type { Session } from '@/types'
import { supabase } from './supabase'

async function getProfileByEmail(email: string) {
  const normalizedEmail = email.toLowerCase()
  const { data: guide } = await supabase
    .from('tour_guides')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (guide) {
    return { ...guide, user_type: 'guide' as const }
  }

  const { data: operator } = await supabase
    .from('tour_operators')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (operator) {
    return { ...operator, user_type: 'operator' as const, rating_avg: null, license_number: null, availability_status: null }
  }

  return null
}

function profileToSession(profile: NonNullable<Awaited<ReturnType<typeof getProfileByEmail>>>): Session {
  return {
    userId: profile.id,
    userType: profile.user_type,
    name: profile.name,
    license: 'license_number' in profile ? (profile as any).license_number : null,
    email: profile.email,
    profilePhotoUrl: profile.profile_photo_url,
  }
}

export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const profile = await getProfileByEmail(session.user.email!)
  if (!profile) return null

  return profileToSession(profile)
}

export async function login(email: string, password: string): Promise<{ session: Session | null; error: string | null }> {
  const normalizedEmail = email.toLowerCase()
  const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
  if (error) return { session: null, error: error.message }

  const profile = await getProfileByEmail(normalizedEmail)
  if (!profile) return { session: null, error: 'Profile not found. Please contact support.' }

  return { session: profileToSession(profile), error: null }
}

export async function register(opts: {
  name: string
  email: string
  password: string
  phone: string
  userType: 'guide' | 'operator'
  licenseNumber?: string
}): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signUp({
    email: opts.email,
    password: opts.password,
    options: {
      data: {
        name: opts.name,
        user_type: opts.userType,
      }
    }
  })

  if (error) return { error: error.message }

  const normalizedEmail = opts.email.toLowerCase()

  if (opts.userType === 'guide') {
    const { error: profileError } = await supabase.from('tour_guides').insert({
      name: opts.name,
      email: normalizedEmail,
      phone: opts.phone,
      license_number: opts.licenseNumber || null,
    })
    if (profileError) return { error: profileError.message }
  } else {
    const { error: profileError } = await supabase.from('tour_operators').insert({
      name: opts.name,
      email: normalizedEmail,
      phone: opts.phone,
    })
    if (profileError) return { error: profileError.message }
  }

  return { error: null }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

export function onAuthChange(callback: (session: Session | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session?.user) {
      callback(null)
      return
    }

    const profile = await getProfileByEmail(session.user.email!)
    if (!profile) {
      return
    }

    callback(profileToSession(profile))
  })

  return subscription.unsubscribe
}
