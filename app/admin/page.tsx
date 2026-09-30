export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { Package, MessageSquare, MapPin, TrendingUp, Clock } from 'lucide-react'
import { formatPrice, formatDate, STATUS_COLORS } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalPackages },
    { count: totalEnquiries },
    { count: newEnquiries },
    { count: totalDestinations },
    { data: recentEnquiries },
    { data: topPackages },
  ] = await Promise.all([
    supabase.from('packages').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('enquiries').select('*', { count: 'exact', head: true }),
    supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('destinations').select('*', { count: 'exact', head: true }),
    supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(8),
    supabase.from('packages').select('title,slug,price_per_person,bookings_count,rating').eq('is_active', true).order('bookings_count', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Active Packages', value: totalPackages || 0, icon: Package, color: 'bg-blue-50 text-blue-700', href: '/admin/packages' },
    { label: 'Total Enquiries', value: totalEnquiries || 0, icon: MessageSquare, color: 'bg-green-50 text-green-700', href: '/admin/enquiries' },
    { label: 'New Enquiries', value: newEnquiries || 0, icon: TrendingUp, color: 'bg-amber-50 text-amber-700', href: '/admin/enquiries?status=new' },
    { label: 'Destinations', value: totalDestinations || 0, icon: MapPin, color: 'bg-purple-50 text-purple-700', href: '/admin/destinations' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-gray-500 text-sm mt-1">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent enquiries */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Enquiries</h2>
            <Link href="/admin/enquiries" className="text-xs text-[#1a3a5c] hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Phone', 'Destination', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(recentEnquiries || []).map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{e.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{e.destination || e.package_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[e.status as keyof typeof STATUS_COLORS]}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={11} /> {formatDate(e.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top packages */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Packages</h2>
            <Link href="/admin/packages" className="text-xs text-[#1a3a5c] hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(topPackages || []).map((pkg, i) => (
              <div key={pkg.slug} className="flex items-center gap-3 p-4">
                <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{pkg.title}</div>
                  <div className="text-xs text-gray-400">{formatPrice(pkg.price_per_person)} · {pkg.bookings_count} bookings</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
