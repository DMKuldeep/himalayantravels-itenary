export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function getDiscount(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100)
}

export const TOUR_TYPES = [
  { value: 'honeymoon', label: 'Honeymoon', emoji: '💑' },
  { value: 'family', label: 'Family Tour', emoji: '👨‍👩‍👧‍👦' },
  { value: 'adventure', label: 'Adventure', emoji: '🏔' },
  { value: 'group', label: 'Group Tour', emoji: '👥' },
  { value: 'solo', label: 'Solo Trip', emoji: '🎒' },
  { value: 'pilgrimage', label: 'Pilgrimage', emoji: '🙏' },
  { value: 'weekend', label: 'Weekend Getaway', emoji: '🌅' },
  { value: 'long', label: 'Long Duration', emoji: '🗺' },
]

export const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  challenging: 'bg-red-100 text-red-800',
}

export const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  converted: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
}

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918505983792'

export function getWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
