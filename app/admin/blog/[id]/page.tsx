"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { Label } from "@/components/ui/label";
import { useSingleBlog } from '@/services/blog/BlogQueris';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBlog } from "@/services/blog/BlogServices";

export default function BlogDetailsPage() {
  const params = useParams();
  const { data: blogData, isLoading, error } = useSingleBlog({ id: params.id as string });
  const queryClient = useQueryClient();
  
  const blog = blogData?.data || blogData;
  
  const deleteBlogMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: () => {
      alert("Blog deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['bloglist'] });
      window.location.href = "/admin/blog";
    },
    onError: (error: any) => {
      console.error("Error while deleting blog:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete blog post. Please try again.";
      alert(errorMessage);
    },
  });
  
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      deleteBlogMutation.mutate(params.id as string);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !blog) {
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
              By {blog.author || 'Unknown'}
              {blog.publishDate && <span> on {new Date(blog.publishDate).toLocaleDateString()}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/blog/${params.id}/edit`}>Edit</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/blog">Back</Link>
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              disabled={deleteBlogMutation.isPending}
            >
              {deleteBlogMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="prose max-w-none">
            {blog.subtitle && (
              <div className="text-lg italic text-muted-foreground mb-4">
                {blog.subtitle}
              </div>
            )}
            <div className="mb-4">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={blog.category || ""}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm mt-1"
                disabled
              >
                <option value="blog">Blog</option>
                <option value="news">News</option>
                <option value="articles">Articles</option>
              </select>
            </div>
            {blog.status && (
              <div className="mb-4">
                <Label>Status</Label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    blog.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {blog.status}
                  </span>
                  {blog.is_featured === "1" || blog.is_featured === 1 || blog.is_featured === true ? (
                    <span className="ml-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">
                      Featured
                    </span>
                  ) : null}
                </div>
              </div>
            )}
            {blog.image && (
              <div className="mb-4">
                <img 
                  src={typeof blog.image === 'string' 
                    ? blog.image 
                    : blog.image.path?.startsWith('http') 
                      ? blog.image.path 
                      : `https://demorealestate2.webnapps.net/storage/${blog.image.path}`
                  } 
                  alt={blog.title} 
                  className="w-full rounded-lg max-h-96 object-cover"
                />
              </div>
            )}
            <div className="mt-4" dangerouslySetInnerHTML={{ __html: blog.content || '' }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}