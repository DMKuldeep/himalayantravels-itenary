'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

export default function DeleteDestBtn({ id, name }: { id: string; name: string }) {
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Delete "${name}"?`)) return
    const { error } = await supabase.from('destinations').delete().eq('id', id)
    if (error) { toast.error('Cannot delete — packages may reference this destination'); return }
    toast.success('Deleted')
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
      <Trash2 size={15} />
    </button>
  )
}
