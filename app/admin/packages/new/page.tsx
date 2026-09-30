import { createClient } from '@/lib/supabase/server'
import PackageForm from '../PackageForm'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Package · Admin' }

export default async function NewPackagePage() {
  const supabase = await createClient()
  const { data: destinations } = await supabase.from('destinations').select('id,name').order('name')

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/admin/packages" className="hover:text-gray-700">Packages</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 font-medium">New Package</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Package</h1>
      <PackageForm mode="new" destinations={destinations || []} />
    </div>
  )
}
