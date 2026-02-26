"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProperties } from "@/services/property/PropertyQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { PropertySearchParams } from "@/services/property/PropertyServices";
import AgentAvatar from "@/components/AgentAvatar";
import SearchFilters from "@/components/SearchFilters";

function ListingsContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const formatPhone = (phone: any) => {
    if (!phone) return null;
    if (typeof phone === "string" || typeof phone === "number")
      return String(phone);
    if (typeof phone === "object") {
      const code = phone.code ? String(phone.code).trim() : "";
      const number = phone.number ? String(phone.number).trim() : "";
      if (code && number) return `${code} ${number}`;
      if (code) return code;
      if (number) return number;
    }
    return String(phone);
  };

  const renderAgentDisplay = (agent: any) => {
    if (agent === null || agent === undefined) return null;
    if (typeof agent === "string" || typeof agent === "number")
      return String(agent);
    if (typeof agent === "object") {
      const parts = [agent.name, formatPhone(agent.phone), agent.email].filter(
        Boolean,
      );
      if (parts.length > 0) return parts.join(" • ");
      try {
        return JSON.stringify(agent);
      } catch {
        return "Agent";
      }
    }
    return String(agent);
  };

  const renderInquiriesDisplay = (inquiries: any) => {
    if (inquiries === null || inquiries === undefined) return null;
    if (typeof inquiries === "string" || typeof inquiries === "number")
      return String(inquiries);
    if (Array.isArray(inquiries)) return String(inquiries.length);
    if (typeof inquiries === "object") {
      const parts = [
        inquiries.name,
        formatPhone(inquiries.phone),
        inquiries.email,
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(" • ");
      try {
        return JSON.stringify(inquiries);
      } catch {
        return "Inquiries";
      }
    }
    return String(inquiries);
  };

  const getListingImage = (listing: any) => {
    const images = listing?.images ?? listing?.image ?? listing?.photos;
    if (typeof images === "string") {
      if (images.trim().startsWith("[")) {
        try {
          const parsed = JSON.parse(images);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        } catch {
          return images;
        }
      }
      return images;
    }
    if (Array.isArray(images) && images.length > 0) return images[0];
    return "/images/hero-image.png";
  };

  const formatPrice = (price: any) => {
    if (price === null || price === undefined || price === "") return "";
    if (typeof price === "number") return `$${price.toLocaleString("en-US")}`;
    const priceStr = String(price).trim();
    const numericValue = Number(priceStr.replace(/[^0-9.-]/g, ""));
    if (!Number.isNaN(numericValue)) {
      return `$${numericValue.toLocaleString("en-US")}`;
    }
    if (priceStr.startsWith("$")) return priceStr.slice(1);
    return `${priceStr}`;
  };

  const getSqft = (listing: any) => {
    return (
      listing?.sqft ??
      listing?.square_feet ??
      listing?.squareFeet ??
      listing?.bua ??
      listing?.area
    );
  };

  // Initialize state from URL params
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [featuringListingId, setFeaturingListingId] = useState<string | null>(
    null,
  );
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [featuredSuccess, setFeaturedSuccess] = useState<string | null>(null);

  // Search filter states (for form inputs - updates on every keystroke)
  const [filters, setFilters] = useState<PropertySearchParams>({
    page: pageFromUrl,
    bath_min: searchParams.get("bath_min") || "",
    bath_max: searchParams.get("bath_max") || "",
    bed_min: searchParams.get("bed_min") || "",
    bed_max: searchParams.get("bed_max") || "",
    keyword: searchParams.get("keyword") || "",
  });

  // Active search filters (only updates when search is triggered - prevents API calls on every keystroke)
  const [activeFilters, setActiveFilters] = useState<PropertySearchParams>({
    page: pageFromUrl,
    bath_min: searchParams.get("bath_min") || "",
    bath_max: searchParams.get("bath_max") || "",
    bed_min: searchParams.get("bed_min") || "",
    bed_max: searchParams.get("bed_max") || "",
    keyword: searchParams.get("keyword") || "",
  });

  // Fetch properties with active filters (not form filters)
  const { data, isLoading, isError, error } = useProperties(activeFilters);

  // Sync filters with URL parameters
  useEffect(() => {
    const newFilters: PropertySearchParams = {
      page: parseInt(searchParams.get("page") || "1", 10),
      bath_min: searchParams.get("bath_min") || "",
      bath_max: searchParams.get("bath_max") || "",
      bed_min: searchParams.get("bed_min") || "",
      bed_max: searchParams.get("bed_max") || "",
      keyword: searchParams.get("keyword") || "",
    };
    setFilters(newFilters);
    setActiveFilters(newFilters); // Also update active filters to trigger API call
    setCurrentPage(newFilters.page || 1);
  }, [searchParams]); // Only watch keyword to avoid loops

  // Extract listings (properties) from API response
  const listings = data?.data || data || [];

  // Extract pagination metadata from API response
  const pagination = data?.meta || data?.pagination || null;
  const totalPages =
    pagination?.last_page ||
    pagination?.total_pages ||
    pagination?.totalPages ||
    1;
  const currentPageNum =
    pagination?.current_page || pagination?.currentPage || currentPage;
  const totalItems =
    pagination?.total || pagination?.totalItems || listings.length;

  const buildQueryString = (newFilters: PropertySearchParams) => {
    const params = new URLSearchParams();

    if (newFilters.page) params.append("page", newFilters.page.toString());
    if (newFilters.bath_min) params.append("bath_min", newFilters.bath_min);
    if (newFilters.bath_max) params.append("bath_max", newFilters.bath_max);
    if (newFilters.bed_min) params.append("bed_min", newFilters.bed_min);
    if (newFilters.bed_max) params.append("bed_max", newFilters.bed_max);
    // Only include keyword if it's empty or has at least 3 characters
    if (newFilters.keyword && newFilters.keyword.length >= 3)
      params.append("keyword", newFilters.keyword);

    return params.toString();
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const newFilters = { ...filters, page };
      const queryString = buildQueryString(newFilters);
      router.push(`/admin/listings?${queryString}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearch = () => {
    // Validate keyword length
    if (
      filters.keyword &&
      filters.keyword.trim().length > 0 &&
      filters.keyword.trim().length < 3
    ) {
      setFeaturedError("Keyword must be at least 3 characters long");
      setTimeout(() => setFeaturedError(null), 3000);
      return;
    }

    const newFilters = { ...filters, page: 1 }; // Reset to page 1 on new search
    setActiveFilters(newFilters); // Update active filters to trigger API call
    const queryString = buildQueryString(newFilters);
    router.push(`/admin/listings?${queryString}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    const newFilters: PropertySearchParams = { page: 1 };
    setFilters(newFilters);
    router.push("/admin/listings?page=1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters = !!(
    filters.bath_min ||
    filters.bath_max ||
    filters.bed_min ||
    filters.bed_max ||
    (filters.keyword && filters.keyword.length >= 3)
  );
  const isKeywordValid =
    !filters.keyword ||
    filters.keyword.length === 0 ||
    filters.keyword.length >= 3;

  const handleKeywordClear = () => {
    const nextFilters = { ...filters, keyword: "" };
    setFilters(nextFilters);

    if (activeFilters.keyword && activeFilters.keyword.length >= 3) {
      const newFilters = { ...nextFilters, page: 1 };
      setActiveFilters(newFilters);
      const queryString = buildQueryString(newFilters);
      router.push(`/admin/listings?${queryString}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSetAsFeatured = async (listingId: string) => {
    try {
      setFeaturingListingId(listingId);
      setFeaturedError(null);
      setFeaturedSuccess(null);

      // Get access token from sessionStorage
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        setFeaturedError("Authentication required. Please login again.");
        setFeaturingListingId(null);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/admin/property/action/${listingId}/feature`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to set property as featured");
      }
      await queryClient.invalidateQueries({
        queryKey: ["properties", activeFilters],
      });

      setFeaturedSuccess(`Property successfully set as featured!`);

      // Refetch the properties list to update the UI

      // Clear success message after 3 seconds
      setTimeout(() => {
        setFeaturedSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error setting property as featured:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to set property as featured";
      setFeaturedError(errorMessage);

      // Clear error message after 5 seconds
      setTimeout(() => {
        setFeaturedError(null);
      }, 5000);
    } finally {
      setFeaturingListingId(null);
    }
  };

  const handleCardClick = (listingId: string) => {
    router.push(`/admin/listings/${listingId}?from_page=${currentPage}`);
  };

  const renderPagination = () => {
    // Show pagination if we have pagination data or if there are multiple pages worth of data
    // Also show if we have listings and might have more pages
    if (totalPages <= 1 && (!pagination || listings.length < 10)) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      currentPageNum - Math.floor(maxVisiblePages / 2),
    );
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 mt-6">
        <div className="flex items-center justify-center gap-2">
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
                disabled={isLoading}
              >
                1
              </Button>
              {startPage > 2 && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
            </>
          )}

          {pages.map((page) => (
            <Button
              key={page}
              variant={page === currentPageNum ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              disabled={isLoading}
            >
              {page}
            </Button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
              <Button
                variant={totalPages === currentPageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={isLoading}
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
        {pagination && (
          <div className="text-sm text-muted-foreground">
            Page {currentPageNum} of {totalPages}{" "}
            {totalItems && `(${totalItems} total items)`}
          </div>
        )}
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
            <div key={i} className="mb-6">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4">
        <p className="text-red-500">
          Error loading listings:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Listings</h1>

        <SearchFilters
          className="w-xl max-w-2xl"
          keyword={filters.keyword || ""}
          isKeywordValid={isKeywordValid}
          hasActiveFilters={hasActiveFilters}
          isLoading={isLoading}
          onKeywordChange={(value) =>
            setFilters({ ...filters, keyword: value })
          }
          onKeywordClear={handleKeywordClear}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          renderFields={() => (
            <>
              <div className="md:col-span-3 lg:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Min Bedrooms
                    </label>
                    <Input
                      type="number"
                      placeholder="Min beds"
                      value={filters.bed_min || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const nextMin = value === "" ? "" : String(Math.max(0, Number(value)));
                        setFilters({
                          ...filters,
                          bed_min: nextMin,
                          bed_max:
                            filters.bed_max && nextMin && Number(filters.bed_max) < Number(nextMin)
                              ? nextMin
                              : filters.bed_max,
                        });
                      }}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Max Bedrooms
                    </label>
                    <Input
                      type="number"
                      placeholder="Max beds"
                      value={filters.bed_max || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const nextMax = value === "" ? "" : String(Math.max(0, Number(value)));
                        const minValue = filters.bed_min ? Number(filters.bed_min) : 0;
                        setFilters({
                          ...filters,
                          bed_max: nextMax === "" ? "" : String(Math.max(minValue, Number(nextMax))),
                        });
                      }}
                      min={filters.bed_min || "0"}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Min Bathrooms
                    </label>
                    <Input
                      type="number"
                      placeholder="Min baths"
                      value={filters.bath_min || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const nextMin = value === "" ? "" : String(Math.max(0, Number(value)));
                        setFilters({
                          ...filters,
                          bath_min: nextMin,
                          bath_max:
                            filters.bath_max && nextMin && Number(filters.bath_max) < Number(nextMin)
                              ? nextMin
                              : filters.bath_max,
                        });
                      }}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Max Bathrooms
                    </label>
                    <Input
                      type="number"
                      placeholder="Max baths"
                      value={filters.bath_max || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const nextMax = value === "" ? "" : String(Math.max(0, Number(value)));
                        const minValue = filters.bath_min ? Number(filters.bath_min) : 0;
                        setFilters({
                          ...filters,
                          bath_max: nextMax === "" ? "" : String(Math.max(minValue, Number(nextMax))),
                        });
                      }}
                      min={filters.bath_min || "0"}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        />
      </div>

      {/* Success/Error Messages */}
      {featuredSuccess && (
        <div
          className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{featuredSuccess}</span>
        </div>
      )}

      {featuredError && (
        <div
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{featuredError}</span>
        </div>
      )}

      <div className="grid gap-4">
        {Array.isArray(listings) && listings.length > 0 ? (
          listings.map((listing: any) => (
            <Card
              key={listing.id}
              className="cursor-pointer"
              onClick={() => handleCardClick(listing.id)}
            >
              <CardHeader className="flex flex-row gap-3 items-center py-3 px-4">
                <div className="h-16 w-16 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                  <img
                    src={getListingImage(listing)}
                    alt={
                      listing.title ||
                      listing.name ||
                      listing.address ||
                      `Listing ${listing.id}`
                    }
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <CardTitle className="text-base font-semibold text-slate-900 truncate">
                      <Link
                        href={`/admin/listings/${listing.id}?from_page=${currentPage}`}
                      >
                        {listing.title ||
                          listing.name ||
                          listing.address ||
                          `Listing ${listing.id}`}
                      </Link>
                    </CardTitle>
                    {listing.status && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${
                          String(listing.status).toLowerCase() === "sold"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-[#9fb96f]/15 text-[#6f8741] border-[#9fb96f]/40"
                        }`}
                      >
                        {listing.status}
                      </span>
                    )}
                  </div>

                  {listing.address && (
                    <div className="text-xs text-muted-foreground truncate">
                      {listing.address}
                    </div>
                  )}

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    {listing.price && (
                      // <span className="text-slate-900 font-medium">
                      //   {formatPrice(listing.price)}
                      // </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          $
                        </span>
                        <span>{formatPrice(listing.price)}</span>
                      </span>
                    )}
                    {listing.beds !== undefined && listing.beds !== null && (
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M5 10V8a2 2 0 012-2h10a2 2 0 012 2v2M5 10v7m14-7v7M3 17h18"
                            />
                          </svg>
                        </span>
                        <span>{listing.beds} Beds</span>
                      </span>
                    )}
                    {listing.baths !== undefined && listing.baths !== null && (
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 6a2 2 0 114 0v3h6a2 2 0 012 2v6H5v-6a2 2 0 012-2h4V6"
                            />
                          </svg>
                        </span>
                        <span>{listing.baths} Baths</span>
                      </span>
                    )}
                    {getSqft(listing) && (
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6"
                            />
                          </svg>
                        </span>
                        <span>{getSqft(listing)} Sqft</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 text-xs text-muted-foreground">
                    {listing.views !== "null" &&
                      listing.views !== undefined && (
                        <span>
                          Views:{" "}
                          {(() => {
                            try {
                              if (
                                typeof listing.views === "string" &&
                                listing.views.startsWith("[")
                              ) {
                                const parsed = JSON.parse(listing.views);
                                return Array.isArray(parsed)
                                  ? parsed.join(", ")
                                  : listing.views;
                              }
                              return Array.isArray(listing.views)
                                ? listing.views.join(", ")
                                : listing.views;
                            } catch (e) {
                              return listing.views;
                            }
                          })()}
                        </span>
                      )}
                    {listing.inquiries !== undefined &&
                      (listing.agent || listing.views !== undefined) && (
                        <span> • </span>
                      )}
                    {listing.inquiries !== undefined && (
                      <span>
                        Inquiries: {renderInquiriesDisplay(listing.inquiries)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
                  {listing.agent && <AgentAvatar agent={listing.agent} />}
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/admin/listings/${listing.id}?from_page=${currentPage}`}
                    >
                      View
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetAsFeatured(listing.id)}
                    disabled={
                      listing.is_featured == 1 ||
                      featuringListingId === listing.id ||
                      isLoading
                    }
                  >
                    {featuringListingId === listing.id ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Setting...
                      </>
                    ) : listing.is_featured == 1 ? (
                      "Featured"
                    ) : (
                      "Set as Featured"
                    )}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">
            No listings found.
          </p>
        )}
      </div>
      {renderPagination()}
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
