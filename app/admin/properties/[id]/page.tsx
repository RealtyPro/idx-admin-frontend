"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from '@/components/ui/skeleton';
import { useSingleProperty } from '@/services/property/PropertyQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProperty } from '@/services/property/PropertyServices';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const { data, isLoading, isError } = useSingleProperty(id);
  const property = data?.data || data;

  const deletePropertyMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      alert("Property deleted successfully");
      router.push("/admin/properties");
    },
    onError: (error: any) => {
      console.error("Error deleting property:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete property. Please try again.";
      alert(errorMessage);
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      deletePropertyMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Property Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The property you are looking for does not exist.</p>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin/properties">Back to Properties</Link>
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
            <CardTitle className="text-xl">
              {property.title || property.name || property.address || `Property ${property.id}`}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {property.address && <span>{property.address}</span>}
              {property.address && property.price && <span> • </span>}
              {property.price && <span>{property.price}</span>}
              {property.status && (property.address || property.price) && <span> • </span>}
              {property.status && <span>{property.status}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/properties/${id}/edit`}>Edit</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/properties">Back</Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deletePropertyMutation.isPending}
            >
              {deletePropertyMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {property.description && (
            <div className="prose max-w-none whitespace-pre-wrap">{property.description}</div>
          )}
          {property.content && (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: property.content }} />
          )}
          {!property.description && !property.content && (
            <p className="text-muted-foreground">No description available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
