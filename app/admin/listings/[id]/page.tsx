"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from '@/components/ui/skeleton';
import { useSingleProperty } from '@/services/property/PropertyQueries';

export default function ListingDetailsPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const { data, isLoading, isError } = useSingleProperty(id);
  const listing = data?.data || data;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Parse views if it's a JSON string
  const parseViews = (views: any) => {
    if (!views) return [];
    if (typeof views === 'string') {
      try {
        return JSON.parse(views);
      } catch {
        return [];
      }
    }
    return Array.isArray(views) ? views : [];
  };

  // Get images array (photos or images)
  const getImages = () => {
    if (listing?.photos && Array.isArray(listing.photos) && listing.photos.length > 0) {
      return listing.photos.map((photo: any) => photo.MediaURL || photo.mediaURL || photo.url);
    }
    if (listing?.images && Array.isArray(listing.images) && listing.images.length > 0) {
      return listing.images;
    }
    if (listing?.cover_photo && Array.isArray(listing.cover_photo) && listing.cover_photo.length > 0) {
      return listing.cover_photo;
    }
    return [];
  };

  const images = getImages();
  const views = parseViews(listing?.views);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Listing Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The listing you are looking for does not exist.</p>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin/listings">Back to Listings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format price
  const formatPrice = (price: any) => {
    if (!price) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(numPrice);
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {listing.title || listing.name || listing.address || `Listing ${listing.id}`}
          </h1>
          <div className="text-muted-foreground">
            {listing.address && <p className="text-lg">{listing.address}</p>}
            {listing.ref && <p className="text-sm">Ref: {listing.ref}</p>}
          </div>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/admin/listings">Back</Link>
        </Button>
      </div>

      {/* Main Photo Gallery */}
      {images.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="relative w-full h-96 bg-gray-100 rounded-t-lg overflow-hidden">
              <img
                src={images[selectedImageIndex]}
                alt={listing.title || 'Property image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="p-4 grid grid-cols-6 gap-2">
                {images.slice(0, 6).map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 rounded overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price and Key Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(listing.price)}</p>
                </div>
                {listing.beds && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="text-xl font-semibold">{listing.beds}</p>
                  </div>
                )}
                {listing.baths && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="text-xl font-semibold">{listing.baths}</p>
                  </div>
                )}
                {listing.parking && (
                  <div>
                    <p className="text-sm text-muted-foreground">Parking</p>
                    <p className="text-xl font-semibold">{listing.parking}</p>
                  </div>
                )}
                {listing.bua && (
                  <div>
                    <p className="text-sm text-muted-foreground">Built-up Area</p>
                    <p className="text-xl font-semibold">{listing.bua} sqft</p>
                  </div>
                )}
                {listing.floor && (
                  <div>
                    <p className="text-sm text-muted-foreground">Floor</p>
                    <p className="text-xl font-semibold">{listing.floor}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {listing.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{listing.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {listing.features && Array.isArray(listing.features) && listing.features.filter((f: any) => f).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {listing.features.filter((f: any) => f).map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Views */}
          {views.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {views.map((view: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {view}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Info */}
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {listing.construction_status && (
                <div>
                  <p className="text-sm text-muted-foreground">Construction Status</p>
                  <p className="font-medium">{listing.construction_status}</p>
                </div>
              )}
              {listing.property_status && (
                <div>
                  <p className="text-sm text-muted-foreground">Property Status</p>
                  <p className="font-medium">{listing.property_status}</p>
                </div>
              )}
              {listing.status && (
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    listing.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {listing.status}
                  </span>
                </div>
              )}
              {listing.category && (
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{listing.category}</p>
                </div>
              )}
              {listing.category_type && (
                <div>
                  <p className="text-sm text-muted-foreground">Category Type</p>
                  <p className="font-medium">{listing.category_type}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          {(listing.latitude || listing.longitude || listing.zip) && (
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {listing.zip && (
                  <div>
                    <p className="text-sm text-muted-foreground">ZIP Code</p>
                    <p className="font-medium">{listing.zip}</p>
                  </div>
                )}
                {listing.latitude && listing.longitude && (
                  <div>
                    <p className="text-sm text-muted-foreground">Coordinates</p>
                    <p className="font-medium text-xs">{listing.latitude}, {listing.longitude}</p>
                  </div>
                )}
                {listing.mls_city && (
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{listing.mls_city}</p>
                  </div>
                )}
                {listing.mls_state && (
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium">{listing.mls_state}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* MLS Information */}
          {(listing.mls_listingid || listing.mls_list_agent || listing.listed_with) && (
            <Card>
              <CardHeader>
                <CardTitle>MLS Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {listing.mls_listingid && (
                  <div>
                    <p className="text-sm text-muted-foreground">MLS Listing ID</p>
                    <p className="font-medium">{listing.mls_listingid}</p>
                  </div>
                )}
                {listing.mls_list_agent && (
                  <div>
                    <p className="text-sm text-muted-foreground">List Agent</p>
                    <p className="font-medium text-sm">
                      {typeof listing.mls_list_agent === 'string' 
                        ? (() => {
                            try {
                              const parsed = JSON.parse(listing.mls_list_agent);
                              return Array.isArray(parsed) ? parsed.filter(Boolean).join(', ') : listing.mls_list_agent;
                            } catch {
                              return listing.mls_list_agent;
                            }
                          })()
                        : listing.mls_list_agent}
                    </p>
                  </div>
                )}
                {listing.listed_with && (
                  <div>
                    <p className="text-sm text-muted-foreground">Listed With</p>
                    <p className="font-medium">{listing.listed_with}</p>
                  </div>
                )}
                {listing.mls_YearBuilt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Year Built</p>
                    <p className="font-medium">{listing.mls_YearBuilt}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          {(listing.created_at || listing.published_at || listing.updated_at) && (
            <Card>
              <CardHeader>
                <CardTitle>Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {listing.created_at && (
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{new Date(listing.created_at).toLocaleDateString()}</p>
                  </div>
                )}
                {listing.published_at && (
                  <div>
                    <p className="text-muted-foreground">Published</p>
                    <p>{new Date(listing.published_at).toLocaleDateString()}</p>
                  </div>
                )}
                {listing.updated_at && (
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p>{new Date(listing.updated_at).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

