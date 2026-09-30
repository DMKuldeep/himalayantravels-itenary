export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'All Destinations' }

const DEST_GRADIENTS = [
  'from-[#0d2137] to-[#1a3a5c]', 'from-green-900 to-green-700',
  'from-purple-900 to-purple-700', 'from-amber-900 to-orange-700',
  'from-teal-900 to-teal-600', 'from-rose-900 to-rose-700',
  'from-slate-800 to-slate-600', 'from-cyan-900 to-cyan-700',
]

export default async function DestinationsPage() {
  const supabase = await createClient()
  const { data: destinations } = await supabase.from('destinations').select('*').order('featured', { ascending: false }).order('name')

  return (
    <div className="pt-24 pb-16">
      <div className="bg-gray-50 py-10 mb-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-semibold text-[#c8922a] uppercase tracking-widest mb-1">Explore India</p>
          <h1 className="text-3xl font-bold text-[#1a1a2e] mb-2">Our Destinations</h1>
          <p className="text-gray-500 text-sm">From the heights of Ladakh to the forests of Kerala — find your perfect escape</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {(destinations || []).map((dest, i) => (
            <Link key={dest.id} href={`/destinations/${dest.slug}`}
              className="group relative h-56 rounded-2xl overflow-hidden cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-br ${DEST_GRADIENTS[i % DEST_GRADIENTS.length]} group-hover:scale-105 transition-transform duration-500`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {dest.featured && (
                <span className="absolute top-3 right-3 bg-[#c8922a] text-white text-[10px] font-medium px-2 py-1 rounded-full">
                  Popular
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="text-white font-bold text-lg leading-tight">{dest.name}</div>
                <div className="text-white/60 text-xs mt-0.5">{dest.state}</div>
                {dest.description && (
                  <div className="text-white/50 text-xs mt-1 line-clamp-2">{dest.description}</div>
                )}
                <div className="mt-3 text-[#c8922a] text-xs font-medium">Explore packages →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
