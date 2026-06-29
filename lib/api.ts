import type {
  ApiResponse,
  LoginPayload,
  RegisterPayload,
  AvailabilityPayload,
  SearchPayload,
  HirePayload,
  GuideResult,
  HireRequestWithOperator,
  RequestHistoryItem,
  Notification,
  HireDetails,
  Rating,
  MonthAvailability,
  BookingWithOperator,
  DashboardStats,
  RecurringSchedule,
  GuideAvailabilityResponse,
  JobPostingWithOperator,
  JobApplicationWithGuide,
  JobPostingPayload,
} from '@/types'
import { supabase } from './supabase'
import { login as authLogin, register as authRegister } from './auth'

function userTable(userType: string): string {
  return userType === 'guide' ? 'tour_guides' : 'tour_operators'
}

export async function apiRegister(body: RegisterPayload): Promise<ApiResponse> {
  const { name, password, phone, userType, languages, locations, licenseNumber } = body
  const email = body.email.toLowerCase()

  const { error } = await authRegister({
    name, email, password, phone, userType, licenseNumber,
  })

  if (error) {
    return { ok: false, status: 400, data: { error } }
  }

  if (userType === 'guide') {
    const { data: profile } = await supabase
      .from('tour_guides')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (profile) {
      if (languages && languages.length > 0) {
        await supabase.from('guide_languages').insert(
          languages.map((lang) => ({
            guide_id: profile.id,
            language_code: lang.code,
            proficiency: lang.proficiency,
          }))
        )
      }

      if (locations && locations.length > 0) {
        await supabase.from('guide_locations').insert(
          locations.map((loc) => ({
            guide_id: profile.id,
            location_name: loc,
          }))
        )
      }

      // Create a default 'free' availability entry for today
      await supabase.from('availability').upsert(
        {
          guide_id: profile.id,
          date: new Date().toISOString().split('T')[0],
          status: 'free',
          notes: 'Newly registered guide',
        },
        { onConflict: 'guide_id,date' }
      )
    } else {
      console.error('[apiRegister] Guide profile not found after registration for email:', email)
    }
  }

  const response = { success: true, message: 'Registration successful' }
  return { ok: true, status: 200, data: response }
}

export async function apiLogin(body: LoginPayload): Promise<ApiResponse> {
  const { email, password } = body

  const { session, error } = await authLogin(email, password)

  if (error) {
    return { ok: false, status: 401, data: { error } }
  }

  const response = {
    userId: session!.userId,
    userType: session!.userType,
    name: session!.name,
    license: session!.license,
    profilePhotoUrl: session!.profilePhotoUrl,
  }
  return { ok: true, status: 200, data: response }
}

export async function apiUpdateAvailability(token: string | null, body: AvailabilityPayload): Promise<ApiResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { data: profile } = await supabase
    .from('tour_guides')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!profile) {
    return { ok: false, status: 403, data: { error: 'Only guides can update availability' } }
  }

  const { date, status, notes } = body
  const allowed = ['free', 'close'] as const
  const dbStatus = allowed.includes(status as typeof allowed[number]) ? status : 'close'

  const { error } = await supabase.from('availability').upsert(
    { guide_id: profile.id, date, status: dbStatus, notes: notes || '' },
    { onConflict: 'guide_id,date' }
  )

  if (error) {
    console.error('[apiUpdateAvailability]', { status, dbStatus, date, error: error.message })
    return { ok: false, status: 500, data: { error: error.message } }
  }

  const response = { success: true }
  return { ok: true, status: 200, data: response }
}

export async function apiSearchGuides(_token: string | null, body: SearchPayload): Promise<ApiResponse<GuideResult[]>> {
  const { name, languages, location, date, status } = body
  const targetDate = date || new Date().toISOString().split('T')[0]

  let guideIds: string[] | null = null

  if (location) {
    const { data: locData } = await supabase
      .from('guide_locations')
      .select('guide_id')
      .eq('location_name', location)
    guideIds = (locData || []).map((r: Record<string, string>) => r.guide_id)
    if (guideIds.length === 0) return { ok: true, status: 200, data: [] }
  }

  if (languages && languages.length > 0) {
    const { data: langData } = await supabase
      .from('guide_languages')
      .select('guide_id')
      .in('language_code', languages)
    const langIds = [...new Set((langData || []).map((r: Record<string, string>) => r.guide_id))]
    if (guideIds !== null) {
      guideIds = guideIds.filter((id) => langIds.includes(id))
    } else {
      guideIds = langIds
    }
    if (guideIds.length === 0) return { ok: true, status: 200, data: [] }
  }

  let query = supabase
    .from('tour_guides')
    .select('id, name, email, phone, rating_avg, profile_photo_url, website')

  if (name) {
    query = query.ilike('name', `%${name}%`)
  }

  if (guideIds !== null) {
    query = query.in('id', guideIds)
  }

  const { data: guides, error } = await query.order('rating_avg', { ascending: false })

  if (error) {
    console.error('[apiSearchGuides] Supabase error:', error.message, error.details)
    return { ok: false, status: 500, data: { error: error.message } }
  }

  if (!guides || guides.length === 0) {
    return { ok: true, status: 200, data: [] }
  }

  const ids = (guides as Record<string, string>[]).map((g) => g.id)

  const [langRes, locRes, unavailRes] = await Promise.all([
    supabase.from('guide_languages').select('guide_id, language_code').in('guide_id', ids),
    supabase.from('guide_locations').select('guide_id, location_name').in('guide_id', ids),
    supabase.from('guide_unavailable_dates').select('guide_id, date').in('guide_id', ids),
  ])

  const langMap: Record<string, string[]> = {}
  for (const row of (langRes.data || []) as Record<string, string>[]) {
    if (!langMap[row.guide_id]) langMap[row.guide_id] = []
    langMap[row.guide_id].push(row.language_code)
  }

  const locMap: Record<string, string[]> = {}
  for (const row of (locRes.data || []) as Record<string, string>[]) {
    if (!locMap[row.guide_id]) locMap[row.guide_id] = []
    locMap[row.guide_id].push(row.location_name)
  }

  const unavailMap: Record<string, string[]> = {}
  for (const row of (unavailRes.data || []) as Record<string, string>[]) {
    if (!unavailMap[row.guide_id]) unavailMap[row.guide_id] = []
    unavailMap[row.guide_id].push(row.date)
  }

  const results: GuideResult[] = (guides as Record<string, string>[]).map((g) => {
    const gLangs = langMap[g.id] || []
    const gLocs = locMap[g.id] || []
    const gUnavailable = unavailMap[g.id] || []
    const isUnavailable = gUnavailable.includes(targetDate)
    const availStatus: 'free' | 'close' = isUnavailable ? 'close' : 'free'

    if (status === 'free' && availStatus !== 'free') return null

    return {
      id: g.id,
      name: g.name,
      email: g.email,
      phone: g.phone || null,
      rating_avg: g.rating_avg !== undefined ? Number(g.rating_avg) : null,
      languages: [...new Set(gLangs)].join(','),
      locations: [...new Set(gLocs)].join(','),
      availability_status: availStatus,
      profile_photo_url: g.profile_photo_url || null,
      website: g.website || null,
      unavailable_dates: gUnavailable,
    }
  }).filter(Boolean) as GuideResult[]

  console.log(`[apiSearchGuides] Found ${results.length} guides`)
  return { ok: true, status: 200, data: results }
}

