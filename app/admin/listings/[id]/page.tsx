"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Skeleton } from '@/components/ui/skeleton';
import { useSingleProperty } from '@/services/property/PropertyQueries';

export default function ListingDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const fromPage = searchParams.get('from_page') || '1';
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const { data, isLoading, isError } = useSingleProperty(id);
  const listing = data?.data || data;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Navigation functions for slider
  const handlePrevImage = () => {
    const images = getImages();
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const images = getImages();
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Parse views if it's a JSON string
  const parseViews = (views: any): string[] => {
    if (!views || views === null || views === undefined) return [];
    if (typeof views === 'string') {
      try {
        const parsed = JSON.parse(views);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(views) ? views.filter(Boolean) : [];
  };

  // Get images array - combine cover_photo and additional images
  const getImages = () => {
    const allImages: string[] = [];
    
    // First add cover_photo (this will be shown first)
    if (listing?.cover_photo && Array.isArray(listing.cover_photo) && listing.cover_photo.length > 0) {
      allImages.push(...listing.cover_photo);
    }
    
    // Then append additional images from the images array
    if (listing?.images && Array.isArray(listing.images) && listing.images.length > 0) {
      // Filter out duplicates if cover_photo already contains some images
      const uniqueImages = listing.images.filter((img: string) => !allImages.includes(img));
      allImages.push(...uniqueImages);
    }
    
    return allImages;
  };

  const images = getImages();
  const views = parseViews(listing?.views) || [];

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
              <Link href={`/admin/listings?page=${fromPage}`}>Back to Listings</Link>
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
          <Link href={`/admin/listings?page=${fromPage}`}>Back</Link>
        </Button>
      </div>

      {/* Main Photo Gallery with Slider */}
      {images.length > 0 && (
        <Card>
          <CardContent className="p-0">
            {/* Main Image with Navigation */}
            <div className="relative w-full h-96 bg-gray-100 rounded-t-lg overflow-hidden group">
              <img
                src={images[selectedImageIndex] || '/placeholder-image.jpg'}
                alt={`${listing.title || 'Property'} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                }}
              />
              
              {/* Image Counter */}
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                {selectedImageIndex + 1} / {images.length}
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Dot Indicators */}
              {images.length > 1 && images.length <= 10 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedImageIndex === index 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Slider */}
            {images.length > 1 && (
              <div className="relative p-4">
                {/* Scroll Left Button */}
                {images.length > 6 && (
                  <button
                    onClick={() => {
                      const container = document.getElementById('thumbnail-container');
                      if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                    aria-label="Scroll thumbnails left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Thumbnails Container */}
                <div
                  id="thumbnail-container"
                  className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide px-8"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-primary ring-2 ring-primary ring-offset-2' 
                          : 'border-gray-300 hover:border-primary/50'
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
                      {/* Active Overlay */}
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Scroll Right Button */}
                {images.length > 6 && (
                  <button
                    onClick={() => {
                      const container = document.getElementById('thumbnail-container');
                      if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                    aria-label="Scroll thumbnails right"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
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
          {views && Array.isArray(views) && views.length > 0 && (
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

          
        </div>
      </div>
    </div>
  );
}

