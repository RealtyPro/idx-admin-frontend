"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { mockBlogs } from '@/lib/mockData';
import React from 'react';
import { useBlogList } from "@/services/blog/BlogQueris";
import {  useMutation } from "@tanstack/react-query";
import { useQueryClient } from '@tanstack/react-query';
import { deleteBlog } from "@/services/blog/BlogServices";
interface Blog {
  id: string;
  title: string;
  author: string;
  publishDate: string;
  category: string;
  isFeatured: boolean;
  subtitle: string;
  status: string;
  content: string;
}
export default function BlogListPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: blogListDatas, isLoading, error} = useBlogList(currentPage);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const queryClient = useQueryClient();
  
  // Extract pagination metadata from API response
  const pagination = blogListDatas?.meta || blogListDatas?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || 1;
  const currentPageNum = pagination?.current_page || currentPage;
  const removeBlogMutation = useMutation({
    mutationFn: (id:string) => deleteBlog(id),

    onSuccess: (data) => {
      console.log("blog deleted successfully:", data);
      alert("Blog deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['bloglist', currentPage] });
    },
    onError: (error) => {
      console.error("Error  while loggin:", error);
    },
  });
  useEffect(()=>{
    if(blogListDatas && !isLoading && !error) {
     // setBlogs(blogListDatas);
     setBlogs(blogListDatas.data || blogListDatas)
     console.log("blogListDatas",blogListDatas);
    }
    console.log("blogListDatas",blogListDatas);
  },[blogListDatas,isLoading,error])
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPageNum - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPageNum - 1)}
          disabled={currentPageNum === 1 || isLoading}
        >
          Previous
        </Button>
        
        {startPage > 1 && (
          <>
            <Button
              variant={1 === currentPageNum ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(1)}
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPageNum ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button
              variant={totalPages === currentPageNum ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPageNum + 1)}
          disabled={currentPageNum === totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="contain-auto py-6 px-2 sm:px-4 spx-w-2xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-6">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }
const handleDelete =(id:string)=>{
  removeBlogMutation.mutate(id);
}
  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin">Back</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/blog/create">New Blog Post</Link>
          </Button>
        </div>
      </div>
      {blogs.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No blog posts found.</div>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => (
            <Card key={blog.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    <Link href={`/admin/blog/${blog.id}`}>{blog.title}</Link>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {blog.subtitle && <div className="italic mb-1">{blog.subtitle}</div>}
                    <span>By {blog.author}</span>
                    <span className="mx-2">|</span>
                    <span>Category: {blog.category}</span>
                    <span className="mx-2">|</span>
                    <span>Status: {blog.status}</span>
                    {blog.isFeatured && <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">Featured</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/blog/${blog.id}/edit`}>Edit</Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(blog.id)}>Delete</Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
      {renderPagination()}
    </div>
  );
} 