export async function apiSendHireRequest(_token: string | null, body: HirePayload): Promise<ApiResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { data: profile } = await supabase
    .from('tour_operators')
    .select('id, name')
    .eq('email', session.user.email)
    .single()

  if (!profile) {
    return { ok: false, status: 403, data: { error: 'Only operators can send hire requests' } }
  }

  const { guideId, startDate, endDate, message, dailyRate } = body

  const { data: newRequest, error } = await supabase
    .from('hire_requests')
    .insert({
      operator_id: profile.id,
      guide_id: guideId,
      start_date: startDate,
      end_date: endDate,
      message,
      daily_rate: dailyRate,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    return { ok: false, status: 500, data: { error: error.message } }
  }

  await supabase.from('notifications').insert({
    hire_request_id: newRequest.id,
    recipient_id: guideId,
    type: 'sent',
    message: `${profile.name} has sent you a hire request.`,
  })

  const response = { success: true, message: 'Hire request sent successfully' }
  return { ok: true, status: 200, data: response }
}

export async function apiGetGuideRequests(): Promise<ApiResponse<HireRequestWithOperator[]>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { data: profile } = await supabase
    .from('tour_guides')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!profile) {
    return { ok: false, status: 403, data: { error: 'Unauthorized' } }
  }

  const { data, error } = await supabase
    .from('hire_requests')
    .select(`
      *,
      operator:operator_id(id, name, email)
    `)
    .eq('guide_id', profile.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    return { ok: false, status: 500, data: { error: error.message } }
  }

  const hireRows = ((data || []) as Record<string, unknown>[])
  const results: HireRequestWithOperator[] = hireRows.map((item) => ({
    id: item.id as string,
    operator_id: item.operator_id as string,
    guide_id: item.guide_id as string,
    start_date: item.start_date as string,
    end_date: item.end_date as string,
    message: item.message as string,
    daily_rate: item.daily_rate as number,
    status: item.status as 'pending' | 'accepted' | 'rejected',
    created_at: item.created_at as string,
    operator_name: (item.operator as Record<string, string>)?.name || 'Unknown Operator',
    operator_email: (item.operator as Record<string, string>)?.email || '',
  }))

  return { ok: true, status: 200, data: results }
}

export async function apiRespondToRequest(requestId: string, action: 'accept' | 'reject'): Promise<ApiResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { data: profile } = await supabase
    .from('tour_guides')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!profile) {
    return { ok: false, status: 403, data: { error: 'Unauthorized' } }
  }

  const newStatus = action === 'accept' ? 'accepted' : 'rejected'

  const { error } = await supabase
    .from('hire_requests')
    .update({ status: newStatus })
    .eq('id', requestId)
    .eq('guide_id', profile.id)

  if (error) {
    return { ok: false, status: 404, data: { error: 'Request not found' } }
  }

  const { data: request } = await supabase.from('hire_requests').select('operator_id, guide_id').eq('id', requestId).single()
  if (request) {
    await supabase.from('notifications').insert({
      hire_request_id: requestId,
      recipient_id: request.operator_id,
      type: newStatus,
      message: `Guide has ${newStatus} your hire request.`,
    })
  }

  const response = { success: true }
  return { ok: true, status: 200, data: response }
}

