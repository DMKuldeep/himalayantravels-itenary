export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Eye } from 'lucide-react'
import type { Metadata } from 'next'
import DeletePackageBtn from './DeletePackageBtn'

export const metadata: Metadata = { title: 'Manage Packages · Admin' }

export default async function AdminPackagesPage() {
  const supabase = await createClient()
  const { data: packages } = await supabase.from('packages').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
          <p className="text-gray-500 text-sm">{packages?.length || 0} total packages</p>
        </div>
        <Link href="/admin/packages/new" className="btn-primary">
          <Plus size={16} /> New Package
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Package', 'Type', 'Duration', 'Price', 'Status', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(packages || []).map(pkg => (
                <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900 text-sm">{pkg.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{pkg.destination_name || '—'}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="capitalize text-sm text-gray-600">{pkg.tour_type}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {pkg.duration_days}D/{pkg.duration_nights}N
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#1a3a5c] whitespace-nowrap">
                    {formatPrice(pkg.price_per_person)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pkg.is_featured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                      {pkg.is_featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/packages/${pkg.slug}`} target="_blank"
                        className="p-1.5 text-gray-400 hover:text-[#1a3a5c] hover:bg-[#e8f4fd] rounded-lg transition-colors" title="View">
                        <Eye size={15} />
                      </Link>
                      <Link href={`/admin/packages/${pkg.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-[#1a3a5c] hover:bg-[#e8f4fd] rounded-lg transition-colors" title="Edit">
                        <Pencil size={15} />
                      </Link>
                      <DeletePackageBtn id={pkg.id} name={pkg.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!packages || packages.length === 0) && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-500 mb-4">No packages yet</p>
            <Link href="/admin/packages/new" className="btn-primary">
              <Plus size={15} /> Create First Package
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
