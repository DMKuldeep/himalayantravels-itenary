export const dynamic = 'force-dynamic'
import EnquiryForm from '@/components/EnquiryForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About Us' }

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <div className="bg-[#1a3a5c] py-16 mb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#c8922a] text-xs font-semibold uppercase tracking-widest mb-2">Our Story</p>
          <h1 className="text-4xl font-bold text-white mb-4">About The Himalayan Travels</h1>
          <p className="text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            For over 14 years, we&apos;ve been turning Himalayan dreams into lifelong memories — one journey at a time.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Story */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <p className="text-xs font-semibold text-[#c8922a] uppercase tracking-widest mb-2">Who We Are</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Born in the Mountains</h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <p>
                The Himalayan Travels was founded in 2010 by a group of mountain enthusiasts who believed that the Himalayas deserved to be experienced — not just visited. Our founders grew up in Himachal Pradesh and Uttarakhand, and their deep connection with the mountains shaped everything we do.
              </p>
              <p>
                From humble beginnings organizing small group treks, we&apos;ve grown into a full-service travel company offering over 120 curated packages across 25+ destinations. But our philosophy has never changed: every trip should feel personal, safe, and unforgettable.
              </p>
              <p>
                Today, we&apos;re proud to be IATA registered and have served 5000+ happy travellers from across India and the world. Our team of 30+ local experts, guides, and travel planners work round the clock to make your dream trip a reality.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '5000+', label: 'Happy Travellers' },
              { num: '120+', label: 'Tour Packages' },
              { num: '25+', label: 'Destinations' },
              { num: '14+', label: 'Years Experience' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-[#1a3a5c] mb-1">{s.num}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-[#c8922a] uppercase tracking-widest mb-2">Our Values</p>
            <h2 className="text-3xl font-bold text-gray-900">What We Stand For</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { emoji: '🛡', title: 'Safety First', text: 'Every trip is backed by thorough safety protocols, vetted guides, and emergency support.' },
              { emoji: '🌿', title: 'Responsible Travel', text: 'We promote eco-friendly practices and support local communities at every destination.' },
              { emoji: '💎', title: 'Quality Experience', text: 'Carefully selected hotels, authentic experiences, and personal attention to every detail.' },
              { emoji: '🤝', title: 'Honest Pricing', text: 'No hidden charges, no surprises. You always know exactly what you\'re paying for.' },
            ].map(v => (
              <div key={v.title} className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{v.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#1a3a5c] rounded-2xl p-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Ready to Explore with Us?</h2>
              <p className="text-white/60 text-sm mb-4">Send us an enquiry and we&apos;ll plan your perfect Himalayan adventure.</p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <EnquiryForm compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
