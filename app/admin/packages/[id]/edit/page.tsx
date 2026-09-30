import { createClient } from '@/lib/supabase/server'
import PackageForm from '../../PackageForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: 'Edit Package · Admin' }

export default async function EditPackagePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: pkg } = await supabase.from('packages').select('*').eq('id', id).single()
  if (!pkg) notFound()
  const { data: destinations } = await supabase.from('destinations').select('id,name').order('name')

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/admin/packages" className="hover:text-gray-700">Packages</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 font-medium">Edit: {pkg.title}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Package</h1>
      <PackageForm mode="edit" initialData={pkg} destinations={destinations || []} />
    </div>
  )
}
