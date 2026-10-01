import { differenceInCalendarDays, format, parseISO, isValid } from 'date-fns'
import { tr } from 'date-fns/locale'

export function fmtDate(value?: string | null, pattern = 'dd MMM yyyy') {
  if (!value) return '—'
  const d = typeof value === 'string' ? parseISO(value.slice(0, 10)) : value
  if (!isValid(d)) return value
  return format(d, pattern, { locale: tr })
}

export function fmtDateTime(value?: string | null) {
  if (!value) return '—'
  const d = parseISO(value)
  if (!isValid(d)) return value
  return format(d, 'dd MMM yyyy HH:mm', { locale: tr })
}

export function todayKey() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function daysBetween(start: string, end: string) {
  return differenceInCalendarDays(parseISO(end), parseISO(start)) + 1
}

export function seniorityLabel(startDate: string) {
  const days = differenceInCalendarDays(new Date(), parseISO(startDate))
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  return `${years} yıl ${months} ay`
}
