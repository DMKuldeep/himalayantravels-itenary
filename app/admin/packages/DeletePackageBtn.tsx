'use client'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DeletePackageBtn({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const { error } = await supabase.from('packages').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    toast.success('Package deleted')
    router.refresh()
  }

  return (
    <button onClick={handleDelete}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
      <Trash2 size={15} />
    </button>
  )
}
