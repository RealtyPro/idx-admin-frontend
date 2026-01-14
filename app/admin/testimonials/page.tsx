"use client";
import React from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTestimonials } from '@/services/testimonial/TestimonialQueries';
import { Skeleton } from '@/components/ui/skeleton';
export default function TestimonialsListPage() {
  const page = 1;
  const { data, isLoading, isError, error } = useTestimonials(page);

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

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin">Back</Link>
          </Button>
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
                  <Button variant="destructive" size="sm" onClick={() => alert('Deleted!')}>Delete</Button>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No testimonials found.</p>
        )}
      </div>
    </div>
  );
} 