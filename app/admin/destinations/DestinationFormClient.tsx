'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils'

export default function DestinationForm() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', state: '', description: '', featured: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.state) { toast.error('Name and state required'); return }
    setLoading(true)
    const { error } = await supabase.from('destinations').insert({ ...form, slug: form.slug || slugify(form.name) })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Destination added!')
    setForm({ name: '', slug: '', state: '', description: '', featured: false })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="form-label">Name *</label>
        <input className="form-input" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
          placeholder="e.g. Nainital" required />
      </div>
      <div>
        <label className="form-label">Slug</label>
        <input className="form-input" value={form.slug}
          onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" />
      </div>
      <div>
        <label className="form-label">State *</label>
        <input className="form-input" value={form.state}
          onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="e.g. Uttarakhand" required />
      </div>
      <div>
        <label className="form-label">Description</label>
        <textarea className="form-input resize-none" rows={2} value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.featured}
          onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-[#c8922a]" />
        <span className="text-sm text-gray-700">Featured on homepage</span>
      </label>
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
        {loading ? 'Adding...' : 'Add Destination'}
      </button>
    </form>
  )
}