export async function apiGetProfile(): Promise<ApiResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const userType = session.user.user_metadata?.user_type as string | undefined

  if (userType === 'guide') {
    const { data: profile, error } = await supabase
      .from('tour_guides')
      .select('id, name, email, phone, rating_avg, license_number, profile_photo_url, website')
      .eq('email', session.user.email)
      .single()

    if (error || !profile) {
      return { ok: false, status: 404, data: { error: 'Profile not found' } }
    }

    const [langRes, locRes] = await Promise.all([
      supabase.from('guide_languages').select('id, language_code, proficiency').eq('guide_id', profile.id),
      supabase.from('guide_locations').select('id, location_name').eq('guide_id', profile.id),
    ])

    return {
      ok: true,
      status: 200,
      data: {
        ...profile,
        guide_languages: langRes.data || [],
        guide_locations: locRes.data || [],
      },
    }
  }

  const { data: profile, error } = await supabase
    .from('tour_operators')
    .select('id, name, email, phone, profile_photo_url')
    .eq('email', session.user.email)
    .single()

  if (error || !profile) {
    return { ok: false, status: 404, data: { error: 'Profile not found' } }
  }

  return { ok: true, status: 200, data: profile }
}

export async function apiUpdateProfile(body: Partial<RegisterPayload>): Promise<ApiResponse> {
  const { data: { session: authSession } } = await supabase.auth.getSession()
  if (!authSession?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { name, phone, licenseNumber, languages, locations, profilePhotoUrl, website } = body
  const userType = authSession.user.user_metadata?.user_type as string | undefined

  if (userType === 'guide') {
    const { data: profile, error: userError } = await supabase
      .from('tour_guides')
      .update({
        name,
        phone,
        license_number: licenseNumber,
        profile_photo_url: profilePhotoUrl,
        website,
      })
      .eq('email', authSession.user.email)
      .select('id')
      .single()

    if (userError || !profile) {
      return { ok: false, status: 500, data: { error: userError?.message || 'Update failed' } }
    }

    const guideId = profile.id

    if (languages !== undefined) {
      await supabase.from('guide_languages').delete().eq('guide_id', guideId)
      if (languages.length > 0) {
        await supabase.from('guide_languages').insert(
          languages.map((lang) => ({
            guide_id: guideId,
            language_code: lang.code,
            proficiency: lang.proficiency,
          }))
        )
      }
    }

    if (locations !== undefined) {
      await supabase.from('guide_locations').delete().eq('guide_id', guideId)
      if (locations.length > 0) {
        await supabase.from('guide_locations').insert(
          locations.map((loc) => ({
            guide_id: guideId,
            location_name: loc,
          }))
        )
      }
    }
  } else {
    const { error: userError } = await supabase
      .from('tour_operators')
      .update({
        name,
        phone,
        profile_photo_url: profilePhotoUrl,
      })
      .eq('email', authSession.user.email)

    if (userError) {
      return { ok: false, status: 500, data: { error: userError?.message || 'Update failed' } }
    }
  }

  return { ok: true, status: 200, data: { success: true } }
}

export async function apiUploadAvatar(file: File): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const fileExt = file.name.split('.').pop()
  const fileName = `${session.user.id}-${Math.random()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Upload error:', uploadError.message)
    return null
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl
}

export async function apiGetOperatorSentRequests(): Promise<ApiResponse<HireRequestWithOperator[]>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { data: profile } = await supabase
    .from('tour_operators')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!profile) {
    return { ok: false, status: 403, data: { error: 'Unauthorized' } }
  }

  const { data, error } = await supabase
    .from('hire_requests')
    .select(`
      *,
      guide:guide_id(id, name, email)
    `)
    .eq('operator_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { ok: false, status: 500, data: { error: error.message } }
  }

  const sentRows = ((data || []) as Record<string, unknown>[])
  const results: HireRequestWithOperator[] = sentRows.map((item) => ({
    id: item.id as string,
    operator_id: item.operator_id as string,
    guide_id: item.guide_id as string,
    start_date: item.start_date as string,
    end_date: item.end_date as string,
    message: item.message as string,
    daily_rate: item.daily_rate as number,
    status: item.status as 'pending' | 'accepted' | 'rejected',
    created_at: item.created_at as string,
    operator_name: (item.guide as Record<string, string>)?.name || 'Unknown Guide',
    operator_email: (item.guide as Record<string, string>)?.email || '',
  }))

  return { ok: true, status: 200, data: results }
}

export async function apiGetNotifications(): Promise<ApiResponse<Notification[]>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const userType = session.user.user_metadata?.user_type as string | undefined
  const table = userTable(userType || 'guide')

  const { data: profile } = await supabase
    .from(table)
    .select('id')
    .eq('email', session.user.email)
    .maybeSingle()

  if (!profile) return { ok: false, status: 404, data: { error: 'Profile not found' } }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) return { ok: false, status: 500, data: { error: error.message } }

  return { ok: true, status: 200, data: data as Notification[] }
}

export async function apiMarkNotificationRead(id: string): Promise<ApiResponse> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)

  if (error) return { ok: false, status: 500, data: { error: error.message } }
  return { ok: true, status: 200, data: { success: true } }
}

export async function apiMarkAllNotificationsRead(): Promise<ApiResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const userType = session.user.user_metadata?.user_type as string | undefined
  const table = userTable(userType || 'guide')

  const { data: profile } = await supabase
    .from(table)
    .select('id')
    .eq('email', session.user.email)
    .maybeSingle()

  if (!profile) return { ok: false, status: 404, data: { error: 'Profile not found' } }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('recipient_id', profile.id)
    .eq('read', false)

  if (error) return { ok: false, status: 500, data: { error: error.message } }
  return { ok: true, status: 200, data: { success: true } }
}

export async function apiGetHistory(): Promise<ApiResponse<RequestHistoryItem[]>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const userType = session.user.user_metadata?.user_type as string | undefined
  const isGuide = userType === 'guide'
  const table = userTable(userType || 'guide')

  const { data: profile } = await supabase
    .from(table)
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!profile) return { ok: false, status: 404, data: { error: 'Profile not found' } }

  const filterCol = isGuide ? 'guide_id' : 'operator_id'
  const counterTable = isGuide ? 'tour_operators' : 'tour_guides'
  const counterCol = isGuide ? 'operator' : 'guide'

  const { data, error } = await supabase
    .from('hire_requests')
    .select(`
      *,
      ${counterCol}:${isGuide ? 'operator_id' : 'guide_id'}(id, name, email)
    `)
    .eq(filterCol, profile.id)
    .in('status', ['accepted', 'rejected'])
    .order('created_at', { ascending: false })

  if (error) return { ok: false, status: 500, data: { error: error.message } }

  const history = (data as any[]).map(item => ({
    ...item,
    counterparty_name: item[counterCol].name,
    counterparty_email: item[counterCol].email,
  }))

  return { ok: true, status: 200, data: history }
}

export async function apiGetHireDetails(hireRequestId: string): Promise<ApiResponse<HireDetails>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { data: hireRequest, error } = await supabase
    .from('hire_requests')
    .select(`
      *,
      guide:guide_id(id, name, email, phone, rating_avg, profile_photo_url, website),
      operator:operator_id(id, name, email, phone, profile_photo_url)
    `)
    .eq('id', hireRequestId)
    .single()

  if (error || !hireRequest) {
    return { ok: false, status: 404, data: { error: 'Hire request not found' } }
  }

  const guideInfo = hireRequest.guide as Record<string, unknown>
  const operatorInfo = hireRequest.operator as Record<string, unknown>

  const userType = session.user.user_metadata?.user_type as string | undefined
  const viewerTable = userTable(userType || 'guide')

  const { data: viewerProfile } = await supabase
    .from(viewerTable)
    .select('id')
    .eq('email', session.user.email)
    .maybeSingle()

  let operatorRating: number | null = null
  if (viewerProfile && userType === 'operator') {
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('score')
      .eq('guide_id', guideInfo.id)
      .eq('operator_id', viewerProfile.id)
      .eq('hire_request_id', hireRequestId)
      .maybeSingle()

    if (existingRating) {
      operatorRating = existingRating.score as number
    }
  }

  const [langRes, locRes] = await Promise.all([
    supabase.from('guide_languages').select('language_code').eq('guide_id', guideInfo.id),
    supabase.from('guide_locations').select('location_name').eq('guide_id', guideInfo.id),
  ])

  const languages = ((langRes.data || []) as Record<string, string>[])
    .map((l) => l.language_code)
    .join(', ')

  const locations = ((locRes.data || []) as Record<string, string>[])
    .map((l) => l.location_name)
    .join(', ')

  return {
    ok: true,
    status: 200,
    data: {
      hireRequest: {
        id: hireRequest.id as string,
        operator_id: hireRequest.operator_id as string,
        guide_id: hireRequest.guide_id as string,
        start_date: hireRequest.start_date as string,
        end_date: hireRequest.end_date as string,
        message: hireRequest.message as string,
        daily_rate: hireRequest.daily_rate as number,
        status: hireRequest.status as 'pending' | 'accepted' | 'rejected',
        created_at: hireRequest.created_at as string,
      },
      guide: {
        id: guideInfo.id as string,
        name: guideInfo.name as string,
        email: guideInfo.email as string,
        phone: (guideInfo.phone as string) || null,
        rating_avg: guideInfo.rating_avg != null ? Number(guideInfo.rating_avg) : null,
        languages,
        locations,
        profile_photo_url: (guideInfo.profile_photo_url as string) || null,
        website: (guideInfo.website as string) || null,
      },
      operator: {
        id: operatorInfo.id as string,
        name: operatorInfo.name as string,
        email: operatorInfo.email as string,
        phone: (operatorInfo.phone as string) || null,
        profile_photo_url: (operatorInfo.profile_photo_url as string) || null,
      },
      operatorRating,
    },
  }
}

export async function apiSubmitRating(
  guideId: string,
  score: number,
  hireRequestId?: string
): Promise<ApiResponse<Rating>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { data: profile } = await supabase
    .from('tour_operators')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!profile) {
    return { ok: false, status: 403, data: { error: 'Only operators can submit ratings' } }
  }

  const { data: existing } = await supabase
    .from('ratings')
    .select('id, score')
    .eq('guide_id', guideId)
    .eq('operator_id', profile.id)
    .eq('hire_request_id', hireRequestId || '')
    .maybeSingle()

  if (existing) {
    return { ok: false, status: 409, data: { error: 'You have already rated this guide for this contract' } }
  }

  const { data: rating, error } = await supabase
    .from('ratings')
    .insert({
      guide_id: guideId,
      operator_id: profile.id,
      hire_request_id: hireRequestId || null,
      score,
    })
    .select()
    .single()

  if (error) {
    return { ok: false, status: 500, data: { error: error.message } }
  }

  const { data: stats } = await supabase
    .from('ratings')
    .select('score')
    .eq('guide_id', guideId)

  if (stats && stats.length > 0) {
    const avg = stats.reduce((sum: number, r: Record<string, unknown>) => sum + Number(r.score), 0) / stats.length
    await supabase
      .from('tour_guides')
      .update({ rating_avg: Math.round(avg * 100) / 100 })
      .eq('id', guideId)
  }

  return { ok: true, status: 200, data: rating as Rating }
}

// ── Unavailable Dates API ──

export async function apiGetMyUnavailableDates(): Promise<ApiResponse<string[]>> {
  const guideId = await getGuideProfileId()
  if (!guideId) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { data, error } = await supabase
    .from('guide_unavailable_dates')
    .select('date')
    .eq('guide_id', guideId)
    .order('date', { ascending: true })

  if (error) return { ok: false, status: 500, data: { error: error.message } }

  const dates = ((data || []) as { date: string }[]).map((r) => r.date)
  return { ok: true, status: 200, data: dates }
}

export async function apiAddUnavailableDates(
  dates: string[],
  reason?: string
): Promise<ApiResponse> {
  const guideId = await getGuideProfileId()
  if (!guideId) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const rows = dates.map((date) => ({
    guide_id: guideId,
    date,
    reason: reason || '',
  }))

  const { error } = await supabase
    .from('guide_unavailable_dates')
    .upsert(rows, { onConflict: 'guide_id,date' })

  if (error) return { ok: false, status: 500, data: { error: error.message } }

  return { ok: true, status: 200, data: { success: true, added: dates.length } }
}

export async function apiRemoveUnavailableDates(dates: string[]): Promise<ApiResponse> {
  const guideId = await getGuideProfileId()
  if (!guideId) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { error } = await supabase
    .from('guide_unavailable_dates')
    .delete()
    .eq('guide_id', guideId)
    .in('date', dates)

  if (error) return { ok: false, status: 500, data: { error: error.message } }

  return { ok: true, status: 200, data: { success: true, removed: dates.length } }
}

export async function apiSetUnavailableDateRange(
  startDate: string,
  endDate: string,
  reason?: string
): Promise<ApiResponse> {
  const guideId = await getGuideProfileId()
  if (!guideId) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const dates: string[] = []
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0])
  }

  const rows = dates.map((date) => ({
    guide_id: guideId,
    date,
    reason: reason || '',
  }))

  const { error } = await supabase
    .from('guide_unavailable_dates')
    .upsert(rows, { onConflict: 'guide_id,date' })

  if (error) return { ok: false, status: 500, data: { error: error.message } }

  return { ok: true, status: 200, data: { success: true, added: dates.length } }
}

export async function apiReplaceUnavailableDates(dates: string[], reason?: string): Promise<ApiResponse> {
  const guideId = await getGuideProfileId()
  if (!guideId) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { error: delError } = await supabase
    .from('guide_unavailable_dates')
    .delete()
    .eq('guide_id', guideId)

  if (delError) return { ok: false, status: 500, data: { error: delError.message } }

  if (dates.length === 0) {
    return { ok: true, status: 200, data: { success: true, saved: 0 } }
  }

  const rows = dates.map((date) => ({
    guide_id: guideId,
    date,
    reason: reason || '',
  }))

  const { error: insError } = await supabase
    .from('guide_unavailable_dates')
    .insert(rows)

  if (insError) return { ok: false, status: 500, data: { error: insError.message } }

  return { ok: true, status: 200, data: { success: true, saved: dates.length } }
}

export async function apiGetGuideById(guideId: string): Promise<ApiResponse<GuideResult>> {
  const { data: guide, error } = await supabase
    .from('tour_guides')
    .select('id, name, email, phone, rating_avg, profile_photo_url, website')
    .eq('id', guideId)
    .single()

  if (error) return { ok: false, status: 500, data: { error: error.message } }
  if (!guide) return { ok: false, status: 404, data: { error: 'Guide not found' } }

  const [langRes, locRes, unavailRes] = await Promise.all([
    supabase.from('guide_languages').select('language_code').eq('guide_id', guideId),
    supabase.from('guide_locations').select('location_name').eq('guide_id', guideId),
    supabase.from('guide_unavailable_dates').select('date').eq('guide_id', guideId),
  ])

  const today = new Date().toISOString().split('T')[0]
  const unavailableDates = (unavailRes.data || []).map((r: Record<string, string>) => r.date)
  const isUnavailable = unavailableDates.includes(today)

  return {
    ok: true, status: 200, data: {
      id: guide.id,
      name: guide.name,
      email: guide.email,
      phone: guide.phone || null,
      rating_avg: guide.rating_avg !== undefined ? Number(guide.rating_avg) : null,
      languages: [...new Set((langRes.data || []).map((r: Record<string, string>) => r.language_code))].join(','),
      locations: [...new Set((locRes.data || []).map((r: Record<string, string>) => r.location_name))].join(','),
      availability_status: isUnavailable ? 'close' : 'free',
      profile_photo_url: guide.profile_photo_url || null,
      website: guide.website || null,
      unavailable_dates: unavailableDates,
    },
  }
}

export async function apiGetGuideUnavailableDates(
  guideId: string
): Promise<ApiResponse<string[]>> {
  const { data, error } = await supabase
    .from('guide_unavailable_dates')
    .select('date')
    .eq('guide_id', guideId)
    .order('date', { ascending: true })

  if (error) return { ok: false, status: 500, data: { error: error.message } }

  const dates = ((data || []) as { date: string }[]).map((r) => r.date)
  return { ok: true, status: 200, data: dates }
}

export async function apiGetGuideCompletedTours(
  guideId: string
): Promise<ApiResponse<{ id: string; operator_name: string; start_date: string; end_date: string; daily_rate: number; status: string; created_at: string }[]>> {
  const { data, error } = await supabase
    .from('hire_requests')
    .select(`*, operator:operator_id(id, name)`)
    .eq('guide_id', guideId)
    .in('status', ['accepted'])
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return { ok: false, status: 500, data: { error: error.message } }

  const rows = (data || []) as Record<string, unknown>[]
  const results = rows.map((item) => ({
    id: item.id as string,
    operator_name: (item.operator as Record<string, string>)?.name || 'Unknown',
    start_date: item.start_date as string,
    end_date: item.end_date as string,
    daily_rate: item.daily_rate as number,
    status: item.status as string,
    created_at: item.created_at as string,
  }))

  return { ok: true, status: 200, data: results }
}

export async function apiCheckGuideAvailability(
  guideId: string,
  date: string
): Promise<ApiResponse<GuideAvailabilityResponse>> {
  const { data, error } = await supabase
    .from('guide_unavailable_dates')
    .select('date')
    .eq('guide_id', guideId)
    .eq('date', date)
    .maybeSingle()

  if (error) return { ok: false, status: 500, data: { error: error.message } }

  const isUnavailable = !!data

  const allDatesRes = await supabase
    .from('guide_unavailable_dates')
    .select('date')
    .eq('guide_id', guideId)
    .gte('date', date)

  const allDates = ((allDatesRes.data || []) as { date: string }[]).map((r) => r.date)

  let nextAvailable: string | null = null
  if (isUnavailable) {
    const checkDate = new Date(date + 'T00:00:00')
    for (let i = 1; i <= 90; i++) {
      checkDate.setDate(checkDate.getDate() + 1)
      const ds = checkDate.toISOString().split('T')[0]
      if (!allDates.includes(ds)) {
        nextAvailable = ds
        break
      }
    }
  }

  return {
    ok: true,
    status: 200,
    data: {
      guideId,
      status: isUnavailable ? 'Not Available' : 'Available',
      unavailableDates: allDates,
      nextAvailableDate: nextAvailable,
    },
  }
}

export async function apiCheckGuideAvailabilityRange(
  guideId: string,
  startDate: string,
  endDate: string
): Promise<ApiResponse<{ date: string; available: boolean }[]>> {
  const { data, error } = await supabase
    .from('guide_unavailable_dates')
    .select('date')
    .eq('guide_id', guideId)
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) return { ok: false, status: 500, data: { error: error.message } }

  const unavailableSet = new Set(
    ((data || []) as { date: string }[]).map((r) => r.date)
  )

  const results: { date: string; available: boolean }[] = []
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const ds = d.toISOString().split('T')[0]
    results.push({ date: ds, available: !unavailableSet.has(ds) })
  }

  return { ok: true, status: 200, data: results }
}

// ── Calendar API ──

async function getGuideProfileId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  const { data } = await supabase
    .from('tour_guides')
    .select('id')
    .eq('email', session.user.email)
    .maybeSingle()
  return data?.id || null
}

export async function apiGetMonthAvailability(
  year: number,
  month: number
): Promise<ApiResponse<MonthAvailability[]>> {
  const guideId = await getGuideProfileId()
  if (!guideId) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('availability')
    .select('date, status, notes')
    .eq('guide_id', guideId)
    .gte('date', startDate)
    .lt('date', endDate)
    .order('date', { ascending: true })

  if (error) return { ok: false, status: 500, data: { error: error.message } }
  return { ok: true, status: 200, data: (data || []) as MonthAvailability[] }
}

export async function apiGetGuideMonthBookings(
  year: number,
  month: number
): Promise<ApiResponse<BookingWithOperator[]>> {
  const guideId = await getGuideProfileId()
  if (!guideId) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('hire_requests')
    .select(`*, operator:operator_id(id, name, email)`)
    .eq('guide_id', guideId)
    .gte('start_date', startDate)
    .lt('start_date', endDate)
    .order('start_date', { ascending: true })

  if (error) return { ok: false, status: 500, data: { error: error.message } }

  const rows = (data || []) as Record<string, unknown>[]
  const results: BookingWithOperator[] = rows.map((item) => ({
    id: item.id as string,
    operator_id: item.operator_id as string,
    guide_id: item.guide_id as string,
    start_date: item.start_date as string,
    end_date: item.end_date as string,
    message: item.message as string,
    daily_rate: item.daily_rate as number,
    status: item.status as 'pending' | 'accepted' | 'rejected',
    created_at: item.created_at as string,
    operator_name: (item.operator as Record<string, string>)?.name || 'Unknown',
    operator_email: (item.operator as Record<string, string>)?.email || '',
  }))

  return { ok: true, status: 200, data: results }
}

export async function apiUpsertAvailability(
  date: string,
  status: 'free' | 'close',
  notes?: string
): Promise<ApiResponse> {
  const guideId = await getGuideProfileId()
  if (!guideId) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { error } = await supabase
    .from('availability')
    .upsert({
      guide_id: guideId,
      date,
      status,
      notes: notes || '',
    }, { onConflict: 'guide_id,date' })

  if (error) return { ok: false, status: 500, data: { error: error.message } }
  return { ok: true, status: 200, data: { success: true } }
}

export async function apiGetDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const guideId = await getGuideProfileId()
  if (!guideId) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

  const [unavailRes, pendingRes, acceptedRes, earningsRes] = await Promise.all([
    supabase
      .from('guide_unavailable_dates')
      .select('date', { count: 'exact', head: true })
      .eq('guide_id', guideId)
      .gte('date', startDate)
      .lt('date', endDate),
    supabase
      .from('hire_requests')
      .select('id', { count: 'exact', head: true })
      .eq('guide_id', guideId)
      .eq('status', 'pending'),
    supabase
      .from('hire_requests')
      .select('id', { count: 'exact', head: true })
      .eq('guide_id', guideId)
      .eq('status', 'accepted')
      .gte('start_date', today.toISOString().split('T')[0]),
    supabase
      .from('hire_requests')
      .select('daily_rate, start_date, end_date')
      .eq('guide_id', guideId)
      .eq('status', 'accepted'),
  ])

  const acceptedRows = (earningsRes.data || []) as Record<string, unknown>[]
  let totalEarnings = 0
  let monthlyEarnings = 0
  const todayStr = today.toISOString().split('T')[0]

  for (const row of acceptedRows) {
    const dailyRate = Number(row.daily_rate)
    const sDate = row.start_date as string
    const eDate = row.end_date as string
    const days = Math.max(1, Math.ceil(
      (new Date(eDate).getTime() - new Date(sDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1)
    const total = dailyRate * days
    totalEarnings += total

    if (sDate >= startDate && sDate < endDate) {
      monthlyEarnings += total
    }
  }

  const completedRes = await supabase
    .from('hire_requests')
    .select('id', { count: 'exact', head: true })
    .eq('guide_id', guideId)
    .eq('status', 'accepted')
    .lt('end_date', todayStr)

  // Calculate available days in month (total days minus unavailable days)
  const daysInMonth = new Date(year, month, 0).getDate()
  const unavailableCount = unavailRes.count || 0
  const availableDays = Math.max(0, daysInMonth - unavailableCount)

  return {
    ok: true,
    status: 200,
    data: {
      upcomingTours: acceptedRes.count || 0,
      availableDaysThisMonth: availableDays,
      pendingRequests: pendingRes.count || 0,
      totalEarnings,
      monthlyEarnings,
      completedTours: completedRes.count || 0,
    },
  }
}

export async function apiGetOperatorMonthBookings(
  year: number,
  month: number,
  guideId?: string
): Promise<ApiResponse<BookingWithOperator[]>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

  let query = supabase
    .from('hire_requests')
    .select(`*, guide:guide_id(id, name, email)`)
    .gte('start_date', startDate)
    .lt('start_date', endDate)

  if (guideId) query = query.eq('guide_id', guideId)

  const { data, error } = await query.order('start_date', { ascending: true })

  if (error) return { ok: false, status: 500, data: { error: error.message } }

  const rows = (data || []) as Record<string, unknown>[]
  const results: BookingWithOperator[] = rows.map((item) => ({
    id: item.id as string,
    operator_id: item.operator_id as string,
    guide_id: item.guide_id as string,
    start_date: item.start_date as string,
    end_date: item.end_date as string,
    message: item.message as string,
    daily_rate: item.daily_rate as number,
    status: item.status as 'pending' | 'accepted' | 'rejected',
    created_at: item.created_at as string,
    operator_name: (item.guide as Record<string, string>)?.name || 'Unknown',
    operator_email: (item.guide as Record<string, string>)?.email || '',
  }))

  return { ok: true, status: 200, data: results }
}

// ── Job Postings API ──

export async function apiCreateJobPosting(body: JobPostingPayload): Promise<ApiResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { data: profile } = await supabase
    .from('tour_operators')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!profile) {
    return { ok: false, status: 403, data: { error: 'Only operators can post jobs' } }
  }

  const { title, description, location, startDate, endDate, dailyRate, languagesRequired } = body

  const { error } = await supabase
    .from('job_postings')
    .insert({
      operator_id: profile.id,
      title,
      description,
      location,
      start_date: startDate || null,
      end_date: endDate || null,
      daily_rate: dailyRate || null,
      languages_required: languagesRequired,
      status: 'open',
    })

  if (error) {
    return { ok: false, status: 500, data: { error: error.message } }
  }

  return { ok: true, status: 200, data: { success: true } }
}

export async function apiGetOpenJobPostings(): Promise<ApiResponse<JobPostingWithOperator[]>> {
  const { data, error } = await supabase
    .from('job_postings')
    .select(`
      *,
      operator:operator_id(id, name, email, profile_photo_url)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) {
    return { ok: false, status: 500, data: { error: error.message } }
  }

  const { data: { session } } = await supabase.auth.getSession()
  let guideId: string | null = null
  if (session?.user) {
    const { data: guideProfile } = await supabase
      .from('tour_guides')
      .select('id')
      .eq('email', session.user.email)
      .maybeSingle()
    guideId = guideProfile?.id || null
  }

  const rows = (data || []) as Record<string, unknown>[]
  const results: JobPostingWithOperator[] = []

  for (const item of rows) {
    const op = item.operator as Record<string, unknown> | undefined

    let appCount = 0
    if (guideId) {
      const { count } = await supabase
        .from('job_applications')
        .select('id', { count: 'exact', head: true })
        .eq('job_id', item.id as string)
      appCount = count || 0
    }

    results.push({
      id: item.id as string,
      operator_id: item.operator_id as string,
      title: item.title as string,
      description: item.description as string,
      location: item.location as string,
      start_date: (item.start_date as string) || null,
      end_date: (item.end_date as string) || null,
      daily_rate: item.daily_rate != null ? Number(item.daily_rate) : null,
      languages_required: (item.languages_required as string[]) || [],
      status: item.status as 'open' | 'closed' | 'filled',
      created_at: item.created_at as string,
      updated_at: item.updated_at as string,
      operator_name: op?.name as string || 'Unknown',
      operator_email: op?.email as string || '',
      operator_photo: (op?.profile_photo_url as string) || null,
      application_count: appCount,
    })
  }

  return { ok: true, status: 200, data: results }
}

