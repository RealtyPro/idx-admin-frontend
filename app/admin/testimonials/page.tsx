"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTestimonials, useDeleteTestimonial } from '@/services/testimonial/TestimonialQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
export default function TestimonialsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useTestimonials(currentPage);
  const deleteTestimonialMutation = useDeleteTestimonial();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40 mb-4" />
          <Skeleton className="h-10 w-24 rounded" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4">
        <p className="text-red-500">Error loading testimonials: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  // Adjust this depending on your API response structure
  const testimonials = data?.data || data || [];
  
  // Extract pagination metadata from API response
  const pagination = data?.meta || data?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1;
  const currentPageNum = pagination?.current_page || pagination?.currentPage || currentPage;
  const totalItems = pagination?.total || pagination?.totalItems || testimonials.length;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    // Show pagination if we have pagination data or if there are multiple pages worth of data
    if (totalPages <= 1 && (!pagination || testimonials.length < 10)) return null;
    
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
      <div className="flex flex-col items-center justify-center gap-4 mt-6">
        <div className="flex items-center justify-center gap-2">
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
                disabled={isLoading}
              >
                1
              </Button>
              {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
            </>
          )}
          
          {pages.map((page) => (
            <Button
              key={page}
              variant={page === currentPageNum ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              disabled={isLoading}
            >
              {page}
            </Button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
              <Button
                variant={totalPages === currentPageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={isLoading}
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
        {pagination && (
          <div className="text-sm text-muted-foreground">
            Page {currentPageNum} of {totalPages} {totalItems && `(${totalItems} total items)`}
          </div>
        )}
      </div>
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    setDeletingId(id);
        deleteTestimonialMutation.mutate(id, {
      onSuccess: () => {
        // Refresh list after delete
        queryClient.invalidateQueries({ queryKey: ['testimonials', currentPage] });
        setDeletingId(null);
      },
      onError: (err: any) => {
        console.error('Error deleting testimonial:', err);
        alert(err?.response?.data?.message || err?.message || 'Failed to delete testimonial');
        setDeletingId(null);
      },
    });
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/testimonials/create">Add Testimonial</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {Array.isArray(testimonials) && testimonials.length > 0 ? (
          testimonials.map((t: any) => (
            <Card key={t.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    <Link href={`/admin/testimonials/${t.id}`}>{t.name}</Link>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {t.date || t.created_at}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/testimonials/${t.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id && deleteTestimonialMutation.isPending}
                  >
                    {deletingId === t.id && deleteTestimonialMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No testimonials found.</p>
        )}
      </div>
      {renderPagination()}
    </div>
  );
} 