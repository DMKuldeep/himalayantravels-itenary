import Link from 'next/link'
import { Clock, Users, MapPin, Star } from 'lucide-react'
import { Package } from '@/lib/types'
import { formatPrice, getDiscount } from '@/lib/utils'

interface PackageCardProps {
  pkg: Package
  featured?: boolean
}

const TOUR_COLORS: Record<string, string> = {
  honeymoon: 'from-rose-900 to-pink-800',
  family: 'from-blue-900 to-blue-700',
  adventure: 'from-[#1a3a5c] to-[#2a5a8c]',
  pilgrimage: 'from-amber-900 to-orange-800',
  group: 'from-purple-900 to-purple-700',
  solo: 'from-teal-900 to-teal-700',
  weekend: 'from-green-900 to-green-700',
  long: 'from-slate-800 to-slate-600',
}

const TOUR_EMOJIS: Record<string, string> = {
  honeymoon: '💑', family: '👨‍👩‍👧‍👦', adventure: '🏔', pilgrimage: '🙏',
  group: '👥', solo: '🎒', weekend: '🌅', long: '🗺',
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const discount = pkg.original_price ? getDiscount(pkg.original_price, pkg.price_per_person) : 0
  const gradient = TOUR_COLORS[pkg.tour_type] || 'from-[#1a3a5c] to-[#2a5a8c]'

  return (
    <div className="card overflow-hidden group">
      {/* Image / Gradient */}
      <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {pkg.thumbnail_url ? (
          <img src={pkg.thumbnail_url} alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-5xl opacity-80">{TOUR_EMOJIS[pkg.tour_type] || '🏔'}</span>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Badge */}
        {pkg.badge && (
          <span className="absolute top-3 left-3 bg-[#c8922a] text-white text-xs px-3 py-1 rounded-full font-medium">
            {pkg.badge}
          </span>
        )}

        {/* Discount */}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
            {discount}% OFF
          </span>
        )}

        {/* Rating */}
        {pkg.rating > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-full">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="font-semibold">{pkg.rating}</span>
            <span className="text-gray-500">({pkg.review_count})</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1"><Clock size={11} /> {pkg.duration_days}D/{pkg.duration_nights}N</span>
          {pkg.destination_name && (
            <span className="flex items-center gap-1"><MapPin size={11} /> {pkg.destination_name}</span>
          )}
          <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium capitalize
            ${pkg.difficulty === 'easy' ? 'bg-green-100 text-green-700'
              : pkg.difficulty === 'moderate' ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'}`}>
            {pkg.difficulty}
          </span>
        </div>

        <h3 className="font-semibold text-[#1a1a2e] text-base mb-1 line-clamp-2 leading-snug">
          {pkg.title}
        </h3>

        {pkg.best_season && (
          <p className="text-xs text-gray-400 mb-3">🗓 Best: {pkg.best_season}</p>
        )}

        {/* Highlights */}
        {pkg.highlights && pkg.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {pkg.highlights.slice(0, 3).map((h) => (
              <span key={h} className="bg-[#e8f4fd] text-[#1a3a5c] text-[10px] px-2 py-0.5 rounded">
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#1a3a5c] font-bold text-lg">{formatPrice(pkg.price_per_person)}</span>
            </div>
            {pkg.original_price && (
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-xs line-through">{formatPrice(pkg.original_price)}</span>
              </div>
            )}
            <span className="text-gray-400 text-[10px]">per person</span>
          </div>
          <Link href={`/packages/${pkg.slug}`}
            className="bg-[#1a3a5c] text-white text-xs px-4 py-2.5 rounded-lg font-medium hover:bg-[#0d2137] transition-colors">
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
