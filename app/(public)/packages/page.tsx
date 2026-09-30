export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import PackageCard from '@/components/PackageCard'
import { Package } from '@/lib/types'
import { TOUR_TYPES } from '@/lib/utils'
import { SlidersHorizontal } from 'lucide-react'

interface Props {
  searchParams: Promise<{ type?: string; dest?: string; duration?: string; budget?: string }>
}

export const metadata = { title: 'All Tour Packages' }

export default async function PackagesPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from('packages').select('*').eq('is_active', true)
  if (params.type) query = query.eq('tour_type', params.type)
  if (params.dest) query = query.ilike('destination_name', `%${params.dest}%`)
  if (params.duration) {
    const [min, max] = params.duration.split('-').map(Number)
    if (max) query = query.gte('duration_days', min).lte('duration_days', max)
    else query = query.gte('duration_days', min)
  }
  if (params.budget) {
    const budgetMap: Record<string, [number, number]> = {
      under_10k: [0, 10000], '10k_25k': [10000, 25000],
      '25k_50k': [25000, 50000], above_50k: [50000, 9999999],
    }
    const range = budgetMap[params.budget]
    if (range) query = query.gte('price_per_person', range[0]).lte('price_per_person', range[1])
  }

  const { data: packages } = await query.order('is_featured', { ascending: false }).order('bookings_count', { ascending: false })
  const { data: destinations } = await supabase.from('destinations').select('id,name,slug').order('name')

  const activeType = params.type || ''

  return (
    <div className="pt-24 pb-16">
      {/* Header */}
      <div className="bg-gray-50 py-10 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-semibold text-[#c8922a] uppercase tracking-widest mb-1">Explore</p>
          <h1 className="text-3xl font-bold text-[#1a1a2e] mb-2">All Tour Packages</h1>
          <p className="text-gray-500 text-sm">{packages?.length || 0} packages found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Tour type pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <a href="/packages"
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${!activeType ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a3a5c]'}`}>
            All
          </a>
          {TOUR_TYPES.map(t => (
            <a key={t.value} href={`/packages?type=${t.value}`}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border flex items-center gap-1.5 ${activeType === t.value ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a3a5c]'}`}>
              <span>{t.emoji}</span> {t.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
              <div className="flex items-center gap-2 font-semibold text-sm mb-4">
                <SlidersHorizontal size={15} /> Filters
              </div>

              <div className="space-y-5">
                <div>
                  <label className="form-label">Destination</label>
                  <select className="form-input text-sm"
                    onChange={e => window.location.href = e.target.value ? `/packages?dest=${e.target.value}${params.type ? `&type=${params.type}` : ''}` : '/packages'}
                    defaultValue={params.dest || ''}>
                    <option value="">All Destinations</option>
                    {(destinations || []).map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Duration</label>
                  <select className="form-input text-sm"
                    onChange={e => window.location.href = `/packages?duration=${e.target.value}${params.type ? `&type=${params.type}` : ''}`}
                    defaultValue={params.duration || ''}>
                    <option value="">Any Duration</option>
                    <option value="3-5">3–5 Days</option>
                    <option value="6-8">6–8 Days</option>
                    <option value="9-12">9–12 Days</option>
                    <option value="13">13+ Days</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Budget (per person)</label>
                  <select className="form-input text-sm"
                    onChange={e => window.location.href = `/packages?budget=${e.target.value}${params.type ? `&type=${params.type}` : ''}`}
                    defaultValue={params.budget || ''}>
                    <option value="">Any Budget</option>
                    <option value="under_10k">Under ₹10,000</option>
                    <option value="10k_25k">₹10,000 – ₹25,000</option>
                    <option value="25k_50k">₹25,000 – ₹50,000</option>
                    <option value="above_50k">Above ₹50,000</option>
                  </select>
                </div>

                <a href="/packages" className="text-xs text-[#c8922a] hover:underline block">Clear all filters</a>
              </div>
            </div>
          </aside>

          {/* Package grid */}
          <div className="flex-1">
            {!packages || packages.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🏔</div>
                <h3 className="font-semibold text-lg mb-2">No packages found</h3>
                <p className="text-gray-500 text-sm">Try different filters or <a href="/packages" className="text-[#1a3a5c] underline">clear all</a></p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {packages.map((pkg: Package) => <PackageCard key={pkg.id} pkg={pkg} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
