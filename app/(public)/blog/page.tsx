export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Travel Blog | Tips & Guides' }

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts').select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="pt-24 pb-16">
      <div className="bg-gray-50 py-10 mb-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-semibold text-[#c8922a] uppercase tracking-widest mb-1">Stories & Tips</p>
          <h1 className="text-3xl font-bold text-[#1a1a2e] mb-2">Travel Blog</h1>
          <p className="text-gray-500 text-sm">Guides, tips, and stories from the Himalayas</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {(!posts || posts.length === 0) ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-gray-500">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="card overflow-hidden group">
                <div className="h-48 bg-gradient-to-br from-[#1a3a5c] to-[#2a5a8c] flex items-center justify-center text-5xl">
                  🏔
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(post.tags || []).slice(0, 2).map((tag: string) => (
                      <span key={tag} className="bg-[#e8f4fd] text-[#1a3a5c] text-xs px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                  <h2 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1a3a5c] transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="text-gray-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                    <span>{post.author}</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
