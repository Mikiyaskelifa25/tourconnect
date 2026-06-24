export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}

export function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function isToday(year: number, month: number, day: number): boolean {
  const today = new Date()
  return today.getFullYear() === year &&
    today.getMonth() === month - 1 &&
    today.getDate() === day
}

export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2
}

export function getMonthDateRange(year: number, month: number) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  return { daysInMonth, firstDay, totalCells }
}

export function getWeekDates(date: Date): Date[] {
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay())
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(d)
  }
  return dates
}

export function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function addMonths(date: Date, delta: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + delta)
  return result
}

export function addWeeks(date: Date, delta: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + delta * 7)
  return result
}
