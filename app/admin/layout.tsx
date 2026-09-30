import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from './components/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: adminProfile } = await supabase
    .from('admin_profiles').select('*').eq('id', user.id).single()

  if (!adminProfile) redirect('/admin/login')

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar user={user} admin={adminProfile} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
