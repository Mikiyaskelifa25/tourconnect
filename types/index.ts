export interface TourGuide {
  id: string
  name: string
  email: string
  phone: string | null
  rating_avg: number | null
  license_number: string | null
  profile_photo_url: string | null
  created_at: string
}

export interface TourOperator {
  id: string
  name: string
  email: string
  phone: string | null
  profile_photo_url: string | null
  created_at: string
}

export interface GuideLanguage {
  id: string
  guide_id: string
  language_code: string
  proficiency: 'native' | 'fluent' | 'intermediate' | 'conversational'
}

export interface GuideLocation {
  id: string
  guide_id: string
  location_name: string
}

export interface Availability {
  id: string
  guide_id: string
  date: string
  status: 'free' | 'close'
  notes: string
}

export interface HireRequest {
  id: string
  operator_id: string
  guide_id: string
  start_date: string
  end_date: string
  message: string
  daily_rate: number
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface HireRequestWithOperator extends HireRequest {
  operator_name: string
  operator_email: string
}

export interface GuideResult {
  id: string
  name: string
  email: string
  phone: string | null
  rating_avg: number | null
  languages: string
  locations: string
  availability_status: 'free' | 'close'
  profile_photo_url: string | null
  unavailable_dates?: string[]
}

export interface Session {
  userId: string
  userType: 'guide' | 'operator'
  name: string
  license: string | null
  email: string
  profilePhotoUrl: string | null
}

export type ApiResponse<T = unknown> = {
  ok: true
  status: number
  data: T
} | {
  ok: false
  status: number
  data: { error: string }
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone: string
  userType: 'guide' | 'operator'
  languages?: { code: string; proficiency: string }[]
  locations?: string[]
  licenseNumber?: string
  profilePhotoUrl?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AvailabilityPayload {
  date: string
  status: 'free' | 'close'
  notes: string
}

export interface SearchPayload {
  date: string
  name?: string
  location?: string
  languages?: string[]
  status?: 'free'
}

export interface HirePayload {
  guideId: string
  startDate: string
  endDate: string
  message: string
  dailyRate: number
}

export interface Notification {
  id: string
  hire_request_id: string
  recipient_id: string
  type: 'accepted' | 'rejected' | 'message'
  message: string
  read: boolean
  created_at: string
}

export interface Rating {
  id: string
  guide_id: string
  operator_id: string
  hire_request_id: string | null
  score: number
  created_at: string
}

// ── Unavailable Dates System ──

export interface GuideUnavailableDate {
  id: string
  guide_id: string
  date: string
  reason: string | null
  created_at: string
}

export interface GuideAvailabilityResponse {
  guideId: string
  status: 'Available' | 'Not Available'
  unavailableDates: string[]
  nextAvailableDate: string | null
}

export interface UnavailableDatePayload {
  dates: string[]
  reason?: string
}

export interface UnavailableDateRangePayload {
  startDate: string
  endDate: string
  reason?: string
}

// ── Calendar System Types ──

export type CalendarView = 'month' | 'week' | 'list'

export type DateStatus = 'available' | 'unavailable' | 'pending' | 'confirmed'

export interface CalendarDateInfo {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  status: DateStatus | null
  availabilityStatus: 'free' | 'close' | null
  notes: string
  bookings: CalendarBooking[]
}

export interface CalendarBooking {
  id: string
  operatorId: string
  operatorName: string
  status: 'pending' | 'accepted' | 'rejected'
  startDate: string
  endDate: string
  dailyRate: number
  message: string
}

export interface CalendarMonth {
  year: number
  month: number
  weeks: CalendarDateInfo[][]
}

export interface DashboardStats {
  upcomingTours: number
  availableDaysThisMonth: number
  pendingRequests: number
  totalEarnings: number
  monthlyEarnings: number
  completedTours: number
}

export interface RecurringSchedule {
  id: string
  guideId: string
  pattern: 'weekdays' | 'weekends' | 'custom'
  daysOfWeek: number[]
  startDate: string
  endDate: string | null
  timezone: string
}

export interface CalendarSyncToken {
  id: string
  guideId: string
  provider: 'google' | 'outlook'
  syncEnabled: boolean
  lastSyncedAt: string | null
  calendarId: string | null
}

export interface GuideAvailabilityPayload {
  date: string
  status: 'free' | 'close'
  notes: string
}

export interface MonthAvailability {
  date: string
  status: 'free' | 'close'
  notes: string
}

export interface BookingWithOperator {
  id: string
  operator_id: string
  guide_id: string
  start_date: string
  end_date: string
  message: string
  daily_rate: number
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  operator_name: string
  operator_email: string
}

export interface CompletedTour {
  id: string
  operator_name: string
  guide_name: string
  start_date: string
  end_date: string
  daily_rate: number
  total_earned: number
  completed_at: string
}

export interface RequestHistoryItem {
  id: string
  operator_id: string
  guide_id: string
  start_date: string
  end_date: string
  message: string
  daily_rate: number
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  counterparty_name: string
  counterparty_email: string
}

export interface HireDetails {
  hireRequest: HireRequest
  guide: {
    id: string
    name: string
    email: string
    phone: string | null
    rating_avg: number | null
    languages: string
    locations: string
    profile_photo_url: string | null
  }
  operator: {
    id: string
    name: string
    email: string
    phone: string | null
    profile_photo_url: string | null
  }
  operatorRating: number | null
}
