'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

export default function DeleteBlogBtn({ id, title }: { id: string; title: string }) {
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"?`)) return
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Post deleted')
    router.refresh()
  }

  return (
    <button onClick={handleDelete}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
      <Trash2 size={15} />
    </button>
  )
}
