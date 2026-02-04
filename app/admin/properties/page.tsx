"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProperties, useDeleteProperty } from '@/services/property/PropertyQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProperty } from '@/services/property/PropertyServices';

export default function PropertiesListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isError, error } = useProperties({ page: currentPage });
  const queryClient = useQueryClient();
  
  // Extract properties from API response
  const properties = data?.data || data || [];
  
  // Extract pagination metadata from API response
  const pagination = data?.meta || data?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || 1;
  const currentPageNum = pagination?.current_page || currentPage;

  const deletePropertyMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      alert("Property deleted successfully");
    },
    onError: (error: any) => {
      console.error("Error deleting property:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete property. Please try again.";
      alert(errorMessage);
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      deletePropertyMutation.mutate(id);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPageNum - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPageNum - 1)}
          disabled={currentPageNum === 1 || isLoading}
        >
          Previous
        </Button>
        
        {startPage > 1 && (
          <>
            <Button
              variant={1 === currentPageNum ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(1)}
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPageNum ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button
              variant={totalPages === currentPageNum ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPageNum + 1)}
          disabled={currentPageNum === totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    );
  };

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
        <p className="text-red-500">Error loading properties: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Properties</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin">Back</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/properties/create">New Property</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {Array.isArray(properties) && properties.length > 0 ? (
          properties.map((property: any) => (
            <Card key={property.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    <Link 
                      href={`/admin/properties/${property.id}`}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {property.title || property.name || property.address || `Property ${property.id}`}
                    </Link>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {property.address && <span>{property.address}</span>}
                    {property.address && property.price && <span> • </span>}
                    {property.price && <span>${property.price}</span>}
                    {property.status && (property.address || property.price) && <span> • </span>}
                    {property.status && <span>Status: {property.status}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="default" size="sm">
                    <Link href={`/admin/properties/${property.id}`}>View</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/properties/${property.id}/edit`}>Edit</Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(property.id)}
                    disabled={deletePropertyMutation.isPending}
                  >
                    {deletePropertyMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No properties found.</p>
        )}
      </div>
      {renderPagination()}
    </div>
  );
} 