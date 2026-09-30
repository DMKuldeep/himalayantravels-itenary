'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { slugify, TOUR_TYPES } from '@/lib/utils'
import { Plus, Trash2, Save } from 'lucide-react'
import type { Package, ItineraryDay } from '@/lib/types'

interface Props {
  initialData?: Partial<Package>
  destinations: { id: string; name: string }[]
  mode: 'new' | 'edit'
}

export default function PackageForm({ initialData, destinations, mode }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    destination_name: initialData?.destination_name || '',
    tour_type: initialData?.tour_type || 'adventure',
    duration_days: initialData?.duration_days || 5,
    duration_nights: initialData?.duration_nights || 4,
    price_per_person: initialData?.price_per_person || 0,
    original_price: initialData?.original_price || '',
    description: initialData?.description || '',
    best_season: initialData?.best_season || '',
    start_location: initialData?.start_location || '',
    end_location: initialData?.end_location || '',
    difficulty: initialData?.difficulty || 'moderate',
    badge: initialData?.badge || '',
    max_people: initialData?.max_people || 20,
    min_people: initialData?.min_people || 1,
    is_featured: initialData?.is_featured ?? false,
    is_active: initialData?.is_active ?? true,
    thumbnail_url: initialData?.thumbnail_url || '',
  })

  const [highlights, setHighlights] = useState<string[]>(initialData?.highlights || [''])
  const [inclusions, setInclusions] = useState<string[]>(initialData?.inclusions || [''])
  const [exclusions, setExclusions] = useState<string[]>(initialData?.exclusions || [''])
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(
    initialData?.itinerary && (initialData.itinerary as ItineraryDay[]).length > 0
      ? initialData.itinerary as ItineraryDay[]
      : [{ day: 1, title: '', description: '', activities: [''], accommodation: '', meals: '' }]
  )

  const setField = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }))

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: mode === 'new' ? slugify(title) : f.slug }))
  }

  const updateList = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number, val: string) => {
    setter(prev => prev.map((v, i) => i === idx ? val : v))
  }
  const addToList = (setter: React.Dispatch<React.SetStateAction<string[]>>) => setter(prev => [...prev, ''])
  const removeFromList = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => setter(prev => prev.filter((_, i) => i !== idx))

  const updateItineraryField = (dayIdx: number, key: keyof ItineraryDay, value: unknown) => {
    setItinerary(prev => prev.map((d, i) => i === dayIdx ? { ...d, [key]: value } : d))
  }
  const addDay = () => setItinerary(prev => [...prev, { day: prev.length + 1, title: '', description: '', activities: [''], accommodation: '', meals: '' }])
  const removeDay = (idx: number) => setItinerary(prev => prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 })))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.price_per_person) { toast.error('Title and price are required'); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        original_price: form.original_price ? Number(form.original_price) : null,
        duration_days: Number(form.duration_days),
        duration_nights: Number(form.duration_nights),
        price_per_person: Number(form.price_per_person),
        max_people: Number(form.max_people),
        min_people: Number(form.min_people),
        highlights: highlights.filter(Boolean),
        inclusions: inclusions.filter(Boolean),
        exclusions: exclusions.filter(Boolean),
        itinerary: itinerary.filter(d => d.title),
      }

      const { error } = mode === 'new'
        ? await supabase.from('packages').insert(payload)
        : await supabase.from('packages').update(payload).eq('id', initialData!.id!)

      if (error) throw error
      toast.success(mode === 'new' ? 'Package created!' : 'Package updated!')
      router.push('/admin/packages')
      router.refresh()
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'form-input'
  const labelCls = 'form-label'
  const sectionCls = 'bg-white rounded-xl border border-gray-100 p-6 space-y-4'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-gray-900 text-lg">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Package Title *</label>
            <input className={inputCls} value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. Leh Ladakh Road Trip" required />
          </div>
          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input className={inputCls} value={form.slug} onChange={e => setField('slug', e.target.value)} placeholder="leh-ladakh-road-trip" />
          </div>
          <div>
            <label className={labelCls}>Destination</label>
            <select className={inputCls} value={form.destination_name} onChange={e => setField('destination_name', e.target.value)}>
              <option value="">Select destination</option>
              {destinations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Tour Type</label>
            <select className={inputCls} value={form.tour_type} onChange={e => setField('tour_type', e.target.value)}>
              {TOUR_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Badge (e.g. Bestseller)</label>
            <input className={inputCls} value={form.badge} onChange={e => setField('badge', e.target.value)} placeholder="Bestseller / Honeymoon / Budget" />
          </div>
          <div>
            <label className={labelCls}>Duration (Days)</label>
            <input className={inputCls} type="number" min={1} value={form.duration_days} onChange={e => setField('duration_days', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Duration (Nights)</label>
            <input className={inputCls} type="number" min={0} value={form.duration_nights} onChange={e => setField('duration_nights', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Price per Person (₹) *</label>
            <input className={inputCls} type="number" min={0} value={form.price_per_person} onChange={e => setField('price_per_person', e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Original Price (₹) for discount</label>
            <input className={inputCls} type="number" min={0} value={form.original_price} onChange={e => setField('original_price', e.target.value)} placeholder="Leave empty if no discount" />
          </div>
          <div>
            <label className={labelCls}>Difficulty</label>
            <select className={inputCls} value={form.difficulty} onChange={e => setField('difficulty', e.target.value)}>
              <option value="easy">Easy</option><option value="moderate">Moderate</option><option value="challenging">Challenging</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Best Season</label>
            <input className={inputCls} value={form.best_season} onChange={e => setField('best_season', e.target.value)} placeholder="e.g. May - September" />
          </div>
          <div>
            <label className={labelCls}>Start Location</label>
            <input className={inputCls} value={form.start_location} onChange={e => setField('start_location', e.target.value)} placeholder="e.g. Manali" />
          </div>
          <div>
            <label className={labelCls}>End Location</label>
            <input className={inputCls} value={form.end_location} onChange={e => setField('end_location', e.target.value)} placeholder="e.g. Leh" />
          </div>
          <div>
            <label className={labelCls}>Min People</label>
            <input className={inputCls} type="number" min={1} value={form.min_people} onChange={e => setField('min_people', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Max People</label>
            <input className={inputCls} type="number" min={1} value={form.max_people} onChange={e => setField('max_people', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Thumbnail URL</label>
            <input className={inputCls} value={form.thumbnail_url} onChange={e => setField('thumbnail_url', e.target.value)} placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea className={inputCls + ' resize-none'} rows={4} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Describe the package in detail..." />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setField('is_active', e.target.checked)} className="w-4 h-4 accent-[#1a3a5c]" />
              <span className="text-sm font-medium text-gray-700">Active (visible on website)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setField('is_featured', e.target.checked)} className="w-4 h-4 accent-[#c8922a]" />
              <span className="text-sm font-medium text-gray-700">Featured (show on homepage)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-lg">Tour Highlights</h2>
          <button type="button" onClick={() => addToList(setHighlights)} className="text-xs text-[#1a3a5c] hover:underline flex items-center gap-1">
            <Plus size={13} /> Add
          </button>
        </div>
        {highlights.map((h, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputCls} value={h} onChange={e => updateList(setHighlights, i, e.target.value)} placeholder={`Highlight ${i + 1}`} />
            {highlights.length > 1 && (
              <button type="button" onClick={() => removeFromList(setHighlights, i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
            )}
          </div>
        ))}
      </div>

      {/* Inclusions */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-lg">Inclusions</h2>
          <button type="button" onClick={() => addToList(setInclusions)} className="text-xs text-[#1a3a5c] hover:underline flex items-center gap-1"><Plus size={13} /> Add</button>
        </div>
        {inclusions.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputCls} value={item} onChange={e => updateList(setInclusions, i, e.target.value)} placeholder="e.g. Accommodation (5 nights)" />
            {inclusions.length > 1 && <button type="button" onClick={() => removeFromList(setInclusions, i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={15} /></button>}
          </div>
        ))}
      </div>

      {/* Exclusions */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-lg">Exclusions</h2>
          <button type="button" onClick={() => addToList(setExclusions)} className="text-xs text-[#1a3a5c] hover:underline flex items-center gap-1"><Plus size={13} /> Add</button>
        </div>
        {exclusions.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputCls} value={item} onChange={e => updateList(setExclusions, i, e.target.value)} placeholder="e.g. Airfare" />
            {exclusions.length > 1 && <button type="button" onClick={() => removeFromList(setExclusions, i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={15} /></button>}
          </div>
        ))}
      </div>

      {/* Itinerary */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-lg">Day-by-Day Itinerary</h2>
          <button type="button" onClick={addDay} className="text-xs text-[#1a3a5c] hover:underline flex items-center gap-1"><Plus size={13} /> Add Day</button>
        </div>
        {itinerary.map((day, idx) => (
          <div key={idx} className="border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-[#1a3a5c]">Day {day.day}</span>
              {itinerary.length > 1 && (
                <button type="button" onClick={() => removeDay(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Day Title</label>
                <input className={inputCls} value={day.title} onChange={e => updateItineraryField(idx, 'title', e.target.value)} placeholder="e.g. Arrival in Manali" />
              </div>
              <div>
                <label className={labelCls}>Meals</label>
                <input className={inputCls} value={day.meals || ''} onChange={e => updateItineraryField(idx, 'meals', e.target.value)} placeholder="Breakfast & Dinner" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Description</label>
                <textarea className={inputCls + ' resize-none'} rows={2} value={day.description} onChange={e => updateItineraryField(idx, 'description', e.target.value)} placeholder="Describe the day..." />
              </div>
              <div>
                <label className={labelCls}>Accommodation</label>
                <input className={inputCls} value={day.accommodation || ''} onChange={e => updateItineraryField(idx, 'accommodation', e.target.value)} placeholder="Hotel name / Camp" />
              </div>
              <div>
                <label className={labelCls}>Activities (one per line)</label>
                <textarea className={inputCls + ' resize-none'} rows={2}
                  value={(day.activities || []).join('\n')}
                  onChange={e => updateItineraryField(idx, 'activities', e.target.value.split('\n').filter(Boolean))}
                  placeholder="Sightseeing&#10;Local market visit" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pb-8">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          <Save size={16} /> {loading ? 'Saving...' : mode === 'new' ? 'Create Package' : 'Update Package'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">Cancel</button>
      </div>
    </form>
  )
}