export async function apiGetOperatorJobPostings(): Promise<ApiResponse<JobPostingWithOperator[]>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { data: profile } = await supabase
    .from('tour_operators')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!profile) {
    return { ok: false, status: 403, data: { error: 'Unauthorized' } }
  }

  const { data, error } = await supabase
    .from('job_postings')
    .select(`
      *,
      operator:operator_id(id, name, email, profile_photo_url)
    `)
    .eq('operator_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { ok: false, status: 500, data: { error: error.message } }
  }

  const rows = (data || []) as Record<string, unknown>[]
  const results: JobPostingWithOperator[] = []

  for (const item of rows) {
    const op = item.operator as Record<string, unknown> | undefined

    const { count } = await supabase
      .from('job_applications')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', item.id as string)

    results.push({
      id: item.id as string,
      operator_id: item.operator_id as string,
      title: item.title as string,
      description: item.description as string,
      location: item.location as string,
      start_date: (item.start_date as string) || null,
      end_date: (item.end_date as string) || null,
      daily_rate: item.daily_rate != null ? Number(item.daily_rate) : null,
      languages_required: (item.languages_required as string[]) || [],
      status: item.status as 'open' | 'closed' | 'filled',
      created_at: item.created_at as string,
      updated_at: item.updated_at as string,
      operator_name: op?.name as string || 'Unknown',
      operator_email: op?.email as string || '',
      operator_photo: (op?.profile_photo_url as string) || null,
      application_count: count || 0,
    })
  }

  return { ok: true, status: 200, data: results }
}

