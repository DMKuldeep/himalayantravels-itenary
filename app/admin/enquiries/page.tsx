export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate, STATUS_COLORS } from '@/lib/utils'
import EnquiryStatusBtn from './EnquiryStatusBtn'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Enquiries · Admin' }

interface Props { searchParams: Promise<{ status?: string }> }

export default async function AdminEnquiriesPage({ searchParams }: Props) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('enquiries').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data: enquiries } = await query

  const statusOptions = ['all', 'new', 'contacted', 'converted', 'closed']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
          <p className="text-gray-500 text-sm">{enquiries?.length || 0} results</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto">
        {statusOptions.map(s => (
          <a key={s} href={s === 'all' ? '/admin/enquiries' : `/admin/enquiries?status=${s}`}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium capitalize border transition-colors ${
              (status === s || (!status && s === 'all'))
                ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a3a5c]'
            }`}>
            {s}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Phone', 'Email', 'Destination / Package', 'Travel Date', 'People', 'Budget', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(enquiries || []).map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm text-gray-900 whitespace-nowrap">{e.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    <a href={`tel:${e.phone}`} className="hover:text-[#1a3a5c]">{e.phone}</a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{e.email || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-[180px]">
                    <div className="truncate">{e.package_name || e.destination || '—'}</div>
                    {e.tour_type && <div className="text-xs text-gray-400 capitalize">{e.tour_type}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {e.travel_date ? new Date(e.travel_date).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{e.num_people}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{e.budget?.replace(/_/g,' ') || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[e.status as keyof typeof STATUS_COLORS]}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(e.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`https://wa.me/${e.phone.replace(/\D/g, '')}`} target="_blank"
                        className="text-green-500 hover:text-green-700 text-xs font-medium whitespace-nowrap">
                        WhatsApp
                      </a>
                      <EnquiryStatusBtn id={e.id} currentStatus={e.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!enquiries || enquiries.length === 0) && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📩</div>
            No enquiries found
          </div>
        )}
      </div>
    </div>
  )
}
