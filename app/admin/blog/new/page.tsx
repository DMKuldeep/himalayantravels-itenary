import BlogForm from '../BlogForm'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Blog Post · Admin' }

export default function NewBlogPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/admin/blog" className="hover:text-gray-700">Blog</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 font-medium">New Post</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Write New Blog Post</h1>
      <BlogForm mode="new" />
    </div>
  )
}
