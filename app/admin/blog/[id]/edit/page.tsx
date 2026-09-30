import { createClient } from '@/lib/supabase/server'
import BlogForm from '../../BlogForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: 'Edit Blog Post · Admin' }

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase.from('blog_posts').select('*').eq('id', id).single()
  if (!post) notFound()

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/admin/blog" className="hover:text-gray-700">Blog</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 font-medium">Edit Post</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Blog Post</h1>
      <BlogForm mode="edit" initialData={post} />
    </div>
  )
}
