'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Send, MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '@/lib/utils'

interface EnquiryFormProps {
  packageId?: string
  packageName?: string
  destinationName?: string
  compact?: boolean
}

export default function EnquiryForm({ packageId, packageName, destinationName, compact = false }: EnquiryFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    destination: destinationName || '',
    travel_date: '', num_people: '1',
    tour_type: '', budget: '', message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) { toast.error('Please fill your name and phone number'); return }
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.from('enquiries').insert({
        name: form.name, phone: form.phone, email: form.email || null,
        destination: form.destination || destinationName,
        package_id: packageId || null, package_name: packageName || null,
        travel_date: form.travel_date || null,
        num_people: parseInt(form.num_people) || 1,
        tour_type: form.tour_type || null, budget: form.budget || null,
        message: form.message || null, source: 'website',
      })
      if (error) throw error
      toast.success("Enquiry sent! We'll call you within 2 hours 🎉")
      setForm({ name: '', phone: '', email: '', destination: destinationName || '', travel_date: '', num_people: '1', tour_type: '', budget: '', message: '' })
    } catch {
      toast.error('Something went wrong. Please try WhatsApp instead.')
    } finally {
      setLoading(false)
    }
  }

  const waMessage = packageName
    ? `Hi! I'm interested in the "${packageName}" package. Please share more details.`
    : `Hi! I'm looking for a Himalayan tour package. Can you help?`

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <div>
          <label className="form-label">Name *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="form-input" required />
        </div>
        <div>
          <label className="form-label">Phone / WhatsApp *</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className="form-input" type="tel" required />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input name="email" value={form.email} onChange={handleChange} placeholder="Optional" className="form-input" type="email" />
        </div>
        <div>
          <label className="form-label">Destination</label>
          <input name="destination" value={form.destination} onChange={handleChange} placeholder="e.g. Leh Ladakh" className="form-input" />
        </div>
        <div>
          <label className="form-label">Travel Date</label>
          <input name="travel_date" value={form.travel_date} onChange={handleChange} className="form-input" type="date" min={new Date().toISOString().split('T')[0]} />
        </div>
        <div>
          <label className="form-label">No. of Travellers</label>
          <select name="num_people" value={form.num_people} onChange={handleChange} className="form-input">
            {[1,2,3,4,5,6,'7-10','10-20','20+'].map(n => (
              <option key={n} value={n}>{n} {typeof n === 'number' && n === 1 ? 'person' : 'people'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Tour Type</label>
          <select name="tour_type" value={form.tour_type} onChange={handleChange} className="form-input">
            <option value="">Select type</option>
            <option value="honeymoon">Honeymoon</option>
            <option value="family">Family Vacation</option>
            <option value="adventure">Adventure</option>
            <option value="pilgrimage">Pilgrimage</option>
            <option value="group">Group Tour</option>
            <option value="solo">Solo Trip</option>
          </select>
        </div>
        <div>
          <label className="form-label">Budget (per person)</label>
          <select name="budget" value={form.budget} onChange={handleChange} className="form-input">
            <option value="">Select budget</option>
            <option value="under_10k">Under ₹10,000</option>
            <option value="10k_25k">₹10,000 – ₹25,000</option>
            <option value="25k_50k">₹25,000 – ₹50,000</option>
            <option value="above_50k">Above ₹50,000</option>
          </select>
        </div>
      </div>
      {!compact && (
        <div>
          <label className="form-label">Special Requirements</label>
          <textarea name="message" value={form.message} onChange={handleChange}
            placeholder="Any special requests, dietary needs, or questions..."
            className="form-input resize-none" rows={3} />
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="btn-primary flex-1 justify-center"
          style={{ opacity: loading ? 0.6 : 1 }}>
          <Send size={15} />{loading ? 'Sending...' : 'Send Enquiry'}
        </button>
        <a href={getWhatsAppLink(waMessage)} target="_blank" rel="noopener noreferrer"
          style={{ background:'#16a34a', color:'#fff', borderRadius:'0.5rem', padding:'0.6rem 1.25rem', fontWeight:500, fontSize:'0.875rem', display:'inline-flex', alignItems:'center', gap:'0.5rem', textDecoration:'none', flex:1, justifyContent:'center' }}>
          <MessageCircle size={15} /> WhatsApp
        </a>
      </div>
    </form>
  )
}
