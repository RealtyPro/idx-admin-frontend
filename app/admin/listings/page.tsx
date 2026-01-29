"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProperties } from '@/services/property/PropertyQueries';
import { useQueryClient } from '@tanstack/react-query';

export default function ListingsPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [featuringListingId, setFeaturingListingId] = useState<string | null>(null);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [featuredSuccess, setFeaturedSuccess] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useProperties(currentPage);
  
  // Extract listings (properties) from API response
  const listings = data?.data || data || [];
  
  // Extract pagination metadata from API response
  const pagination = data?.meta || data?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1;
  const currentPageNum = pagination?.current_page || pagination?.currentPage || currentPage;
  const totalItems = pagination?.total || pagination?.totalItems || listings.length;
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
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
      await queryClient.invalidateQueries({ queryKey: ['properties', currentPage] });

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
      </div>
      
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
                    <Link href={`/admin/listings/${listing.id}`}>
                      {listing.title || listing.name || listing.address || `Listing ${listing.id}`}
                    </Link>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {/* {listing.address && <span>{listing.address}</span>} */}
                    {/* {listing.price && <span> • </span>} */}
                    {listing.price && <span>{listing.price}</span>}
                    {listing.status && (listing.address || listing.price) && <span> • </span>}
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
                    <Link href={`/admin/listings/${listing.id}`}>View</Link>
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