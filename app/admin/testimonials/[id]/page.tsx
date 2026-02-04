"use client";
import React from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from 'next/navigation';
import { useSingleTestimonial, useDeleteTestimonial } from '@/services/testimonial/TestimonialQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Calendar, Star, Briefcase, MessageSquare } from 'lucide-react';

export default function TestimonialsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const { data, isLoading, isError } = useSingleTestimonial(id);
  const testimonial = data?.data || data;
  const deleteTestimonialMutation = useDeleteTestimonial();

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !testimonial) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Testimonial Not Found</CardTitle>
            <CardDescription>The testimonial you are looking for does not exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/admin/testimonials">Back to Testimonials</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    deleteTestimonialMutation.mutate(testimonial.id, {
      onSuccess: () => {
        alert('Testimonial deleted successfully');
        router.push("/admin/testimonials");
      },
      onError: (err: any) => {
        console.error('Error deleting testimonial:', err);
        alert(err?.response?.data?.message || err?.message || 'Failed to delete testimonial');
      },
    });
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {testimonial.name || "Testimonial Details"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            {testimonial.position && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{testimonial.position}</span>
              </div>
            )}
            {(testimonial.date || testimonial.created_at) && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(testimonial.date || testimonial.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/testimonials/${testimonial.id}/edit`}>Edit</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/testimonials">Back</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteTestimonialMutation.isPending}
          >
            {deleteTestimonialMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Testimonial Content */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <CardTitle>Testimonial</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {testimonial.details || testimonial.content ? (
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {testimonial.details || testimonial.content}
                </p>
              ) : (
                <p className="text-muted-foreground italic">No testimonial content available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Sidebar */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <CardTitle>Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            {testimonial.status && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <Badge 
                  variant={testimonial.status === 'active' ? 'default' : 'secondary'}
                  className={testimonial.status === 'active' ? 'bg-green-500' : ''}
                >
                  {testimonial.status}
                </Badge>
              </div>
            )}

            {/* Rating */}
            {testimonial.rating && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Rating</h3>
                {renderStars(parseInt(testimonial.rating))}
              </div>
            )}

            {/* Name */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Name</h3>
              <p className="text-sm">{testimonial.name}</p>
            </div>

            {/* Position */}
            {testimonial.position && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Position</h3>
                <p className="text-sm">{testimonial.position}</p>
              </div>
            )}

            {/* Date */}
            {(testimonial.date || testimonial.created_at) && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Date</h3>
                <p className="text-sm">
                  {new Date(testimonial.date || testimonial.created_at).toLocaleDateString()}
                </p>
              </div>
            )}

      
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 