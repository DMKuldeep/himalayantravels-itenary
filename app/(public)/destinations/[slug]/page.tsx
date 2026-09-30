import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PackageCard from '@/components/PackageCard'
import { Package } from '@/lib/types'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('destinations').select('name,description').eq('slug', slug).single()
  return { title: data?.name || 'Destination', description: data?.description }
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: dest } = await supabase.from('destinations').select('*').eq('slug', slug).single()
  if (!dest) notFound()

  const { data: packages } = await supabase.from('packages').select('*')
    .eq('destination_name', dest.name).eq('is_active', true)
    .order('is_featured', { ascending: false })

  return (
    <div className="pt-20 pb-16">
      {/* Banner */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-[#0d2137] to-[#2a5a8c] flex items-end">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 pb-8 w-full">
          <p className="text-white/50 text-xs mb-2">
            <a href="/" className="hover:text-white">Home</a> / <a href="/destinations" className="hover:text-white">Destinations</a> / {dest.name}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white">{dest.name}</h1>
          <p className="text-white/60 text-sm mt-1">{dest.state}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {dest.description && (
          <p className="text-gray-600 text-base max-w-3xl mb-10 leading-relaxed">{dest.description}</p>
        )}

        <h2 className="text-2xl font-bold mb-6">
          Tour Packages in {dest.name}
          <span className="text-base font-normal text-gray-400 ml-2">({packages?.length || 0} packages)</span>
        </h2>

        {!packages || packages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏔</div>
            <p className="text-gray-500">Packages coming soon. <a href="/enquiry" className="text-[#1a3a5c] underline">Enquire for custom tour</a></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg: Package) => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
        )}
      </div>
    </div>
  )
}
