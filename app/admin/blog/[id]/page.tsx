"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { useSingleBlog } from '@/services/blog/BlogQueris';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBlog } from "@/services/blog/BlogServices";
import { Calendar, User, Tag, FileText, Image as ImageIcon, Star } from 'lucide-react';

export default function BlogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: blogData, isLoading, error } = useSingleBlog({ id: params.id as string });
  
  const blog = blogData?.data || blogData;
  
  const deleteBlogMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: () => {
      alert("Blog deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['bloglist'] });
      router.push("/admin/blog");
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

  // Handle image URL
  const getImageUrl = () => {
    if (!blog?.image) return null;
    
    if (typeof blog.image === 'string') {
      return blog.image.startsWith('http')
        ? blog.image
        : `https://demorealestate2.webnapps.net/storage/${blog.image}`;
    }
    
    if (typeof blog.image === 'object' && blog.image.path) {
      return blog.image.path.startsWith('http')
        ? blog.image.path
        : `https://demorealestate2.webnapps.net/storage/${blog.image.path}`;
    }
    
    return null;
  };

  const imageUrl = getImageUrl();

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Blog Not Found</CardTitle>
            <CardDescription>The blog post you are looking for does not exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/admin/blog">Back to Blog List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {blog.title || "Blog Post"}
          </h1>
          {blog.subtitle && (
            <p className="text-lg italic text-muted-foreground mt-2">
              {blog.subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            {blog.author && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{blog.author}</span>
              </div>
            )}
            {blog.publishDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blog.publishDate).toLocaleDateString()}</span>
              </div>
            )}
            {blog.category && (
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span>{blog.category}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
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
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Image Section - 8 columns */}
        {imageUrl && (
          <Card className="overflow-hidden md:col-span-8 col-span-12">
            <CardContent className="p-0">
              <img
                src={imageUrl}
                alt={blog.title}
                className="w-full h-[400px] object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Details Sidebar - 4 columns */}
        <Card className={imageUrl ? "md:col-span-4 col-span-12" : "md:col-span-12 col-span-12"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <CardTitle>Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status & Featured */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={blog.status === 'published' ? 'default' : 'secondary'}
                  className={blog.status === 'published' ? 'bg-green-500' : ''}
                >
                  {blog.status || 'Draft'}
                </Badge>
                {(blog.is_featured === "1" || blog.is_featured === 1 || blog.is_featured === true) && (
                  <Badge className="bg-yellow-500">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>

            {/* Category */}
            {blog.category && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                <p className="text-sm capitalize">{blog.category}</p>
              </div>
            )}

            {/* Author */}
            {blog.author && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Author</h3>
                <p className="text-sm">{blog.author}</p>
              </div>
            )}

            {/* Publish Date */}
            {blog.publishDate && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Published Date</h3>
                <p className="text-sm">
                  {new Date(blog.publishDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Created At */}
            {blog.created_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                <p className="text-sm">
                  {new Date(blog.created_at).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Blog Content - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <CardTitle>Content</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {blog.content ? (
            <div 
              className="prose prose-sm sm:prose lg:prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }} 
            />
          ) : (
            <p className="text-muted-foreground italic">No content available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}