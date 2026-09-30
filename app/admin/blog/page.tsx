export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DeleteBlogBtn from './DeleteBlogBtn'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog Posts · Admin' }

export default async function AdminBlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 text-sm">{posts?.length || 0} posts</p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary">
          <Plus size={16} /> New Post
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Title', 'Author', 'Tags', 'Status', 'Views', 'Date', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(posts || []).map(post => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="font-medium text-sm text-gray-900 max-w-xs truncate">{post.title}</div>
                  <div className="text-xs text-gray-400">/blog/{post.slug}</div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{post.author}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(post.tags || []).slice(0, 2).map((tag: string) => (
                      <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${post.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{post.views}</td>
                <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(post.created_at)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/blog/${post.id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-[#1a3a5c] hover:bg-[#e8f4fd] rounded-lg transition-colors">
                      <Pencil size={15} />
                    </Link>
                    <DeleteBlogBtn id={post.id} title={post.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!posts || posts.length === 0) && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 mb-4">No blog posts yet</p>
            <Link href="/admin/blog/new" className="btn-primary"><Plus size={15} /> Write First Post</Link>
          </div>
        )}
      </div>
    </div>
  )
}
