'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils'
import { Save } from 'lucide-react'
import type { BlogPost } from '@/lib/types'

interface Props {
  initialData?: Partial<BlogPost>
  mode: 'new' | 'edit'
}

export default function BlogForm({ initialData, mode }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    cover_image: initialData?.cover_image || '',
    author: initialData?.author || 'The Himalayan Travels Team',
    tags: (initialData?.tags || []).join(', '),
    is_published: initialData?.is_published ?? false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) { toast.error('Title is required'); return }
    setLoading(true)
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    const { error } = mode === 'new'
      ? await supabase.from('blog_posts').insert(payload)
      : await supabase.from('blog_posts').update(payload).eq('id', initialData!.id!)
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success(mode === 'new' ? 'Post created!' : 'Post updated!')
    router.push('/admin/blog')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-lg">Post Details</h2>
        <div>
          <label className="form-label">Title *</label>
          <input className="form-input" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: mode === 'new' ? slugify(e.target.value) : f.slug }))}
            placeholder="e.g. Best Time to Visit Ladakh" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Slug</label>
            <input className="form-input" value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" />
          </div>
          <div>
            <label className="form-label">Author</label>
            <input className="form-input" value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="form-label">Cover Image URL</label>
          <input className="form-input" value={form.cover_image}
            onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
            placeholder="https://..." />
        </div>
        <div>
          <label className="form-label">Tags (comma separated)</label>
          <input className="form-input" value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="Ladakh, Travel Tips, Himachal" />
        </div>
        <div>
          <label className="form-label">Excerpt (for listing pages)</label>
          <textarea className="form-input resize-none" rows={2} value={form.excerpt}
            onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            placeholder="Short description shown on the blog listing..." />
        </div>
        <div>
          <label className="form-label">Content (Markdown supported)</label>
          <textarea className="form-input resize-none font-mono text-sm" rows={16} value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="# Heading&#10;&#10;Write your blog content here in Markdown..." />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_published}
            onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
            className="w-4 h-4 accent-[#1a3a5c]" />
          <span className="text-sm font-medium text-gray-700">Publish immediately</span>
        </label>
      </div>

      <div className="flex gap-4 pb-8">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          <Save size={16} /> {loading ? 'Saving...' : mode === 'new' ? 'Publish Post' : 'Update Post'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">Cancel</button>
      </div>
    </form>
  )
}
