import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAZN(amount: number): string {
  return `${amount.toFixed(2)} AZN`
}

export function formatDate(dateStr: string, locale = 'en-GB'): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  })
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'confirmed':       return 'badge-confirmed'
    case 'pending_payment': return 'badge-pending'
    case 'cancelled':       return 'badge-cancelled'
    case 'completed':       return 'badge-completed'
    default:                return 'badge-completed'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':       return '#6B8A00'
    case 'pending_payment': return '#9A5020'
    case 'cancelled':       return '#B52020'
    case 'completed':       return '#555555'
    default:                return '#888888'
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'confirmed':       return 'rgba(200,230,60,0.12)'
    case 'pending_payment': return 'rgba(212,135,90,0.12)'
    case 'cancelled':       return 'rgba(220,38,38,0.07)'
    case 'completed':       return 'rgba(58,58,58,0.07)'
    default:                return 'rgba(136,136,136,0.1)'
  }
}
