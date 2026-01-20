"use client";
import React from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useSingleTestimonial, useUpdateTestimonial } from '@/services/testimonial/TestimonialQueries';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function TestimonialEditPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const { data, isLoading, isError } = useSingleTestimonial(id);

  const testimonial = data?.data || data;
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [rating, setRating] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const updateTestimonialMutation = useUpdateTestimonial();

  // Update form fields when testimonial data loads
  useEffect(() => {
    if (testimonial) {
      setName(testimonial.name || '');
      setPosition(testimonial.position || '');
      setRating(testimonial.rating ? String(testimonial.rating) : '');
      setDetails(testimonial.details || testimonial.content || '');
    }
  }, [testimonial]);

  // Simple toast utility (replace with your own or a library if available)
  function showToast(message: string) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '32px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#323232';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '1rem';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s';
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 2000);
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl mt-4" />
      </div>
    );
  }

  if (isError || !testimonial) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Testimonial Not Found</CardTitle>
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
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Edit Testimonial</CardTitle>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/admin/testimonials/${testimonial.id}`}>Back</Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => alert('Deleted!')}>Delete</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const payload = {
              ListAgentMlsId: testimonial.ListAgentMlsId || "NWM1307294",
              name,
              position: position || "",
              rating: rating || "",
              details,
              status: testimonial.status || "active",
              user_id: testimonial.user_id || "104",
              upload_folder: testimonial.upload_folder || "testimonial/testimonial"
            };
            updateTestimonialMutation.mutate(
              { id: testimonial.id, data: payload },
              {
                onSuccess: () => {
                  showToast("Testimonial updated successfully");
                  setTimeout(() => {
                    // Redirect to testimonials list page after successful update
                    router.push("/admin/testimonials");
                  }, 1200);
                },
                onError: (err: any) => {
                  const errorMessage = err?.response?.data?.message || err?.message || "Failed to update testimonial. Please try again.";
                  setError(errorMessage);
                  console.error("Error updating testimonial:", err);
                }
              }
            );
          }}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input id="position" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g., CEO, TechCorp Solutions" />
            </div>
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Input id="rating" type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} placeholder="1-5" />
            </div>
            <div>
              <Label htmlFor="details">Details</Label>
              <textarea id="details" className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={details} onChange={e => setDetails(e.target.value)} required />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" disabled={updateTestimonialMutation.isPending}>{updateTestimonialMutation.isPending ? "Updating..." : "Update"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 