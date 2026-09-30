export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings · Admin' }

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*')

  const settingsMap: Record<string, Record<string, string>> = {}
  settings?.forEach(s => { settingsMap[s.key] = s.value as Record<string, string> })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h1>
      <SettingsForm initialSettings={settingsMap} />
    </div>
  )
}
