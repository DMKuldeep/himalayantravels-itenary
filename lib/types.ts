export interface Destination {
  id: string
  name: string
  slug: string
  state: string
  description?: string
  image_url?: string
  banner_url?: string
  featured: boolean
  package_count: number
  created_at: string
  updated_at: string
}

export interface Package {
  id: string
  title: string
  slug: string
  destination_id?: string
  destination_name?: string
  tour_type: 'honeymoon' | 'family' | 'adventure' | 'group' | 'solo' | 'pilgrimage' | 'weekend' | 'long'
  duration_days: number
  duration_nights: number
  price_per_person: number
  original_price?: number
  max_people: number
  min_people: number
  description?: string
  highlights: string[]
  inclusions: string[]
  exclusions: string[]
  itinerary: ItineraryDay[]
  images: string[]
  thumbnail_url?: string
  difficulty: 'easy' | 'moderate' | 'challenging'
  best_season?: string
  start_location?: string
  end_location?: string
  is_featured: boolean
  is_active: boolean
  badge?: string
  rating: number
  review_count: number
  bookings_count: number
  created_at: string
  updated_at: string
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  activities: string[]
  accommodation?: string
  meals?: string
}

export interface Enquiry {
  id: string
  name: string
  email?: string
  phone: string
  destination?: string
  package_id?: string
  package_name?: string
  travel_date?: string
  num_people: number
  tour_type?: string
  budget?: string
  message?: string
  status: 'new' | 'contacted' | 'converted' | 'closed'
  source: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  package_id: string
  user_id?: string
  reviewer_name: string
  reviewer_email?: string
  rating: number
  review_text?: string
  travel_date?: string
  is_approved: boolean
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content?: string
  cover_image?: string
  author: string
  tags: string[]
  is_published: boolean
  views: number
  created_at: string
  updated_at: string
}

export interface SiteSetting {
  id: string
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export type TourType = Package['tour_type']
export type EnquiryStatus = Enquiry['status']
