"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Skeleton } from '@/components/ui/skeleton';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import { useEnquiries } from '@/services/enquiry/EnquiryQueris';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/services/Api';

export default function InquiriesPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // You can add pagination support by using a state for page
  const page = 1;
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useEnquiries(page);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`v1/admin/enquiry/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      setShowDeleteModal(false);
      setDeleteId(null);
    },
  });

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
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4">
        <p className="text-red-500">Error loading inquiries: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  // Adjust this depending on your API response structure
  const inquiries = data?.data || data || [];

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Enquiries</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin">Back</Link>
          </Button>
          {/* <Button asChild>
            <Link href="/admin/enquiries/create">New Enquiry</Link>
          </Button> */}
        </div>
      </div>
      <div className="grid gap-4">
        {Array.isArray(inquiries) && inquiries.length > 0 ? (
          inquiries.map((inquiry: any) => (
            <Card key={inquiry.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    <Link href={`/admin/inquiries/${inquiry.id}`}>
                    {inquiry.name || inquiry.full_name || 'No Name'}</Link>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {inquiry.email} • {inquiry.date || inquiry.created_at} • Listing: {inquiry.listingId || inquiry.listing_id}
                  </div>
                  <div className="text-sm text-dark mt-2">{inquiry.message}</div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/inquiries/${inquiry.id}`}>View</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      setDeleteId(inquiry.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    {deleteMutation.isPending && deleteId === inquiry.id ? 'Deleting...' : 'Delete'}
                  </Button>
                      {/* Delete Confirmation Modal */}
                      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Enquiry</DialogTitle>
                          </DialogHeader>
                          <div>Are you sure you want to delete this enquiry?</div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteMutation.isPending}>
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No Enquiries found.</p>
        )}
      </div>
    </div>
  );
} 