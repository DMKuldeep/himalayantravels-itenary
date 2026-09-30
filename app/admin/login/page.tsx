'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Mountain, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    setLoading(false)
    if (error) { toast.error('Invalid email or password'); return }
    toast.success('Welcome back!')
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d2137] to-[#1a3a5c] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#c8922a] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mountain size={30} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Himalayan Travels
          </h1>
          <p className="text-white/50 text-sm mt-1">Admin Panel</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="font-bold text-xl text-gray-900 mb-6">Sign in to continue</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@thehimalayantravels.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  className="form-input pr-10"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a3a5c] text-white py-3 rounded-xl font-medium hover:bg-[#0d2137] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Secure admin access only. Contact your developer to reset credentials.
            </p>
          </div>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-white/40 text-xs hover:text-white/70 transition-colors">← Back to website</a>
        </p>
      </div>
    </div>
  )
}
