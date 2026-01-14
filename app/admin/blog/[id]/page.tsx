"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { mockBlogs } from '@/lib/mockData';
import React from 'react';

export default function BlogDetailsPage() {
  const [blog, setBlog] = useState<typeof mockBlogs[0] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  useEffect(() => {
    setBlog(mockBlogs.find((b) => b.id === params.id));
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Blog Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">The blog post you are looking for does not exist.</div>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin/blog">Back to Blog List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl">{blog.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              By {blog.author} on {blog.date}
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/blog/${blog.id}/edit`}>Edit</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/blog">Back</Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => alert('Deleted!')}>Delete</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="prose max-w-none">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={blog.category || ""}
                onChange={(e) => alert(`Selected category: ${e.target.value}`)} // Replace with actual logic if needed
                className="block w-full text-sm border-gray-300 rounded-md"
                disabled
              >
                <option value="blog">Blog</option>
                <option value="news">News</option>
                <option value="articles">Articles</option>
              </select>
            </div>
            <div className="mt-4">{blog.content}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}