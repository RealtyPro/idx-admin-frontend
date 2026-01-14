"use client";
import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/services/Api';

function useSingleNewsletterSubscriber(id: string) {
  return useQuery({
    queryKey: ['newsletter-subscriber', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`v1/admin/newsletter/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export default function NewsletterSubscriberDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const { data, isLoading, isError } = useSingleNewsletterSubscriber(id);
  const subscriber = data?.data || data;

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !subscriber) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Subscriber Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">The subscriber you are looking for does not exist.</div>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin/newsletter">Back to Newsletter</Link>
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
            <CardTitle className="text-xl">{subscriber.name || subscriber.email || 'No Name'}</CardTitle>
            <div className="text-sm text-muted-foreground">{subscriber.email}</div>
            <div className="text-sm text-dark mt-2">{subscriber.created_at}</div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/newsletter">Back</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="prose max-w-none space-y-2">
            <div><b>ID:</b> {subscriber.id}</div>
            <div><b>Name:</b> {subscriber.name}</div>
            <div><b>Email:</b> {subscriber.email}</div>
            <div><b>Contact No:</b> {subscriber.contact_no}</div>
            <div><b>Status:</b> {subscriber.status}</div>
            <div><b>Description:</b> {subscriber.description}</div>
            <div><b>Created At:</b> {subscriber.created_at}</div>
            <div><b>Updated At:</b> {subscriber.updated_at}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
