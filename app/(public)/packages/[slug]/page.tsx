import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatPrice, getDiscount, getWhatsAppLink } from '@/lib/utils'
import EnquiryForm from '@/components/EnquiryForm'
import { Clock, Users, MapPin, CheckCircle2, XCircle, Star, Calendar, ChevronRight, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import type { ItineraryDay } from '@/lib/types'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('packages').select('title,description').eq('slug', slug).single()
  return { title: data?.title || 'Package', description: data?.description?.slice(0, 155) }
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: pkg } = await supabase.from('packages').select('*').eq('slug', slug).eq('is_active', true).single()
  if (!pkg) notFound()

  const { data: related } = await supabase.from('packages').select('*')
    .eq('tour_type', pkg.tour_type).neq('id', pkg.id).eq('is_active', true).limit(3)

  const discount = pkg.original_price ? getDiscount(pkg.original_price, pkg.price_per_person) : 0
  const waMsg = `Hi! I'm interested in the "${pkg.title}" package (${pkg.duration_days}D/${pkg.duration_nights}N at ${formatPrice(pkg.price_per_person)}/person). Please share more details.`

  return (
    <div className="pt-20">
      {/* Hero banner */}
      <div className="relative h-72 md:h-96 bg-gradient-to-br from-[#0d2137] to-[#2a5a8c] flex items-end">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto px-4 pb-8 w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-white/50 text-xs mb-3">
            <a href="/" className="hover:text-white">Home</a> <ChevronRight size={12} />
            <a href="/packages" className="hover:text-white">Packages</a> <ChevronRight size={12} />
            <span className="text-white">{pkg.title}</span>
          </div>
          {pkg.badge && (
            <span className="bg-[#c8922a] text-white text-xs px-3 py-1 rounded-full font-medium mb-3 inline-block">{pkg.badge}</span>
          )}
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{pkg.title}</h1>
          <div className="flex flex-wrap gap-4 text-white/70 text-sm">
            <span className="flex items-center gap-1.5"><Clock size={14} /> {pkg.duration_days} Days / {pkg.duration_nights} Nights</span>
            {pkg.destination_name && <span className="flex items-center gap-1.5"><MapPin size={14} /> {pkg.destination_name}</span>}
            <span className="flex items-center gap-1.5"><Users size={14} /> {pkg.min_people}–{pkg.max_people} people</span>
            {pkg.rating > 0 && (
              <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {pkg.rating} ({pkg.review_count} reviews)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: Main content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Overview */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold mb-4">Overview</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{pkg.description}</p>

              {pkg.highlights && pkg.highlights.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold text-sm mb-3">Tour Highlights</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {pkg.highlights.map((h: string) => (
                      <div key={h} className="flex items-center gap-2 bg-[#e8f4fd] rounded-lg px-3 py-2 text-xs text-[#1a3a5c]">
                        <span className="text-[#c8922a]">★</span> {h}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Duration', value: `${pkg.duration_days}D / ${pkg.duration_nights}N`, icon: '🗓' },
                { label: 'Best Season', value: pkg.best_season || 'Year Round', icon: '🌤' },
                { label: 'Difficulty', value: pkg.difficulty, icon: '🏔' },
                { label: 'Group Size', value: `${pkg.min_people}–${pkg.max_people}`, icon: '👥' },
              ].map(info => (
                <div key={info.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{info.icon}</div>
                  <div className="text-xs text-gray-500 mb-0.5">{info.label}</div>
                  <div className="font-semibold text-sm capitalize">{info.value}</div>
                </div>
              ))}
            </div>

            {/* Itinerary */}
            {pkg.itinerary && (pkg.itinerary as ItineraryDay[]).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-5">Day-by-Day Itinerary</h2>
                <div className="space-y-4">
                  {(pkg.itinerary as ItineraryDay[]).map((day) => (
                    <details key={day.day} className="group border border-gray-100 rounded-xl overflow-hidden">
                      <summary className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 list-none">
                        <span className="w-10 h-10 bg-[#1a3a5c] text-white rounded-xl flex items-center justify-center text-sm font-bold shrink-0">
                          {day.day}
                        </span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{day.title}</div>
                          {day.meals && <div className="text-xs text-gray-400 mt-0.5">Meals: {day.meals}</div>}
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{day.description}</p>
                        {day.activities && day.activities.length > 0 && (
                          <ul className="space-y-1">
                            {day.activities.map((act: string) => (
                              <li key={act} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="text-[#c8922a] mt-0.5">•</span> {act}
                              </li>
                            ))}
                          </ul>
                        )}
                        {day.accommodation && (
                          <p className="text-xs text-gray-400 mt-2">🏨 {day.accommodation}</p>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions / Exclusions */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600" /> Included
                </h2>
                <ul className="space-y-2.5">
                  {(pkg.inclusions || []).map((item: string) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <XCircle size={18} className="text-red-500" /> Not Included
                </h2>
                <ul className="space-y-2.5">
                  {(pkg.exclusions || []).map((item: string) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Booking sidebar */}
          <div className="space-y-5">
            {/* Price card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-[#1a3a5c]">{formatPrice(pkg.price_per_person)}</span>
                <span className="text-gray-400 text-sm">per person</span>
              </div>
              {pkg.original_price && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="line-through text-gray-400 text-sm">{formatPrice(pkg.original_price)}</span>
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">Save {discount}%</span>
                </div>
              )}

              <div className="space-y-2 py-4 border-y border-gray-100 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{pkg.duration_days}D / {pkg.duration_nights}N</span>
                </div>
                {pkg.start_location && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Starts at</span>
                    <span className="font-medium">{pkg.start_location}</span>
                  </div>
                )}
                {pkg.best_season && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1"><Calendar size={12} /> Best Season</span>
                    <span className="font-medium text-right text-xs">{pkg.best_season}</span>
                  </div>
                )}
              </div>

              <a href={getWhatsAppLink(waMsg)} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium text-sm transition-colors mb-3">
                <MessageCircle size={16} /> Book via WhatsApp
              </a>
              <p className="text-center text-xs text-gray-400">or fill the enquiry form below</p>
            </div>

            {/* Enquiry form */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-bold mb-4">Send Enquiry</h3>
              <EnquiryForm packageId={pkg.id} packageName={pkg.title} destinationName={pkg.destination_name} compact />
            </div>
          </div>
        </div>

        {/* Related packages */}
        {related && related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Similar Packages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map(r => (
                <a key={r.id} href={`/packages/${r.slug}`}
                  className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow flex gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1a3a5c] to-[#2a5a8c] rounded-xl flex items-center justify-center text-2xl shrink-0">
                    🏔
                  </div>
                  <div>
                    <div className="font-semibold text-sm line-clamp-2">{r.title}</div>
                    <div className="text-[#1a3a5c] font-bold text-sm mt-1">{formatPrice(r.price_per_person)}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
