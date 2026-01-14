"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { mockListings } from '@/lib/mockData';
import React from 'react';

export default function ListingsPage() {
  const [listings, setListings] = useState<typeof mockListings>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setListings(mockListings);
    setLoading(false);
  }, []);

  if (loading) {
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
        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-lg">
                  <Link href={`/admin/listings/${listing.id}`}>{listing.title}</Link>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {listing.address} • {listing.price} • {listing.status} • Agent: {listing.agent} • Views: {listing.views} • Inquiries: {listing.inquiries}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/listings/${listing.id}/edit`}>Edit</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => alert('Deleted!')}>Delete</Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
} 