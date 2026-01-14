"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/services/Api';

function useEnquiryDetail(id: string) {
  return useQuery({
    queryKey: ['enquiry', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`v1/admin/enquiry/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export default function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Unwrap params using React.use() for Next.js compatibility
  const { id } = React.use(params);
  const { data, isLoading, isError, error } = useEnquiryDetail(id);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4">
        <p className="text-red-500">Error loading enquiry: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  const enquiry = data?.data || data || {};

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 max-w-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Enquiry Details</h1>
        <Button asChild variant="secondary">
          <Link href="/admin/inquiries">Back</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg mb-2">{enquiry.name || 'No Name'}</CardTitle>
          <div className="space-y-2">
            <div><span className="font-semibold">Email:</span> {enquiry.email}</div>
            <div><span className="font-semibold">Contact No:</span> {enquiry.contact_no}</div>
            <div><span className="font-semibold">Status:</span> {enquiry.status}</div>
            <div><span className="font-semibold">Created At:</span> {enquiry.created_at}</div>
            <div><span className="font-semibold">Updated At:</span> {enquiry.updated_at}</div>
            <div><span className="font-semibold">Description:</span> <div className="mt-1 text-dark">{enquiry.description}</div></div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
