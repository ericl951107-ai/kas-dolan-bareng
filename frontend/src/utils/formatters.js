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
  if (!date) return '-'
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return '-'
    return format(dateObj, formatStr, { locale: id })
  } catch (error) {
    console.error('Error formatting date:', error)
    return '-'
  }
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return '-'
    return format(dateObj, 'dd MMM yyyy, HH:mm', { locale: id })
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return '-'
  }
}

export const formatRelativeTime = (date) => {
  if (!date) return '-'
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return '-'
    return formatDistanceToNow(dateObj, { 
      addSuffix: true,
      locale: id 
    })
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return '-'
  }
}

export const formatNumber = (num) => {
  return new Intl.NumberFormat('id-ID').format(num)
}
