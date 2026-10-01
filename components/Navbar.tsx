'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import { companyContact } from '@/lib/company'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'Tour Packages', href: '/packages',
    children: [
      { label: 'Honeymoon Tours', href: '/packages?type=honeymoon' },
      { label: 'Family Vacations', href: '/packages?type=family' },
      { label: 'Adventure Tours', href: '/packages?type=adventure' },
      { label: 'Pilgrimage Tours', href: '/packages?type=pilgrimage' },
      { label: 'Group Tours', href: '/packages?type=group' },
      { label: 'Weekend Getaways', href: '/packages?type=weekend' },
    ],
  },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Blog', href: '/blog' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdown, setDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const isHome = pathname === '/'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || !isHome ? 'bg-[#1a3a5c] shadow-lg' : 'bg-transparent'
    }`}>
      {/* Top bar */}
      <div className="bg-[#0d2137] py-1.5 px-4 hidden md:flex justify-between items-center text-xs text-white/60">
        <span>✦ Trusted Travel Partner Since 2010 | IATA Registered</span>
        <a href={companyContact.phoneHref} className="flex items-center gap-1 hover:text-white transition-colors">
          <Phone size={11} /> {companyContact.phone}
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Himalayan <span className="text-[#c8922a]">Travels</span>
          </span>
          <span className="text-white/50 text-[10px] tracking-widest uppercase hidden md:block">Experience the mountains</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="relative"
              onMouseEnter={() => link.children && setDropdown(link.label)}
              onMouseLeave={() => setDropdown(null)}>
              <Link
                href={link.href}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                  pathname === link.href
                    ? 'text-[#c8922a] font-medium'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
                {link.children && <ChevronDown size={13} />}
              </Link>
              {link.children && dropdown === link.label && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {link.children.map((child) => (
                    <Link key={child.href} href={child.href}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#e8f4fd] hover:text-[#1a3a5c] transition-colors">
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/enquiry"
            className="bg-[#c8922a] text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-[#b07820] transition-colors">
            Book Now
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="lg:hidden text-white p-1">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#0d2137] border-t border-white/10 px-4 pb-4">
          {NAV_LINKS.map((link) => (
            <div key={link.href}>
              <Link href={link.href} onClick={() => setOpen(false)}
                className="block py-3 text-white/85 border-b border-white/10 text-sm hover:text-[#c8922a]">
                {link.label}
              </Link>
              {link.children && link.children.map((child) => (
                <Link key={child.href} href={child.href} onClick={() => setOpen(false)}
                  className="block py-2 pl-4 text-white/50 text-xs hover:text-white">
                  — {child.label}
                </Link>
              ))}
            </div>
          ))}
          <Link href="/enquiry" onClick={() => setOpen(false)}
            className="mt-4 block w-full text-center bg-[#c8922a] text-white py-3 rounded-lg font-medium text-sm">
            Book Now
          </Link>
        </div>
      )}
    </nav>
  )
}
