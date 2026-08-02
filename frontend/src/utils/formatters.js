import { format, formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (date, formatStr = 'dd MMMM yyyy') => {
  return format(new Date(date), formatStr, { locale: id })
}

export const formatDateTime = (date) => {
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: id })
}

export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { 
    addSuffix: true,
    locale: id 
  })
}

export const formatNumber = (num) => {
  return new Intl.NumberFormat('id-ID').format(num)
}
