"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { usePages, useDeletePage } from '@/services/page/PageQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePage } from '@/services/page/PageServices';

export default function PagesListPage() {
  const page = 1;
  const { data, isLoading, isError, error } = usePages(page);
  const queryClient = useQueryClient();
  
  // Extract pages from API response
  const pages = data?.data || data || [];

  const deletePageMutation = useMutation({
    mutationFn: (id: string) => deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      alert("Page deleted successfully");
    },
    onError: (error: any) => {
      console.error("Error deleting page:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete page. Please try again.";
      alert(errorMessage);
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      deletePageMutation.mutate(id);
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
        <p className="text-red-500">Error loading pages: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pages</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin">Back</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/pages/create">Add Page</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {Array.isArray(pages) && pages.length > 0 ? (
          pages.map((p: any) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    <Link href={`/admin/pages/${p.id}`}>{p.title}</Link>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {p.slug && <span>{p.slug}</span>}
                    {p.slug && p.date && <span> • </span>}
                    {p.date && <span>{p.date}</span>}
                    {p.created_at && !p.date && <span>{p.created_at}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/pages/${p.id}/edit`}>Edit</Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(p.id)}
                    disabled={deletePageMutation.isPending}
                  >
                    {deletePageMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No pages found.</p>
        )}
      </div>
    </div>
  );
} 