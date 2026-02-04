
"use client";
import React, { useState, useEffect } from 'react';
import { useNewsletterSubscribers, useDeleteNewsletterSubscriber } from '@/services/newsletter/NewsletterQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { NewsletterSearchParams } from '@/services/newsletter/NewsletterServices';

export default function NewsletterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Initialize state from URL params
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  
  // Search filter states (for form inputs - updates on every keystroke)
  const [filters, setFilters] = useState<NewsletterSearchParams>({
    page: pageFromUrl,
    q: searchParams.get('q') || '',
  });
  
  // Active search filters (only updates when search is triggered - prevents API calls on every keystroke)
  const [activeFilters, setActiveFilters] = useState<NewsletterSearchParams>({
    page: pageFromUrl,
    q: searchParams.get('q') || '',
  });

  const { data, isLoading, isError, error } = useNewsletterSubscribers(activeFilters);
  const subscribers = data?.data || data || [];
  
  // Sync filters with URL parameters
  useEffect(() => {
    const newFilters: NewsletterSearchParams = {
      page: parseInt(searchParams.get('page') || '1', 10),
      q: searchParams.get('q') || '',
    };
    setFilters(newFilters);
    setActiveFilters(newFilters); // Also update active filters to trigger API call
    setCurrentPage(newFilters.page || 1);
  }, [searchParams]);
  
  const buildQueryString = (newFilters: NewsletterSearchParams) => {
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
    router.push(`/admin/newsletter?${queryString}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleClearFilters = () => {
    const newFilters: NewsletterSearchParams = { page: 1 };
    setFilters(newFilters);
    setActiveFilters(newFilters);
    router.push('/admin/newsletter?page=1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const hasActiveFilters = !!(filters.q && filters.q.length >= 3);
  const isKeywordValid = !filters.q || filters.q.length === 0 || filters.q.length >= 3;

  // Extract pagination metadata from API response
  const pagination = data?.meta || data?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1;
  const currentPageNum = pagination?.current_page || pagination?.currentPage || currentPage;
  const totalItems = pagination?.total || pagination?.totalItems || subscribers.length;

  const deleteMutation = useDeleteNewsletterSubscriber();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const newFilters = { ...filters, page };
      const queryString = buildQueryString(newFilters);
      router.push(`/admin/newsletter?${queryString}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    // Show pagination if we have pagination data or if there are multiple pages worth of data
    if (totalPages <= 1 && (!pagination || subscribers.length < 10)) return null;

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
                variant={1 === currentPageNum ? 'default' : 'outline'}
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
              variant={page === currentPageNum ? 'default' : 'outline'}
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
                variant={totalPages === currentPageNum ? 'default' : 'outline'}
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
        <p className="text-red-500">
          Error loading newsletter subscribers:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Newsletter</h1>
        <Button 
          variant={showFilters ? "default" : "outline"} 
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide Search" : "Show Search"}
        </Button>
      </div>
      
      {/* Search Filter */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Newsletter Subscribers</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* Keyword Search */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Search Keyword</label>
                <Input
                  type="text"
                  placeholder="Search subscribers... (minimum 3 characters)"
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
        {Array.isArray(subscribers) && subscribers.length > 0 ? (
          subscribers.map((subscriber: any) => (
            <Card key={subscriber.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    <Link href={`/admin/newsletter/${subscriber.id}`}>
                      {subscriber.name || subscriber.email || 'No Name'}
                    </Link>
                  </CardTitle>
                  <div className="text-sm text-dark mt-2">{subscriber.created_at}</div>
                </div>
                <div className="flex gap-2">
                
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      setDeleteId(subscriber.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    {deleteMutation.isPending && deleteId === subscriber.id
                      ? 'Deleting...'
                      : 'Delete'}
                  </Button>
                  {/* Delete Confirmation Modal */}
                  <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Subscriber</DialogTitle>
                      </DialogHeader>
                      <div>Are you sure you want to delete this subscriber?</div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteModal(false)}
                          disabled={deleteMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            deleteId &&
                            deleteMutation.mutate(deleteId, {
                              onSuccess: () => {
                                setShowDeleteModal(false);
                                setDeleteId(null);
                                queryClient.invalidateQueries({
                                  queryKey: ['newsletter-subscribers', activeFilters],
                                });
                              },
                            })
                          }
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
          <p className="text-center text-muted-foreground">No subscribers found.</p>
        )}
      </div>
      {renderPagination()}
    </div>
  );
}