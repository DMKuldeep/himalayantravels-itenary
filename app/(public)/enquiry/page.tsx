export const dynamic = 'force-dynamic'
import EnquiryForm from '@/components/EnquiryForm'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { companyContact } from '@/lib/company'

export const metadata: Metadata = { title: 'Enquire Now | Plan Your Trip' }

export default function EnquiryPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="bg-gray-50 py-10 mb-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-semibold text-[#c8922a] uppercase tracking-widest mb-1">Get In Touch</p>
          <h1 className="text-3xl font-bold text-[#1a1a2e] mb-2">Plan Your Trip</h1>
          <p className="text-gray-500 text-sm">Fill the form and our travel expert will call you within 2 hours</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-10">
        {/* Contact info */}
        <div>
          <h2 className="font-bold text-lg mb-5">Contact Us</h2>
          <div className="space-y-5 mb-8">
            {[
              { icon: Phone, label: 'Phone', value: companyContact.phone, href: companyContact.phoneHref },
              { icon: MessageCircle, label: 'WhatsApp', value: companyContact.phone, href: companyContact.whatsappHref },
              { icon: Mail, label: 'Email', value: companyContact.email, href: `mailto:${companyContact.email}` },
              { icon: MapPin, label: 'Address', value: companyContact.address, href: '#' },
            ].map(({ icon: Icon, label, value, href }) => (
              <a key={label} href={href}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="w-9 h-9 bg-[#e8f4fd] rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[#1a3a5c]" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                  <div className="text-sm font-medium text-[#1a1a2e]">{value}</div>
                </div>
              </a>
            ))}
          </div>

          <div className="bg-[#1a3a5c] rounded-xl p-5 text-white">
            <h3 className="font-bold mb-2">Why Book With Us?</h3>
            {['Free consultation', 'Best price guarantee', '24/7 trip support', 'Fully customizable tours'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/70 mt-2">
                <span className="text-[#c8922a]">✓</span> {item}
              </div>
            ))}
          </div>
        </div>

        {/* Enquiry form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="font-bold text-lg mb-6">Send Your Enquiry</h2>
          <EnquiryForm />
        </div>
      </div>
    </div>
  )
}
