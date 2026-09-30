'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const NEXT_STATUS: Record<string, string> = {
  new: 'contacted', contacted: 'converted', converted: 'closed', closed: 'new',
}

const LABELS: Record<string, string> = {
  new: '→ Mark Contacted', contacted: '→ Mark Converted',
  converted: '→ Mark Closed', closed: '→ Reopen',
}

export default function EnquiryStatusBtn({ id, currentStatus }: { id: string; currentStatus: string }) {
  const supabase = createClient()
  const router = useRouter()

  const handleUpdate = async () => {
    const newStatus = NEXT_STATUS[currentStatus]
    const { error } = await supabase.from('enquiries').update({ status: newStatus }).eq('id', id)
    if (error) { toast.error('Failed to update'); return }
    toast.success(`Status → ${newStatus}`)
    router.refresh()
  }

  return (
    <button onClick={handleUpdate}
      className="text-xs text-[#1a3a5c] hover:underline whitespace-nowrap">
      {LABELS[currentStatus] || '→ Update'}
    </button>
  )
}
