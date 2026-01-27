"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProperties } from '@/services/property/PropertyQueries';

export default function ListingsPage() {
  const [currentPage, setCurrentPage] = useState(1);
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
                    {listing.address && <span>{listing.address}</span>}
                    {listing.address && listing.price && <span> • </span>}
                    {listing.price && <span>{listing.price}</span>}
                    {listing.status && (listing.address || listing.price) && <span> • </span>}
                    {listing.status && <span>{listing.status}</span>}
                    {listing.agent && (listing.address || listing.price || listing.status) && <span> • </span>}
                    {listing.agent && <span>Agent: {listing.agent}</span>}
                    {listing.views !== undefined && (listing.address || listing.price || listing.status || listing.agent) && <span> • </span>}
                    {listing.views !== undefined && <span>Views: {listing.views}</span>}
                    {listing.inquiries !== undefined && (listing.address || listing.price || listing.status || listing.agent || listing.views !== undefined) && <span> • </span>}
                    {listing.inquiries !== undefined && <span>Inquiries: {listing.inquiries}</span>}
                    {listing.created_at && !listing.status && !listing.agent && listing.views === undefined && listing.inquiries === undefined && (listing.address || listing.price) && <span> • </span>}
                    {listing.created_at && !listing.status && !listing.agent && listing.views === undefined && listing.inquiries === undefined && <span>{listing.created_at}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/listings/${listing.id}`}>View</Link>
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