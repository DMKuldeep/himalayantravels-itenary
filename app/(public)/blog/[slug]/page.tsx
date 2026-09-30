import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('blog_posts').select('title,excerpt').eq('slug', slug).single()
  return { title: data?.title || 'Blog', description: data?.excerpt }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).single()
  if (!post) notFound()

  // Increment view count (fire and forget)
  supabase.from('blog_posts').update({ views: (post.views || 0) + 1 }).eq('id', post.id).then(() => {})

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-6">
          <a href="/" className="hover:text-gray-700">Home</a> /
          <a href="/blog" className="hover:text-gray-700">Blog</a> /
          <span className="text-gray-700">{post.title}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(post.tags || []).map((tag: string) => (
            <span key={tag} className="bg-[#e8f4fd] text-[#1a3a5c] text-xs px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
          <span>By {post.author}</span>
          <span>·</span>
          <span>{formatDate(post.created_at)}</span>
          <span>·</span>
          <span>{post.views} views</span>
        </div>

        {/* Cover image */}
        {post.cover_image && (
          <div className="rounded-2xl overflow-hidden mb-8 h-64 bg-gradient-to-br from-[#1a3a5c] to-[#2a5a8c]">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed">
          {post.content ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
          ) : (
            <p className="text-gray-400 italic">Content coming soon...</p>
          )}
        </div>

        {/* Back link */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <a href="/blog" className="btn-outline inline-flex">← Back to Blog</a>
        </div>
      </div>
    </div>
  )
}
