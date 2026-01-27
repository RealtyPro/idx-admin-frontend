"use client";
import React from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from 'next/navigation';
import { useSingleTestimonial, useDeleteTestimonial } from '@/services/testimonial/TestimonialQueries';
import { Skeleton } from '@/components/ui/skeleton';
export default function TestimonialsDetailPage  (){
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const { data, isLoading, isError } = useSingleTestimonial(id);
  const testimonial = data?.data || data;
  const deleteTestimonialMutation = useDeleteTestimonial();

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !testimonial) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Testimonial Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">The testimonial you are looking for does not exist.</div>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin/testimonials">Back to Testimonials</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl">{testimonial.name}</CardTitle>
            <div className="text-sm text-muted-foreground">{testimonial.date || testimonial.created_at}</div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/testimonials/${testimonial.id}/edit`}>Edit</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/testimonials">Back</Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (!confirm('Are you sure you want to delete this testimonial?')) return;
                deleteTestimonialMutation.mutate(testimonial.id, {
                  onSuccess: () => {
                    window.location.href = "/admin/testimonials";
                  },
                  onError: (err: any) => {
                    console.error('Error deleting testimonial:', err);
                    alert(err?.response?.data?.message || err?.message || 'Failed to delete testimonial');
                  },
                });
              }}
              disabled={deleteTestimonialMutation.isPending}
            >
              {deleteTestimonialMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="prose max-w-none">
            {testimonial.details || testimonial.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 