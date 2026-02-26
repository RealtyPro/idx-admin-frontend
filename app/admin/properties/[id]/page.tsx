"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from '@/components/ui/skeleton';
import { useSingleProperty } from '@/services/property/PropertyQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProperty } from '@/services/property/PropertyServices';
import { MapPin, Calendar, DollarSign, Home, FileText, Tag, Bed, Bath, Square } from 'lucide-react';

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

  // Handle image URL
  const getImageUrl = () => {
    if (!property?.image && !property?.images) return null;
    
    const imageData = property.images || property.image;
    
    if (typeof imageData === 'string') {
      return imageData.startsWith('http')
        ? imageData
        : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/storage/${imageData}`;
    }
    
    if (typeof imageData === 'object' && imageData.path) {
      return imageData.path.startsWith('http')
        ? imageData.path
        : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/storage/${imageData.path}`;
    }
    
    if (Array.isArray(imageData) && imageData.length > 0) {
      const firstImage = imageData[0];
      if (typeof firstImage === 'string') {
        return firstImage.startsWith('http')
          ? firstImage
          : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/storage/${firstImage}`;
      }
      if (firstImage.path) {
        return firstImage.path.startsWith('http')
          ? firstImage.path
          : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/storage/${firstImage.path}`;
      }
    }
    
    return null;
  };

  const imageUrl = getImageUrl();

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
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Not Found</CardTitle>
            <CardDescription>The property you are looking for does not exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/admin/properties">Back to Properties</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {property.title || property.name || property.address || "Property Details"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            {property.address && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{property.address}</span>
              </div>
            )}
            {property.price && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>${typeof property.price === 'number' ? property.price.toLocaleString() : property.price}</span>
              </div>
            )}
            {property.created_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(property.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
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
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Image Section - 8 columns */}
        {imageUrl && (
          <Card className="overflow-hidden md:col-span-8 col-span-12">
            <CardContent className="p-0">
              <img
                src={imageUrl}
                alt={property.title || property.name || 'Property'}
                className="w-full h-[400px] object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Details Sidebar - 4 columns */}
        <Card className={imageUrl ? "md:col-span-4 col-span-12" : "md:col-span-12 col-span-12"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              <CardTitle>Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            {property.status && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                <Badge
                  variant={property.status === 'available' || property.status === 'active' ? 'default' : 'secondary'}
                  className={property.status === 'available' || property.status === 'active' ? 'bg-green-500' : ''}
                >
                  {property.status}
                </Badge>
              </div>
            )}

            {/* Price */}
            {property.price && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Price</h3>
                <p className="text-lg font-semibold">
                  ${typeof property.price === 'number' ? property.price.toLocaleString() : property.price}
                </p>
              </div>
            )}

            {/* Property Type */}
            {property.property_type && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Type</h3>
                <p className="text-sm capitalize">{property.property_type}</p>
              </div>
            )}

            {/* Bedrooms */}
            {property.bedrooms && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Bedrooms</h3>
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{property.bedrooms}</p>
                </div>
              </div>
            )}

            {/* Bathrooms */}
            {property.bathrooms && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Bathrooms</h3>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{property.bathrooms}</p>
                </div>
              </div>
            )}

            {/* Square Feet */}
            {property.square_feet && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Square Feet</h3>
                <div className="flex items-center gap-1">
                  <Square className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{property.square_feet} sq ft</p>
                </div>
              </div>
            )}

            {/* Address */}
            {property.address && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
                <p className="text-sm">{property.address}</p>
              </div>
            )}

            {/* Created At */}
            {property.created_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Listed On</h3>
                <p className="text-sm">
                  {new Date(property.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description Section - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <CardTitle>Description</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {property.description && (
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {property.description}
              </p>
            </div>
          )}
          {property.content && (
            <div 
              className="prose prose-sm sm:prose lg:prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: property.content }} 
            />
          )}
          {!property.description && !property.content && (
            <p className="text-muted-foreground italic">No description available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
