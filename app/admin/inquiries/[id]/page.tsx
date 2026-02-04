"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/services/Api';
import { Mail, Phone, Calendar, User, MessageSquare, FileText, Tag } from 'lucide-react';

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
  const queryClient = useQueryClient();
  // Unwrap params using React.use() for Next.js compatibility
  const { id } = React.use(params);
  const { data, isLoading, isError, error } = useEnquiryDetail(id);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`v1/admin/enquiry/${id}`);
    },
    onSuccess: () => {
      alert("Enquiry deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      router.push("/admin/inquiries");
    },
    onError: (error: any) => {
      console.error("Error deleting enquiry:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete enquiry.";
      alert(errorMessage);
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enquiry Not Found</CardTitle>
            <CardDescription>The enquiry you are looking for does not exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/admin/inquiries">Back to Enquiries</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enquiry = data?.data || data || {};

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {enquiry.name || enquiry.full_name || "Enquiry Details"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            {enquiry.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{enquiry.email}</span>
              </div>
            )}
            {enquiry.contact_no && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{enquiry.contact_no}</span>
              </div>
            )}
            {(enquiry.date || enquiry.created_at) && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(enquiry.date || enquiry.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/inquiries">Back</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Message Content */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <CardTitle>Message</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {(enquiry.message || enquiry.description) ? (
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {enquiry.message || enquiry.description}
              </p>
            ) : (
              <p className="text-muted-foreground italic">No message available</p>
            )}
          </CardContent>
        </Card>

        {/* Details Sidebar */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <CardTitle>Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            {enquiry.status && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <Badge
                  variant={enquiry.status === 'active' || enquiry.status === 'new' ? 'default' : 'secondary'}
                  className={enquiry.status === 'active' || enquiry.status === 'new' ? 'bg-green-500' : ''}
                >
                  {enquiry.status}
                </Badge>
              </div>
            )}

            {/* Name */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Name</h3>
              <p className="text-sm">{enquiry.name || enquiry.full_name || 'N/A'}</p>
            </div>

            {/* Email */}
            {enquiry.email && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                <p className="text-sm break-all">{enquiry.email}</p>
              </div>
            )}

            {/* Contact Number */}
            {enquiry.contact_no && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact Number</h3>
                <p className="text-sm">{enquiry.contact_no}</p>
              </div>
            )}

            {/* Listing ID */}
            {(enquiry.listing_id || enquiry.listingId) && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Listing ID</h3>
                <p className="text-sm font-mono">{enquiry.listing_id || enquiry.listingId}</p>
              </div>
            )}

            {/* Property Type */}
            {enquiry.property_type && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Property Type</h3>
                <p className="text-sm">{enquiry.property_type}</p>
              </div>
            )}

            {/* Created At */}
            {enquiry.created_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                <p className="text-sm">
                  {new Date(enquiry.created_at).toLocaleString()}
                </p>
              </div>
            )}

            {/* Updated At */}
            {enquiry.updated_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Updated At</h3>
                <p className="text-sm">
                  {new Date(enquiry.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
