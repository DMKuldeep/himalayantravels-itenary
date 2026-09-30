export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import DestinationFormClient from './DestinationFormClient'
import DeleteDestBtn from './DeleteDestBtn'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Destinations · Admin' }

export default async function AdminDestinationsPage() {
  const supabase = await createClient()
  const { data: destinations } = await supabase.from('destinations').select('*').order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Destinations</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2"><Plus size={16} /> Add Destination</h2>
          <DestinationFormClient />
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name','State','Featured','Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(destinations||[]).map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-sm text-gray-900">{d.name}</div>
                    <div className="text-xs text-gray-400">/destinations/{d.slug}</div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{d.state}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.featured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                      {d.featured ? 'Featured' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-5 py-3"><DeleteDestBtn id={d.id} name={d.name} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
