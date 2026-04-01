"use client";
import Link from "next/link";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useProperties,
  useAddFeaturedProperty,
  useRemoveFeaturedProperty,
} from "@/services/property/PropertyQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { PropertySearchParams } from "@/services/property/PropertyServices";
import {
  MagnifyingGlassIcon,
  BellIcon,
  MoonIcon,
  PlusCircleIcon,
  EyeIcon,
  PencilIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

/* ------------------------------------------------------------------ */
/*  ListingsContent                                                    */
/* ------------------------------------------------------------------ */
function ListingsContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- helpers ---------- */
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
    if (!Number.isNaN(numericValue))
      return `$${numericValue.toLocaleString("en-US")}`;
    if (priceStr.startsWith("$")) return priceStr;
    return `$${priceStr}`;
  };

  const getSqft = (listing: any) =>
    listing?.sqft ??
    listing?.square_feet ??
    listing?.squareFeet ??
    listing?.bua ??
    listing?.area;

  const getViews = (listing: any) => {
    const v = listing?.views;
    if (v === null || v === undefined || v === "null") return null;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      if (v.startsWith("[")) {
        try {
          const parsed = JSON.parse(v);
          return Array.isArray(parsed) ? parsed.length : v;
        } catch {
          return v;
        }
      }
      return v;
    }
    if (Array.isArray(v)) return v.length;
    return v;
  };

  const statusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "sold") return "bg-red-50 text-red-600 border border-red-200";
    if (s === "active")
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    if (s === "pending")
      return "bg-amber-50 text-amber-600 border border-amber-200";
    if (s === "coming soon" || s === "coming-soon")
      return "bg-blue-50 text-blue-600 border border-blue-200";
    if (s === "leased" || s === "rented" || s === "closed")
      return "bg-purple-50 text-purple-600 border border-purple-200";
    if (s === "expired")
      return "bg-gray-50 text-gray-600 border border-gray-200";
    if (s === "off market" || s === "off-market")
      return "bg-slate-50 text-slate-600 border border-slate-200";
    return "bg-slate-50 text-slate-600 border border-slate-200";
  };

  /* ---------- state ---------- */
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [featuringListingId, setFeaturingListingId] = useState<string | null>(
    null,
  );
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [featuredSuccess, setFeaturedSuccess] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<PropertySearchParams>({
    page: pageFromUrl,
    bath_min: searchParams.get("bath_min") || "",
    bath_max: searchParams.get("bath_max") || "",
    bed_min: searchParams.get("bed_min") || "",
    bed_max: searchParams.get("bed_max") || "",
    keyword: searchParams.get("keyword") || "",
  });

  const [activeFilters, setActiveFilters] = useState<PropertySearchParams>({
    page: pageFromUrl,
    bath_min: searchParams.get("bath_min") || "",
    bath_max: searchParams.get("bath_max") || "",
    bed_min: searchParams.get("bed_min") || "",
    bed_max: searchParams.get("bed_max") || "",
    keyword: searchParams.get("keyword") || "",
  });

  const { data, isLoading, isFetching, isError, error } =
    useProperties(activeFilters);
  const addFeaturedMutation = useAddFeaturedProperty();
  const removeFeaturedMutation = useRemoveFeaturedProperty();

  /* keep a ref to the last known listings so we never lose them during refetch */
  const prevListingsRef = useRef<any[]>([]);

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
    setActiveFilters(newFilters);
    setCurrentPage(newFilters.page || 1);
  }, [searchParams]);

  const freshListings: any[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];
  if (freshListings.length > 0) prevListingsRef.current = freshListings;
  // Only fall back to old data while a fetch is in-flight; an empty completed response should show the empty state
  const listings =
    freshListings.length === 0 && isFetching
      ? prevListingsRef.current
      : freshListings;
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

  /* ---------- actions ---------- */
  const buildQueryString = (f: PropertySearchParams) => {
    const params = new URLSearchParams();
    if (f.page) params.append("page", f.page.toString());
    if (f.bath_min) params.append("bath_min", f.bath_min);
    if (f.bath_max) params.append("bath_max", f.bath_max);
    if (f.bed_min) params.append("bed_min", f.bed_min);
    if (f.bed_max) params.append("bed_max", f.bed_max);
    if (f.keyword && f.keyword.length >= 3) params.append("keyword", f.keyword);
    return params.toString();
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const f = { ...filters, page };
      const qs = buildQueryString(f);
      router.push(`/admin/listings?${qs}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* debounced keyword search — fires 500ms after last keystroke */
  const handleKeywordChange = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, keyword: value }));
      if (debounceRef.current) clearTimeout(debounceRef.current);
      /* only auto-search when empty (clear) or >= 2 chars */
      if (value.trim() === "" || value.trim().length >= 2) {
        debounceRef.current = setTimeout(() => {
          const f: PropertySearchParams = {
            ...filters,
            keyword: value,
            page: 1,
          };
          setActiveFilters(f);
          const qs = buildQueryString({ ...f, keyword: value });
          router.push(`/admin/listings?${qs}`, { scroll: false });
        }, 500);
      }
    },
    [filters, router],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  /* filter fields (beds/baths) — only updates local state; search fires on Apply click */
  const handleFilterChange = useCallback(
    (field: keyof PropertySearchParams, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSearch = () => {
    if (
      filters.keyword &&
      filters.keyword.trim().length > 0 &&
      filters.keyword.trim().length < 3
    ) {
      setFeaturedError("Keyword must be at least 3 characters long");
      setTimeout(() => setFeaturedError(null), 3000);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const f = { ...filters, page: 1 };
    setActiveFilters(f);
    const qs = buildQueryString(f);
    router.push(`/admin/listings?${qs}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const f: PropertySearchParams = { page: 1 };
    setFilters(f);
    setActiveFilters(f);
    router.push("/admin/listings?page=1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleFeatured = async (
    listingId: string,
    currentlyFeatured: boolean,
  ) => {
    try {
      setFeaturingListingId(listingId);
      setFeaturedError(null);
      setFeaturedSuccess(null);
      if (currentlyFeatured) {
        await removeFeaturedMutation.mutateAsync(listingId);
      } else {
        await addFeaturedMutation.mutateAsync(listingId);
      }
      await queryClient.invalidateQueries({
        queryKey: ["properties", activeFilters],
      });
      setFeaturedSuccess(
        currentlyFeatured
          ? "Property removed from featured!"
          : "Property successfully set as featured!",
      );
      setTimeout(() => setFeaturedSuccess(null), 3000);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update featured status";
      setFeaturedError(msg);
      setTimeout(() => setFeaturedError(null), 5000);
    } finally {
      setFeaturingListingId(null);
    }
  };

  const hasActiveSearch = !!(
    activeFilters.keyword ||
    activeFilters.bed_min ||
    activeFilters.bed_max ||
    activeFilters.bath_min ||
    activeFilters.bath_max
  );

  /* ---------- pagination renderer ---------- */
  const renderPagination = () => {
    if (totalPages <= 1 && (!pagination || listings.length < 10)) return null;
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPageNum - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1)
      startPage = Math.max(1, endPage - maxVisible + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);

    return (
      <div className="flex flex-col items-center gap-3 mt-8">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(currentPageNum - 1)}
            disabled={currentPageNum === 1 || isFetching}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                disabled={isFetching}
                className={`w-8 h-8 text-sm rounded-lg border transition ${1 === currentPageNum ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-1 text-slate-400">...</span>
              )}
            </>
          )}
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              disabled={isFetching}
              className={`w-8 h-8 text-sm rounded-lg border transition ${p === currentPageNum ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}
            >
              {p}
            </button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-1 text-slate-400">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={isFetching}
                className={`w-8 h-8 text-sm rounded-lg border transition ${totalPages === currentPageNum ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => handlePageChange(currentPageNum + 1)}
            disabled={currentPageNum === totalPages || isFetching}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
        {pagination && (
          <p className="text-xs text-slate-400">
            Page {currentPageNum} of {totalPages}
            {totalItems ? ` (${totalItems} total items)` : ""}
          </p>
        )}
      </div>
    );
  };

  /* ---------- initial full-page skeleton — only when truly no data yet ---------- */
  if (isLoading && prevListingsRef.current.length === 0) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-10 w-64 rounded-full" />
        </div>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[140px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
        <p className="text-red-500">
          Error loading listings:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Top progress bar ---- */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 h-[3px] overflow-hidden transition-opacity duration-300 ${isFetching ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="h-full bg-emerald-500 animate-[progressBar_1.2s_ease-in-out_infinite]" />
      </div>

      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold text-slate-900">Listings</h1>
          {totalItems > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {totalItems} result{totalItems !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative hidden md:flex items-center">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search listings… "
              value={filters.keyword || ""}
              onChange={(e) => handleKeywordChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="w-[360px] pl-9 pr-10 py-2 text-sm rounded-full border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200"
            />
            {filters.keyword ? (
              <button
                onClick={() => handleKeywordChange("")}
                className="absolute right-9 text-slate-300 hover:text-slate-500 transition"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 transition ${showFilters ? "text-emerald-500" : "text-slate-400 hover:text-slate-600"}`}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Bell */}
          <button className="relative p-2 rounded-full hover:bg-white transition">
            <BellIcon className="w-5 h-5 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {/* Dark mode */}
          <button className="p-2 rounded-full hover:bg-white transition">
            <MoonIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* ---- Expanded filter panel ---- */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? "max-h-60 opacity-100 mb-5" : "max-h-0 opacity-0"}`}
      >
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Min Beds
              </label>
              <input
                type="number"
                min="0"
                value={filters.bed_min || ""}
                onChange={(e) => handleFilterChange("bed_min", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Max Beds
              </label>
              <input
                type="number"
                min="0"
                value={filters.bed_max || ""}
                onChange={(e) => handleFilterChange("bed_max", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
                placeholder="Any"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Min Baths
              </label>
              <input
                type="number"
                min="0"
                value={filters.bath_min || ""}
                onChange={(e) => handleFilterChange("bath_min", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Max Baths
              </label>
              <input
                type="number"
                min="0"
                value={filters.bath_max || ""}
                onChange={(e) => handleFilterChange("bath_max", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
                placeholder="Any"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSearch}
              disabled={isFetching}
              className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* ---- Active filter chips ---- */}
      {hasActiveSearch && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-slate-400">Active filters:</span>
          {activeFilters.keyword && (
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
              "{activeFilters.keyword}"
              <button
                onClick={() => handleKeywordChange("")}
                className="hover:text-emerald-900 ml-0.5"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {(activeFilters.bed_min || activeFilters.bed_max) && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
              Beds: {activeFilters.bed_min || "0"}–
              {activeFilters.bed_max || "∞"}
              <button
                onClick={() => {
                  handleFilterChange("bed_min", "");
                  handleFilterChange("bed_max", "");
                }}
                className="hover:text-blue-900 ml-0.5"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          {(activeFilters.bath_min || activeFilters.bath_max) && (
            <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full">
              Baths: {activeFilters.bath_min || "0"}–
              {activeFilters.bath_max || "∞"}
              <button
                onClick={() => {
                  handleFilterChange("bath_min", "");
                  handleFilterChange("bath_max", "");
                }}
                className="hover:text-purple-900 ml-0.5"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="text-xs text-slate-400 hover:text-slate-600 underline transition"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ---- Success / Error Alerts ---- */}
      {featuredSuccess && (
        <div
          className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-5 text-sm"
          role="alert"
        >
          {featuredSuccess}
        </div>
      )}
      {featuredError && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm"
          role="alert"
        >
          {featuredError}
        </div>
      )}

      {/* ---- Listing Cards ---- */}
      <div className="relative">
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateX(-60px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          .listing-card-enter {
            animation: fadeSlideIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          @keyframes overlayFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `}</style>

        {/* Smooth frosted overlay while fetching new results (previous data stays visible) */}
        {isFetching && listings.length > 0 && (
          <div
            className="absolute inset-0 z-20 rounded-2xl flex items-center justify-center"
            style={{ animation: "overlayFadeIn 0.18s ease forwards" }}
          >
            <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[2px]" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">
                Loading results…
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {Array.isArray(listings) && listings.length > 0 ? (
            listings.map((listing: any, idx: number) => {
              const views = getViews(listing);
              const sqft = getSqft(listing);
              return (
                <div
                  key={listing.id}
                  className="listing-card-enter bg-white rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow flex overflow-hidden group cursor-pointer"
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() =>
                    router.push(
                      `/admin/listings/${listing.id}?from_page=${currentPage}`,
                    )
                  }
                >
                  {/* Image */}
                  <div className="relative w-[200px] min-h-[160px] max-h-[180px] flex-shrink-0 overflow-hidden">
                    <img
                      src={getListingImage(listing)}
                      alt={
                        listing.title ||
                        listing.name ||
                        listing.address ||
                        `Listing ${listing.id}`
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {listing.mls_listingkey && (
                      <span className="absolute top-2 left-2 bg-slate-800/70 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                        ID: {listing.mls_listingkey}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-5 flex items-center justify-between min-w-0">
                    <div className="min-w-0 flex-1 pr-6">
                      {/* Title + Status */}
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3 className="text-[15px] font-semibold text-slate-900 truncate max-w-[420px]">
                          {listing.title ||
                            listing.name ||
                            listing.address ||
                            `Listing ${listing.id}`}
                        </h3>
                        {listing.status && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusBadge(listing.status)}`}
                          >
                            {listing.status}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      {listing.price && (
                        <p className="text-lg font-bold text-emerald-500 mb-3">
                          {formatPrice(listing.price)}
                        </p>
                      )}

                      {/* Meta: beds / baths / sqft / views */}
                      <div className="flex items-center gap-5 text-xs text-slate-500">
                        {listing.beds !== undefined &&
                          listing.beds !== null && (
                            <span className="flex items-center gap-1.5">
                              <svg
                                className="w-4 h-4 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                                />
                              </svg>
                              <span>
                                <span className="font-medium text-slate-700">
                                  {listing.beds}
                                </span>{" "}
                                {listing.beds === 1 ? "Bed" : "Beds"}
                              </span>
                            </span>
                          )}
                        {listing.baths !== undefined &&
                          listing.baths !== null && (
                            <span className="flex items-center gap-1.5">
                              <svg
                                className="w-4 h-4 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>
                                <span className="font-medium text-slate-700">
                                  {listing.baths}
                                </span>{" "}
                                Baths
                              </span>
                            </span>
                          )}
                        {sqft && (
                          <span className="flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                              />
                            </svg>
                            <span>
                              <span className="font-medium text-slate-700">
                                {sqft}
                              </span>{" "}
                              Sqft
                            </span>
                          </span>
                        )}
                        {views !== null && (
                          <span className="flex items-center gap-1.5">
                            <EyeIcon className="w-4 h-4 text-slate-400" />
                            <span>
                              <span className="font-medium text-slate-700">
                                {views}
                              </span>{" "}
                              Views
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      className="flex items-center gap-2 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/listings/${listing.id}?from_page=${currentPage}`,
                          )
                        }
                        className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition"
                        title="Preview"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleToggleFeatured(
                            listing.id,
                            listing.is_featured == 1,
                          )
                        }
                        disabled={
                          featuringListingId === listing.id || isFetching
                        }
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                          listing.is_featured == 1
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            : "border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                        }`}
                      >
                        {featuringListingId === listing.id ? (
                          <span className="flex items-center gap-1.5">
                            <svg
                              className="animate-spin h-3.5 w-3.5"
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
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Updating...
                          </span>
                        ) : listing.is_featured == 1 ? (
                          <span className="flex items-center gap-1.5">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Remove Featured
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                              />
                            </svg>
                            Add Featured
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : !isFetching ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg">No listings found.</p>
              <p className="text-sm mt-1">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {renderPagination()}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page wrapper (with Suspense for useSearchParams)                   */
/* ------------------------------------------------------------------ */
export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-5">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[140px] w-full rounded-2xl" />
          ))}
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
