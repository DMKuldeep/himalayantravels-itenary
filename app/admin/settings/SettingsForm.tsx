'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

interface Props {
  initialSettings: Record<string, Record<string, string>>
}

export default function SettingsForm({ initialSettings }: Props) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [contact, setContact] = useState({
    phone: initialSettings.contact?.phone || '',
    email: initialSettings.contact?.email || '',
    whatsapp: initialSettings.contact?.whatsapp || '',
    address: initialSettings.contact?.address || '',
  })

  const [hero, setHero] = useState({
    title: initialSettings.hero?.title || '',
    subtitle: initialSettings.hero?.subtitle || '',
    description: initialSettings.hero?.description || '',
  })

  const [stats, setStats] = useState({
    travellers: initialSettings.stats?.travellers || '',
    packages: initialSettings.stats?.packages || '',
    destinations: initialSettings.stats?.destinations || '',
    experience: initialSettings.stats?.experience || '',
  })

  const handleSave = async () => {
    setLoading(true)
    const updates = [
      { key: 'contact', value: contact },
      { key: 'hero', value: hero },
      { key: 'stats', value: stats },
    ]
    for (const update of updates) {
      await supabase.from('site_settings').upsert({ key: update.key, value: update.value }, { onConflict: 'key' })
    }
    setLoading(false)
    toast.success('Settings saved!')
  }

  const sectionCls = 'bg-white rounded-xl border border-gray-100 p-6 space-y-4'
  const inputCls = 'form-input'
  const labelCls = 'form-label'

  return (
    <div className="space-y-6">
      {/* Contact */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-gray-900 text-lg">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Phone Number</label>
            <input className={inputCls} value={contact.phone}
              onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
              placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className={labelCls}>WhatsApp Number (with country code, no +)</label>
            <input className={inputCls} value={contact.whatsapp}
              onChange={e => setContact(c => ({ ...c, whatsapp: e.target.value }))}
              placeholder="919876543210" />
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input className={inputCls} type="email" value={contact.email}
              onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
              placeholder="info@thehimalayantravels.com" />
          </div>
          <div>
            <label className={labelCls}>Office Address</label>
            <input className={inputCls} value={contact.address}
              onChange={e => setContact(c => ({ ...c, address: e.target.value }))}
              placeholder="Gurugram, Haryana, India" />
          </div>
        </div>
      </div>

      {/* Hero section */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-gray-900 text-lg">Homepage Hero Text</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Main Title (line 1)</label>
            <input className={inputCls} value={hero.title}
              onChange={e => setHero(h => ({ ...h, title: e.target.value }))}
              placeholder="Discover the Himalayas" />
          </div>
          <div>
            <label className={labelCls}>Subtitle (line 2, in gold)</label>
            <input className={inputCls} value={hero.subtitle}
              onChange={e => setHero(h => ({ ...h, subtitle: e.target.value }))}
              placeholder="Like Never Before" />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Hero Description</label>
            <textarea className={inputCls + ' resize-none'} rows={3} value={hero.description}
              onChange={e => setHero(h => ({ ...h, description: e.target.value }))}
              placeholder="Handcrafted tour packages to Himachal Pradesh, Ladakh..." />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-gray-900 text-lg">Homepage Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Happy Travellers</label>
            <input className={inputCls} value={stats.travellers}
              onChange={e => setStats(s => ({ ...s, travellers: e.target.value }))}
              placeholder="5000+" />
          </div>
          <div>
            <label className={labelCls}>Tour Packages</label>
            <input className={inputCls} value={stats.packages}
              onChange={e => setStats(s => ({ ...s, packages: e.target.value }))}
              placeholder="120+" />
          </div>
          <div>
            <label className={labelCls}>Destinations</label>
            <input className={inputCls} value={stats.destinations}
              onChange={e => setStats(s => ({ ...s, destinations: e.target.value }))}
              placeholder="25+" />
          </div>
          <div>
            <label className={labelCls}>Years Experience</label>
            <input className={inputCls} value={stats.experience}
              onChange={e => setStats(s => ({ ...s, experience: e.target.value }))}
              placeholder="14" />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div>
        <button onClick={handleSave} disabled={loading} className="btn-primary disabled:opacity-60">
          <Save size={16} /> {loading ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
