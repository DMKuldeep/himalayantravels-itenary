'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, MapPin, MessageSquare, FileText, Settings, LogOut, ChevronLeft, ChevronRight, Mountain } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Packages', href: '/admin/packages', icon: Package },
  { label: 'Destinations', href: '/admin/destinations', icon: MapPin },
  { label: 'Enquiries', href: '/admin/enquiries', icon: MessageSquare },
  { label: 'Blog Posts', href: '/admin/blog', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

interface Props {
  user: { email?: string }
  admin: { full_name?: string; role?: string }
}

export default function AdminSidebar({ user, admin }: Props) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className={`relative flex flex-col bg-[#0d1f30] transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#c8922a] rounded-lg flex items-center justify-center shrink-0">
            <Mountain size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-white text-sm font-semibold leading-tight">Himalayan Travels</div>
              <div className="text-white/40 text-[10px]">Admin Panel</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active ? 'bg-[#c8922a] text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={collapsed ? label : undefined}>
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-white/10">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <div className="text-white text-xs font-medium truncate">{admin.full_name || user.email}</div>
            <div className="text-white/40 text-[10px] capitalize">{admin.role || 'admin'}</div>
          </div>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 w-full text-sm transition-colors">
          <LogOut size={16} className="shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#0d1f30] border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white">
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
