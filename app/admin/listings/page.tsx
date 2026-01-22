"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProperties } from '@/services/property/PropertyQueries';

export default function ListingsPage() {
  const page = 1;
  const { data, isLoading, isError, error } = useProperties(page);
  
  // Extract listings (properties) from API response
  const listings = data?.data || data || [];

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
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin">Back</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/listings/create">New Listing</Link>
          </Button>
        </div>
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
    </div>
  );
} 