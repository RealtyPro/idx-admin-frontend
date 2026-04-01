"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useSingleProperty } from "@/services/property/PropertyQueries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createOpenHouse } from "@/services/open-house/OpenHouseServices";

interface OpenHouseFormState {
  event_date: string;
  start_time: string;
  end_time: string;
  description: string;
  status: string;
}

export default function ListingDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const fromPage = searchParams.get("from_page") || "1";
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const { data, isLoading, isError } = useSingleProperty(id);
  const listing = data?.data || data;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isOpenHouseModalOpen, setIsOpenHouseModalOpen] = useState(false);
  const [openHouseLoading, setOpenHouseLoading] = useState(false);
  const [openHouseError, setOpenHouseError] = useState("");
  const [openHouseSuccess, setOpenHouseSuccess] = useState("");
  const [openHouseForm, setOpenHouseForm] = useState<OpenHouseFormState>({
    event_date: "",
    start_time: "",
    end_time: "",
    description: "",
    status: "scheduled",
  });

  // Navigation functions for slider
  const handlePrevImage = () => {
    const images = getImages();
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    const images = getImages();
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1,
    );
  };

  // Parse views if it's a JSON string
  const parseViews = (views: any): string[] => {
    if (!views || views === null || views === undefined) return [];
    if (typeof views === "string") {
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
    if (
      listing?.cover_photo &&
      Array.isArray(listing.cover_photo) &&
      listing.cover_photo.length > 0
    ) {
      allImages.push(...listing.cover_photo);
    }

    // Then append additional images from the images array
    if (
      listing?.images &&
      Array.isArray(listing.images) &&
      listing.images.length > 0
    ) {
      // Filter out duplicates if cover_photo already contains some images
      const uniqueImages = listing.images.filter(
        (img: string) => !allImages.includes(img),
      );
      allImages.push(...uniqueImages);
    }

    return allImages;
  };

  const images = getImages();
  const views = parseViews(listing?.views) || [];
  const bannerImage = images[0] || "/placeholder-image.jpg";
  const listingTitle =
    listing?.title || listing?.name || listing?.address || `Listing ${listing?.id || ""}`;
  const listingAddress =
    listing?.address || listing?.location || listing?.mls_address || "Location not available";
  const listingMlsId =
    listing?.mls_listingid || listing?.mls_id || listing?.mls_number || listing?.ref || "N/A";

  const resetOpenHouseForm = () => {
    setOpenHouseForm({
      event_date: "",
      start_time: "",
      end_time: "",
      description: "",
      status: "scheduled",
    });
    setOpenHouseError("");
    setOpenHouseSuccess("");
  };

  const onCloseOpenHouseModal = (open: boolean) => {
    setIsOpenHouseModalOpen(open);
    if (!open) {
      resetOpenHouseForm();
    }
  };

  const onCreateOpenHouse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpenHouseError("");
    setOpenHouseSuccess("");

    if (!openHouseForm.event_date || !openHouseForm.start_time) {
      setOpenHouseError("Event date and start time are required.");
      return;
    }

    setOpenHouseLoading(true);
    try {
      await createOpenHouse({
        property_id: String(listing?.id),
        event_date: openHouseForm.event_date,
        start_time: openHouseForm.start_time,
        end_time: openHouseForm.end_time || undefined,
        description: openHouseForm.description.trim() || undefined,
        notes: openHouseForm.description.trim() || undefined,
        status: openHouseForm.status || undefined,
      });
      setOpenHouseSuccess("Open house event created successfully.");
      setTimeout(() => {
        setIsOpenHouseModalOpen(false);
        resetOpenHouseForm();
      }, 800);
    } catch (err: any) {
      setOpenHouseError(
        err?.response?.data?.message || err?.message || "Failed to create open house event"
      );
    } finally {
      setOpenHouseLoading(false);
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

  if (isError || !listing) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Listing Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The listing you are looking for does not exist.
            </p>
            <Button asChild variant="secondary" className="mt-4">
              <Link href={`/admin/listings?page=${fromPage}`}>
                Back to Listings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format price
  const formatPrice = (price: any) => {
    if (!price) return "N/A";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {listing.title ||
              listing.name ||
              listing.address ||
              `Listing ${listing.id}`}
          </h1>
          <div className="text-muted-foreground">
            {listing.address && <p className="text-lg">{listing.address}</p>}
            {listing.ref && <p className="text-sm">Ref: {listing.ref}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setIsOpenHouseModalOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            Create Openhouse
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/listings?page=${fromPage}`}>Back</Link>
          </Button>
        </div>
      </div>

      <Dialog open={isOpenHouseModalOpen} onOpenChange={onCloseOpenHouseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Openhouse Event</DialogTitle>
            <DialogDescription>
              Use this listing details to quickly create an open house event.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border overflow-hidden">
            <img
              src={bannerImage}
              alt={`${listingTitle} banner`}
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
              }}
            />
            <div className="p-4 space-y-1.5">
              <p className="font-semibold text-base text-slate-900">{listingTitle}</p>
              <p className="text-sm text-slate-600">{listingAddress}</p>
              <p className="text-sm text-slate-500">MLS ID: {listingMlsId}</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onCreateOpenHouse}>
            {openHouseSuccess && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {openHouseSuccess}
              </div>
            )}
            {openHouseError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {openHouseError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event_date" className="block text-sm font-medium text-slate-700 mb-1">
                  Event Date
                </label>
                <Input
                  id="event_date"
                  type="date"
                  value={openHouseForm.event_date}
                  onChange={(e) =>
                    setOpenHouseForm((prev) => ({ ...prev, event_date: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={openHouseForm.status}
                  onChange={(e) =>
                    setOpenHouseForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-slate-700 mb-1">
                  Start Time
                </label>
                <Input
                  id="start_time"
                  type="time"
                  value={openHouseForm.start_time}
                  onChange={(e) =>
                    setOpenHouseForm((prev) => ({ ...prev, start_time: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-slate-700 mb-1">
                  End Time
                </label>
                <Input
                  id="end_time"
                  type="time"
                  value={openHouseForm.end_time}
                  onChange={(e) =>
                    setOpenHouseForm((prev) => ({ ...prev, end_time: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label htmlFor="openhouse_description" className="block text-sm font-medium text-slate-700 mb-1">
                Event Notes
              </label>
              <textarea
                id="openhouse_description"
                rows={4}
                value={openHouseForm.description}
                onChange={(e) =>
                  setOpenHouseForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                placeholder="Add event notes or instructions"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onCloseOpenHouseModal(false)}
                disabled={openHouseLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors" disabled={openHouseLoading}>
                {openHouseLoading ? "Creating..." : "Create Openhouse"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Photo Gallery with Slider */}
      {images.length > 0 && (
        <Card>
          <CardContent className="p-0">
            {/* Main Image with Navigation */}
            <div className="relative w-full h-96 bg-gray-100 rounded-t-lg overflow-hidden group">
              <img
                src={images[selectedImageIndex] || "/placeholder-image.jpg"}
                alt={`${listing.title || "Property"} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
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
                          ? "bg-white w-6"
                          : "bg-white/50 hover:bg-white/75"
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
                      const container = document.getElementById(
                        "thumbnail-container",
                      );
                      if (container)
                        container.scrollBy({ left: -200, behavior: "smooth" });
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                    aria-label="Scroll thumbnails left"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}

                {/* Thumbnails Container */}
                <div
                  id="thumbnail-container"
                  className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide px-8"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-gray-300 hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-image.jpg";
                        }}
                      />
                      {/* Active Overlay */}
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-primary"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
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
                      const container = document.getElementById(
                        "thumbnail-container",
                      );
                      if (container)
                        container.scrollBy({ left: 200, behavior: "smooth" });
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                    aria-label="Scroll thumbnails right"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
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
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(listing.price)}
                  </p>
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
                    <p className="text-sm text-muted-foreground">
                      Built-up Area
                    </p>
                    <p className="text-xl font-semibold">{listing.bua} sqft</p>
                  </div>
                )}
                {listing.floor && (
                  <div>
                    <p className="text-sm text-muted-foreground">Floor</p>
                    <p className="text-xl font-semibold">{listing.floor}</p>
                  </div>
                )}
                {listing.mls_YearBuilt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Year Built</p>
                    <p className="text-xl font-semibold">
                      {listing.mls_YearBuilt}
                    </p>
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
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {listing.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {listing.features &&
            Array.isArray(listing.features) &&
            listing.features.filter((f: any) => f).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {listing.features
                      .filter((f: any) => f)
                      .map((feature: string, index: number) => (
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
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
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
              {/* {listing.property_status && (
                <div>
                  <p className="text-sm text-muted-foreground">Property Status</p>
                  <p className="font-medium">{listing.property_status}</p>
                </div>
              )} */}
              {listing.category && (
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{listing.category}</p>
                </div>
              )}
              {listing.status && (
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      listing.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>
              )}

              {listing.construction_status && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Construction Status
                  </p>
                  <p className="font-medium">{listing.construction_status}</p>
                </div>
              )}

              {listing.category_type && (
                <div>
                  <p className="text-sm text-muted-foreground">Category Type</p>
                  <p className="font-medium">{listing.category_type}</p>
                </div>
              )}
              {listing.zip && (
                <div>
                  <p className="text-sm text-muted-foreground">ZIP Code</p>
                  <p className="font-medium">{listing.zip}</p>
                </div>
              )}
              {/* {listing.latitude && listing.longitude && (
                <div>
                  <p className="text-sm text-muted-foreground">Coordinates</p>
                  <p className="font-medium text-xs">
                    {listing.latitude}, {listing.longitude}
                  </p>
                </div>
              )} */}
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

          {/* Location */}
          {/* {(listing.latitude || listing.longitude || listing.zip) && (
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
                    <p className="font-medium text-xs">
                      {listing.latitude}, {listing.longitude}
                    </p>
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
          )} */}

          {/* MLS Information */}
          {(listing.mls_listingid ||
            listing.mls_list_agent ||
            listing.listed_with) && (
            <Card>
              <CardHeader>
                <CardTitle>MLS Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {listing.mls_listingid && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      MLS Listing ID
                    </p>
                    <p className="font-medium">{listing.mls_listingid}</p>
                  </div>
                )}
                {listing.mls_list_agent && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">List Agent</p>
                    {(() => {
                      let parts: string[] = [];
                      try {
                        const parsed =
                          typeof listing.mls_list_agent === "string"
                            ? JSON.parse(listing.mls_list_agent)
                            : listing.mls_list_agent;
                        parts = Array.isArray(parsed)
                          ? parsed.filter(Boolean)
                          : [String(listing.mls_list_agent)];
                      } catch {
                        parts = [String(listing.mls_list_agent)];
                      }
                      const [name, company, phone] = parts;
                      const acronym = name
                        ? name.split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join("")
                        : "?";
                      return (
                        <div className="flex items-start gap-3">
                          {/* Acronym avatar */}
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {acronym}
                          </div>
                          {/* Details */}
                          <div className="flex flex-col gap-0.5 min-w-0">
                            {name && (
                              <p className="font-semibold text-sm leading-snug truncate">{name}</p>
                            )}
                            {(company || listing.ListOfficeName) && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="truncate">{company || listing.ListOfficeName}</span>
                              </div>
                            )}
                            {(phone || listing.ListOfficePhone) && (
                              <a
                                href={`tel:${(phone || listing.ListOfficePhone).replace(/\D/g, "")}`}
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {phone || listing.ListOfficePhone}
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {listing.listed_with && (
                  <div>
                    <p className="text-sm text-muted-foreground">Listed With</p>
                    <p className="font-medium">{listing.listed_with}</p>
                  </div>
                )}
                {/* {listing.mls_YearBuilt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Year Built</p>
                    <p className="font-medium">{listing.mls_YearBuilt}</p>
                  </div>
                )} */}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