export async function apiApplyToJob(jobId: string, message: string): Promise<ApiResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { data: profile } = await supabase
    .from('tour_guides')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!profile) {
    return { ok: false, status: 403, data: { error: 'Only guides can apply to jobs' } }
  }

  const { error } = await supabase
    .from('job_applications')
    .insert({
      job_id: jobId,
      guide_id: profile.id,
      message,
      status: 'pending',
    })

  if (error) {
    if (error.code === '23505') {
      return { ok: false, status: 409, data: { error: 'You have already applied to this job' } }
    }
    return { ok: false, status: 500, data: { error: error.message } }
  }

  return { ok: true, status: 200, data: { success: true, message: 'Application submitted successfully' } }
}

export async function apiGetJobApplications(jobId: string): Promise<ApiResponse<JobApplicationWithGuide[]>> {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      guide:guide_id(id, name, email, profile_photo_url)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  if (error) {
    return { ok: false, status: 500, data: { error: error.message } }
  }

  const rows = (data || []) as Record<string, unknown>[]
  const results: JobApplicationWithGuide[] = rows.map((item) => {
    const g = item.guide as Record<string, unknown> | undefined
    return {
      id: item.id as string,
      job_id: item.job_id as string,
      guide_id: item.guide_id as string,
      message: (item.message as string) || null,
      status: item.status as 'pending' | 'accepted' | 'rejected',
      created_at: item.created_at as string,
      guide_name: g?.name as string || 'Unknown',
      guide_email: g?.email as string || '',
      guide_photo: (g?.profile_photo_url as string) || null,
    }
  })

  return { ok: true, status: 200, data: results }
}

