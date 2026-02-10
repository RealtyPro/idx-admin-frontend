"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import React, { useState, useEffect, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import SearchFilters from "@/components/SearchFilters";

import { useEnquiries } from '@/services/enquiry/EnquiryQueris';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/services/Api';
import { useRouter, useSearchParams } from 'next/navigation';
import { EnquirySearchParams } from '@/services/enquiry/EnquiryServices';

function InquiriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Initialize state from URL params
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  
  // Search filter states (for form inputs - updates on every keystroke)
  const [filters, setFilters] = useState<EnquirySearchParams>({
    page: pageFromUrl,
    q: searchParams.get('q') || '',
  });
  
  // Active search filters (only updates when search is triggered - prevents API calls on every keystroke)
  const [activeFilters, setActiveFilters] = useState<EnquirySearchParams>({
    page: pageFromUrl,
    q: searchParams.get('q') || '',
  });
  
  const { data, isLoading, isError, error } = useEnquiries(activeFilters);
  
  // Sync filters with URL parameters
  useEffect(() => {
    const newFilters: EnquirySearchParams = {
      page: parseInt(searchParams.get('page') || '1', 10),
      q: searchParams.get('q') || '',
    };
    setFilters(newFilters);
    setActiveFilters(newFilters); // Also update active filters to trigger API call
    setCurrentPage(newFilters.page || 1);
  }, [searchParams]);

  const buildQueryString = (newFilters: EnquirySearchParams) => {
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
    router.push(`/admin/inquiries?${queryString}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleClearFilters = () => {
    const newFilters: EnquirySearchParams = { page: 1 };
    setFilters(newFilters);
    setActiveFilters(newFilters);
    router.push('/admin/inquiries?page=1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKeywordClear = () => {
    const nextFilters = { ...filters, q: "" };
    setFilters(nextFilters);

    if (activeFilters.q && activeFilters.q.length >= 3) {
      const newFilters = { ...nextFilters, page: 1 };
      setActiveFilters(newFilters);
      const queryString = buildQueryString(newFilters);
      router.push(`/admin/inquiries?${queryString}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const hasActiveFilters = !!(filters.q && filters.q.length >= 3);
  const isKeywordValid = !filters.q || filters.q.length === 0 || filters.q.length >= 3;
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`v1/admin/enquiry/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries', activeFilters] });
      setShowDeleteModal(false);
      setDeleteId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-40 rounded" />
          </div>
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
        <p className="text-red-500">Error loading inquiries: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  // Adjust this depending on your API response structure
  const inquiries = data?.data || data || [];

  // Extract pagination metadata from API response
  const pagination = data?.meta || data?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1;
  const currentPageNum = pagination?.current_page || pagination?.currentPage || currentPage;
  const totalItems = pagination?.total || pagination?.totalItems || inquiries.length;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const newFilters = { ...filters, page };
      const queryString = buildQueryString(newFilters);
      router.push(`/admin/inquiries?${queryString}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    // Show pagination if we have pagination data or if there are multiple pages worth of data
    if (totalPages <= 1 && (!pagination || inquiries.length < 10)) return null;

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

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Enquiries</h1>
        <SearchFilters
          className="max-w-lg"
          keyword={filters.q || ""}
          isKeywordValid={isKeywordValid}
          hasActiveFilters={hasActiveFilters}
          isLoading={isLoading}
          onKeywordChange={(value) => setFilters({ ...filters, q: value })}
          onKeywordClear={handleKeywordClear}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          renderFields={() => null}
        />
      </div>
      
      {/* Error Message */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{searchError}</span>
        </div>
      )}
      
      <div className="grid gap-4">
        {Array.isArray(inquiries) && inquiries.length > 0 ? (
          inquiries.map((inquiry: any) => (
            <Card
              key={inquiry.id}
              className="cursor-pointer"
              onClick={() => router.push(`/admin/inquiries/${inquiry.id}`)}
            >
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    <Link 
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {inquiry.name || inquiry.full_name || 'No Name'}
                    </Link>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {inquiry.email}
                    {(inquiry.date || inquiry.created_at) && <span> • {new Date(inquiry.date || inquiry.created_at).toLocaleDateString()}</span>}
                    {(inquiry.listingId || inquiry.listing_id) && <span> • Listing: {inquiry.listingId || inquiry.listing_id}</span>}
                  </div>
                  {inquiry.message && (
                    <div className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {inquiry.message}
                    </div>
                  )}
                </div>
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/inquiries/${inquiry.id}`}>View</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      setDeleteId(inquiry.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    {deleteMutation.isPending && deleteId === inquiry.id ? 'Deleting...' : 'Delete'}
                  </Button>
                      {/* Delete Confirmation Modal */}
                      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Enquiry</DialogTitle>
                          </DialogHeader>
                          <div>Are you sure you want to delete this enquiry?</div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteMutation.isPending}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No Enquiries found.</p>
        )}
      </div>
      {renderPagination()}
    </div>
  );
}

export default function InquiriesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    }>
      <InquiriesContent />
    </Suspense>
  );
} 