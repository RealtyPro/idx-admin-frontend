"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTestimonials, useDeleteTestimonial } from '@/services/testimonial/TestimonialQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { TestimonialSearchParams } from '@/services/testimonial/TestimonialServices';

export default function TestimonialsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Initialize state from URL params
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  
  // Search filter states (for form inputs - updates on every keystroke)
  const [filters, setFilters] = useState<TestimonialSearchParams>({
    page: pageFromUrl,
    q: searchParams.get('q') || '',
  });
  
  // Active search filters (only updates when search is triggered - prevents API calls on every keystroke)
  const [activeFilters, setActiveFilters] = useState<TestimonialSearchParams>({
    page: pageFromUrl,
    q: searchParams.get('q') || '',
  });
  
  const { data, isLoading, isError, error } = useTestimonials(activeFilters);
  const deleteTestimonialMutation = useDeleteTestimonial();
  
  // Sync filters with URL parameters
  useEffect(() => {
    const newFilters: TestimonialSearchParams = {
      page: parseInt(searchParams.get('page') || '1', 10),
      q: searchParams.get('q') || '',
    };
    setFilters(newFilters);
    setActiveFilters(newFilters); // Also update active filters to trigger API call
    setCurrentPage(newFilters.page || 1);
  }, [searchParams]);
  
  const buildQueryString = (newFilters: TestimonialSearchParams) => {
    const params = new URLSearchParams();
    
    if (newFilters.page) params.append('page', newFilters.page.toString());
    // Only include keyword if it's empty or has at least 3 characters
    if (newFilters.q && newFilters.q.length >= 3) params.append('q', newFilters.q);
    
    return params.toString();
  };
  
  const handleSearch = () => {
    // Validate keyword length
    if (filters.q && filters.q.trim().length > 0 && filters.q.trim().length < 3) {
      setSearchError('Search keyword must be at least 3 characters long');
      setTimeout(() => setSearchError(null), 3000);
      return;
    }
    
    const newFilters = { ...filters, page: 1 }; // Reset to page 1 on new search
    setActiveFilters(newFilters); // Update active filters to trigger API call
    const queryString = buildQueryString(newFilters);
    router.push(`/admin/testimonials?${queryString}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleClearFilters = () => {
    const newFilters: TestimonialSearchParams = { page: 1 };
    setFilters(newFilters);
    setActiveFilters(newFilters);
    router.push('/admin/testimonials?page=1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const hasActiveFilters = !!(filters.q && filters.q.length >= 3);
  const isKeywordValid = !filters.q || filters.q.length === 0 || filters.q.length >= 3;

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
      const newFilters = { ...filters, page };
      const queryString = buildQueryString(newFilters);
      router.push(`/admin/testimonials?${queryString}`, { scroll: false });
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
        queryClient.invalidateQueries({ queryKey: ['testimonials', activeFilters] });
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
          <Button 
            variant={showFilters ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Search" : "Show Search"}
          </Button>
          <Button asChild>
            <Link href="/admin/testimonials/create">Add Testimonial</Link>
          </Button>
        </div>
      </div>
      
      {/* Search Filter */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Testimonials</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* Keyword Search */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Search Keyword</label>
                <Input
                  type="text"
                  placeholder="Search testimonials... (minimum 3 characters)"
                  value={filters.q || ''}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && isKeywordValid && handleSearch()}
                  className={!isKeywordValid ? 'border-red-500' : ''}
                />
                {!isKeywordValid && (
                  <p className="text-xs text-red-500 mt-1">
                    Please enter at least 3 characters to search
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={isLoading || !isKeywordValid}>
                  Search
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters || isLoading}
                >
                  Clear Search
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <span className="flex items-center text-sm text-muted-foreground">
                    Search active: "{filters.q}"
                  </span>
                )}
                {!isKeywordValid && (
                  <span className="flex items-center text-xs text-red-500">
                    ⚠️ Search keyword must be at least 3 characters
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Error Message */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{searchError}</span>
        </div>
      )}
      
      <div className="grid gap-4">
        {Array.isArray(testimonials) && testimonials.length > 0 ? (
          testimonials.map((t: any) => (
            <Card key={t.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    <Link 
                      href={`/admin/testimonials/${t.id}`}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {t.name}
                    </Link>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {t.position && <span>{t.position}</span>}
                    {t.position && (t.date || t.created_at) && <span> • </span>}
                    {(t.date || t.created_at) && <span>{new Date(t.date || t.created_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="default" size="sm">
                    <Link href={`/admin/testimonials/${t.id}`}>View</Link>
                  </Button>
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