export async function apiUpdateApplicationStatus(applicationId: string, action: 'accept' | 'reject'): Promise<ApiResponse> {
  const newStatus = action === 'accept' ? 'accepted' : 'rejected'

  const { error } = await supabase
    .from('job_applications')
    .update({ status: newStatus })
    .eq('id', applicationId)

  if (error) {
    return { ok: false, status: 500, data: { error: error.message } }
  }

  if (action === 'accept') {
    const { data: app } = await supabase
      .from('job_applications')
      .select('job_id')
      .eq('id', applicationId)
      .single()

    if (app) {
      await supabase
        .from('job_postings')
        .update({ status: 'filled' })
        .eq('id', app.job_id)
    }
  }

  return { ok: true, status: 200, data: { success: true } }
}

export async function apiGetMyApplications(): Promise<ApiResponse<JobApplicationWithGuide[]>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { ok: false, status: 401, data: { error: 'Unauthorized' } }

  const { data: profile } = await supabase
    .from('tour_guides')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!profile) {
    return { ok: false, status: 403, data: { error: 'Unauthorized' } }
  }

  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job:job_id(*, operator:operator_id(id, name, email, profile_photo_url))
    `)
    .eq('guide_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { ok: false, status: 500, data: { error: error.message } }
  }

  const rows = (data || []) as Record<string, unknown>[]
  const results: any[] = rows.map((item) => {
    const job = item.job as Record<string, unknown> | undefined
    const op = job?.operator as Record<string, unknown> | undefined
    return {
      id: item.id as string,
      job_id: item.job_id as string,
      guide_id: item.guide_id as string,
      message: (item.message as string) || null,
      status: item.status as 'pending' | 'accepted' | 'rejected',
      created_at: item.created_at as string,
      job: job ? {
        id: job.id as string,
        title: job.title as string,
        description: job.description as string,
        location: job.location as string,
        start_date: (job.start_date as string) || null,
        end_date: (job.end_date as string) || null,
        daily_rate: job.daily_rate != null ? Number(job.daily_rate) : null,
        status: job.status as string,
        operator_name: op?.name as string || 'Unknown',
      } : null,
    }
  })

  return { ok: true, status: 200, data: results as any }
}

export async function apiCloseJobPosting(jobId: string): Promise<ApiResponse> {
  const { error } = await supabase
    .from('job_postings')
    .update({ status: 'closed' })
    .eq('id', jobId)

  if (error) return { ok: false, status: 500, data: { error: error.message } }
  return { ok: true, status: 200, data: { success: true } }
}

export async function apiGetGuideAvailabilityForOperator(
  guideId: string,
  year: number,
  month: number
): Promise<ApiResponse<MonthAvailability[]>> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('availability')
    .select('date, status, notes')
    .eq('guide_id', guideId)
    .gte('date', startDate)
    .lt('date', endDate)
    .order('date', { ascending: true })

  if (error) return { ok: false, status: 500, data: { error: error.message } }
  return { ok: true, status: 200, data: (data || []) as MonthAvailability[] }
}
