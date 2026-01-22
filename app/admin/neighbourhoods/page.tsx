"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { useNeighbourhoods, useDeleteNeighbourhood } from '@/services/neighbourhood/NeighbourhoodQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNeighbourhood } from '@/services/neighbourhood/NeighbourhoodServices';

export default function NeighbourhoodsListPage() {
  const page = 1;
  const { data, isLoading, isError, error } = useNeighbourhoods(page);
  const queryClient = useQueryClient();
  
  // Extract neighbourhoods from API response
  const neighbourhoods = data?.data || data || [];

  const deleteNeighbourhoodMutation = useMutation({
    mutationFn: (id: string) => deleteNeighbourhood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighbourhoods'] });
      alert("Neighbourhood deleted successfully");
    },
    onError: (error: any) => {
      console.error("Error deleting neighbourhood:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete neighbourhood. Please try again.";
      alert(errorMessage);
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this neighbourhood?")) {
      deleteNeighbourhoodMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-32 rounded" />
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
        <p className="text-red-500">Error loading neighbourhoods: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Neighbourhoods</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin">Back</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/neighbourhoods/create">Add Neighbourhood</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {Array.isArray(neighbourhoods) && neighbourhoods.length > 0 ? (
          neighbourhoods.map((neighbourhood: any) => (
            <Card key={neighbourhood.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    <Link href={`/admin/neighbourhoods/${neighbourhood.id}`}>{neighbourhood.name || neighbourhood.title}</Link>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {neighbourhood.description && <span>{neighbourhood.description.substring(0, 100)}...</span>}
                    {neighbourhood.created_at && <span className="ml-2">• {neighbourhood.created_at}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/neighbourhoods/${neighbourhood.id}/edit`}>Edit</Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(neighbourhood.id)}
                    disabled={deleteNeighbourhoodMutation.isPending}
                  >
                    {deleteNeighbourhoodMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No neighbourhoods found.</p>
        )}
      </div>
    </div>
  );
}

