"use client"

import AdminLayout from "@/components/AdminLayout"
import BlogPostForm from "@/components/blog/BlogPostForm"

export default function NewBlogPostPage() {
  return (
    <AdminLayout>
      <BlogPostForm mode="create" />
    </AdminLayout>
  )
}
