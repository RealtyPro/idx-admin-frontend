"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProperties } from '@/services/property/PropertyQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertySearchParams } from '@/services/property/PropertyServices';

function ListingsContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [featuringListingId, setFeaturingListingId] = useState<string | null>(null);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [featuredSuccess, setFeaturedSuccess] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search filter states (for form inputs - updates on every keystroke)
  const [filters, setFilters] = useState<PropertySearchParams>({
    page: pageFromUrl,
    bath_min: searchParams.get('bath_min') || '',
    bath_max: searchParams.get('bath_max') || '',
    bed_min: searchParams.get('bed_min') || '',
    bed_max: searchParams.get('bed_max') || '',
    keyword: searchParams.get('keyword') || '',
  });
  
  // Active search filters (only updates when search is triggered - prevents API calls on every keystroke)
  const [activeFilters, setActiveFilters] = useState<PropertySearchParams>({
    page: pageFromUrl,
    bath_min: searchParams.get('bath_min') || '',
    bath_max: searchParams.get('bath_max') || '',
    bed_min: searchParams.get('bed_min') || '',
    bed_max: searchParams.get('bed_max') || '',
    keyword: searchParams.get('keyword') || '',
  });
  
  // Fetch properties with active filters (not form filters)
  const { data, isLoading, isError, error } = useProperties(activeFilters);
  
  // Sync filters with URL parameters
  useEffect(() => {
    const newFilters: PropertySearchParams = {
      page: parseInt(searchParams.get('page') || '1', 10),
      bath_min: searchParams.get('bath_min') || '',
      bath_max: searchParams.get('bath_max') || '',
      bed_min: searchParams.get('bed_min') || '',
      bed_max: searchParams.get('bed_max') || '',
      keyword: searchParams.get('keyword') || '',
    };
    setFilters(newFilters);
    setActiveFilters(newFilters); // Also update active filters to trigger API call
    setCurrentPage(newFilters.page || 1);
  }, [searchParams]); // Only watch keyword to avoid loops
  
  // Extract listings (properties) from API response
  const listings = data?.data || data || [];
  
  // Extract pagination metadata from API response
  const pagination = data?.meta || data?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1;
  const currentPageNum = pagination?.current_page || pagination?.currentPage || currentPage;
  const totalItems = pagination?.total || pagination?.totalItems || listings.length;
  
  const buildQueryString = (newFilters: PropertySearchParams) => {
    const params = new URLSearchParams();
    
    if (newFilters.page) params.append('page', newFilters.page.toString());
    if (newFilters.bath_min) params.append('bath_min', newFilters.bath_min);
    if (newFilters.bath_max) params.append('bath_max', newFilters.bath_max);
    if (newFilters.bed_min) params.append('bed_min', newFilters.bed_min);
    if (newFilters.bed_max) params.append('bed_max', newFilters.bed_max);
    // Only include keyword if it's empty or has at least 3 characters
    if (newFilters.keyword && newFilters.keyword.length >= 3) params.append('keyword', newFilters.keyword);
    
    return params.toString();
  };
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const newFilters = { ...filters, page };
      const queryString = buildQueryString(newFilters);
      router.push(`/admin/listings?${queryString}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleSearch = () => {
    // Validate keyword length
    if (filters.keyword && filters.keyword.trim().length > 0 && filters.keyword.trim().length < 3) {
      setFeaturedError('Keyword must be at least 3 characters long');
      setTimeout(() => setFeaturedError(null), 3000);
      return;
    }
    
    const newFilters = { ...filters, page: 1 }; // Reset to page 1 on new search
    setActiveFilters(newFilters); // Update active filters to trigger API call
    const queryString = buildQueryString(newFilters);
    router.push(`/admin/listings?${queryString}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleClearFilters = () => {
    const newFilters: PropertySearchParams = { page: 1 };
    setFilters(newFilters);
    router.push('/admin/listings?page=1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const hasActiveFilters = !!(filters.bath_min || filters.bath_max || filters.bed_min || filters.bed_max || (filters.keyword && filters.keyword.length >= 3));
  const isKeywordValid = !filters.keyword || filters.keyword.length === 0 || filters.keyword.length >= 3;
  
  const handleSetAsFeatured = async (listingId: string) => {
    try {
      setFeaturingListingId(listingId);
      setFeaturedError(null);
      setFeaturedSuccess(null);
      
      // Get access token from sessionStorage
      const token = sessionStorage.getItem('access_token');
      
      if (!token) {
        setFeaturedError('Authentication required. Please login again.');
        setFeaturingListingId(null);
        return;
      }

      const response = await fetch(
        `https://demorealestate2.webnapps.net/api/v1/admin/property/action/${listingId}/feature`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to set property as featured');
      }
      await queryClient.invalidateQueries({ queryKey: ['properties', activeFilters] });

      setFeaturedSuccess(`Property successfully set as featured!`);
      
      // Refetch the properties list to update the UI
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setFeaturedSuccess(null);
      }, 3000)
      
    } catch (error) {
      console.error('Error setting property as featured:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to set property as featured';
      setFeaturedError(errorMessage);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setFeaturedError(null);
      }, 5000);
    } finally {
      setFeaturingListingId(null);
    }
  };
  
  const renderPagination = () => {
    // Show pagination if we have pagination data or if there are multiple pages worth of data
    // Also show if we have listings and might have more pages
    if (totalPages <= 1 && (!pagination || listings.length < 10)) return null;
    
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
            <div key={i} className="mb-6">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4">
        <p className="text-red-500">Error loading listings: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Listings</h1>
        <Button 
          variant={showFilters ? "default" : "outline"} 
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>
      
      {/* Search Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Filters</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Keyword */}
              <div className="lg:col-span-3">
                <label className="text-sm font-medium mb-1.5 block">Keyword</label>
                <Input
                  type="text"
                  placeholder="Search by keyword... (minimum 3 characters)"
                  value={filters.keyword || ''}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && isKeywordValid && handleSearch()}
                  className={!isKeywordValid ? 'border-red-500' : ''}
                />
                {!isKeywordValid && (
                  <p className="text-xs text-red-500 mt-1">
                    Please enter at least 3 characters to search
                  </p>
                )}
              </div>
              
              {/* Bedrooms */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Min Bedrooms</label>
                <Input
                  type="number"
                  placeholder="Min beds"
                  value={filters.bed_min || ''}
                  onChange={(e) => setFilters({ ...filters, bed_min: e.target.value })}
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Max Bedrooms</label>
                <Input
                  type="number"
                  placeholder="Max beds"
                  value={filters.bed_max || ''}
                  onChange={(e) => setFilters({ ...filters, bed_max: e.target.value })}
                  min="0"
                />
              </div>
              
              {/* Bathrooms */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Min Bathrooms</label>
                <Input
                  type="number"
                  placeholder="Min baths"
                  value={filters.bath_min || ''}
                  onChange={(e) => setFilters({ ...filters, bath_min: e.target.value })}
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Max Bathrooms</label>
                <Input
                  type="number"
                  placeholder="Max baths"
                  value={filters.bath_max || ''}
                  onChange={(e) => setFilters({ ...filters, bath_max: e.target.value })}
                  min="0"
                />
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
                  Clear Filters
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <span className="flex items-center text-sm text-muted-foreground">
                    Active filters applied
                  </span>
                )}
                {!isKeywordValid && (
                  <span className="flex items-center text-xs text-red-500">
                    ⚠️ Keyword must be at least 3 characters
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Success/Error Messages */}
      {featuredSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{featuredSuccess}</span>
        </div>
      )}
      
      {featuredError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{featuredError}</span>
        </div>
      )}
      
      <div className="grid gap-4">
        {Array.isArray(listings) && listings.length > 0 ? (
          listings.map((listing: any) => (
            <Card key={listing.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    <Link href={`/admin/listings/${listing.id}?from_page=${currentPage}`}>
                      {listing.title || listing.name || listing.address || `Listing ${listing.id}`}
                    </Link>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {/* {listing.address && <span>{listing.address}</span>} */}
                    {/* {listing.price && <span> • </span>} */}
                    {listing.price && <span>{listing.price}</span>}
                    {(listing.beds || listing.baths) && (listing.price) && <span> • </span>}
                    {listing.beds !== undefined && listing.beds !== null && (
                      <span className="inline-flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {listing.beds} Bed{listing.beds !== 1 ? 's' : ''}
                      </span>
                    )}
                    {listing.beds !== undefined && listing.beds !== null && listing.baths !== undefined && listing.baths !== null && <span> • </span>}
                    {listing.baths !== undefined && listing.baths !== null && (
                      <span className="inline-flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        {listing.baths} Bath{listing.baths !== 1 ? 's' : ''}
                      </span>
                    )}
                    {listing.status && (listing.address || listing.price || listing.beds || listing.baths) && <span> • </span>}
                    {listing.status && <span>{listing.status}</span>}
                    {listing.agent && (listing.address || listing.price || listing.status) && <span> • </span>}
                    {listing.agent && <span>Agent: {listing.agent}</span>}
                    {listing.views !== "null" && listing.views !== undefined && (listing.address || listing.price || listing.status || listing.agent) && <span> • </span>}
                    {listing.views !== "null" && listing.views !== undefined && <span>Views: {(() => {
                      try {
                        // Check if it's a stringified JSON array
                        if (typeof listing.views === 'string' && listing.views.startsWith('[')) {
                          const parsed = JSON.parse(listing.views);
                          return Array.isArray(parsed) ? parsed.join(', ') : listing.views;
                        }
                        // If it's already an array
                        return Array.isArray(listing.views) ? listing.views.join(', ') : listing.views;
                      } catch (e) {
                        return listing.views;
                      }
                    })()}</span>}
                    {listing.inquiries !== undefined && (listing.address || listing.price || listing.status || listing.agent || listing.views !== undefined) && <span> • </span>}
                    {listing.inquiries !== undefined && <span>Inquiries: {listing.inquiries}</span>}
                    {listing.created_at && !listing.status && !listing.agent && listing.views === undefined && listing.inquiries === undefined && (listing.address || listing.price) && <span> • </span>}
                    {listing.created_at && !listing.status && !listing.agent && listing.views === undefined && listing.inquiries === undefined && <span>{listing.created_at}</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-auto">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/listings/${listing.id}?from_page=${currentPage}`}>View</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSetAsFeatured(listing.id)}
                    disabled={listing.is_featured == 1 || featuringListingId === listing.id || isLoading}
                  >
                    {featuringListingId === listing.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Setting...
                      </>
                    ) : (

                      listing.is_featured == 1 ? 'Featured' : 'Set as Featured'
                    )}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No listings found.</p>
        )}
      </div>
      {renderPagination()}
    </div>
  );
}

export default function ListingsPage() {
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
      <ListingsContent />
    </Suspense>
  );
} 