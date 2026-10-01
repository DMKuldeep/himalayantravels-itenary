import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { companyContact } from '@/lib/company'

export default function Footer() {
  return (
    <footer className="bg-[#0d1f30] text-white">
      <div className="max-w-7xl mx-auto px-4 pt-14 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Himalayan <span className="text-[#c8922a]">Travels</span>
            </h3>
            <p className="text-white/50 text-xs mb-4">Your trusted Himalayan travel partner since 2010</p>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              IATA registered tour operator specializing in Himachal Pradesh, Uttarakhand & Ladakh. 5000+ happy travellers, 120+ curated packages.
            </p>
            <div className="flex gap-3">
              {['Facebook', 'Instagram', 'YouTube', 'WhatsApp'].map((s) => (
                <a key={s} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs hover:bg-[#c8922a] transition-colors">
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Packages */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Tour Packages</h4>
            <ul className="space-y-2.5">
              {[
                ['Honeymoon Tours', '/packages?type=honeymoon'],
                ['Family Vacations', '/packages?type=family'],
                ['Adventure Tours', '/packages?type=adventure'],
                ['Pilgrimage Tours', '/packages?type=pilgrimage'],
                ['Group Tours', '/packages?type=group'],
                ['Weekend Getaways', '/packages?type=weekend'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-white/55 text-sm hover:text-[#c8922a] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Destinations</h4>
            <ul className="space-y-2.5">
              {[
                ['Leh Ladakh', '/destinations/leh-ladakh'],
                ['Manali & Shimla', '/destinations/manali'],
                ['Spiti Valley', '/destinations/spiti-valley'],
                ['Kedarnath', '/destinations/kedarnath'],
                ['Rishikesh', '/destinations/rishikesh'],
                ['Kasol & Kheerganga', '/destinations/kasol'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-white/55 text-sm hover:text-[#c8922a] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <Phone size={15} className="text-[#c8922a] mt-0.5 shrink-0" />
                <div>
                  <a href={companyContact.phoneHref} className="text-white/70 text-sm hover:text-white block">{companyContact.phone}</a>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail size={15} className="text-[#c8922a] mt-0.5 shrink-0" />
                <a href={`mailto:${companyContact.email}`} className="text-white/70 text-sm hover:text-white">{companyContact.email}</a>
              </li>
              <li className="flex gap-3">
                <MapPin size={15} className="text-[#c8922a] mt-0.5 shrink-0" />
                <span className="text-white/70 text-sm">{companyContact.address}</span>
              </li>
            </ul>
            <a href={companyContact.whatsappHref}
              className="mt-5 inline-flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors w-full justify-center font-medium">
              <MessageCircle size={15} /> Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-white/40 text-xs">© 2025 The Himalayan Travels · All Rights Reserved</p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms & Conditions', 'Refund Policy', 'Sitemap'].map((item) => (
              <Link key={item} href="#" className="text-white/40 text-xs hover:text-white/70">{item}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
