"use client";

import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowTopRightOnSquareIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOpenHouses } from "@/services/open-house/OpenHouseQueries";
import { deleteOpenHouse } from "@/services/open-house/OpenHouseServices";

interface OpenHouseLike {
  id: string;
  title?: string;
  name?: string;
  status?: string;
  event_date?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  time?: string;
  listing_details?: any;
  property?: {
    title?: string;
    name?: string;
    address?: string;
  };
  property_title?: string;
  property_name?: string;
  description?: string;
}

const formatDate = (dateValue?: string) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timeValue?: string) => {
  if (!timeValue) return "";
  const [hour, minute] = timeValue.split(":");
  if (!hour || !minute) return timeValue;

  const hh = Number(hour);
  const suffix = hh >= 12 ? "PM" : "AM";
  const displayHour = hh % 12 || 12;
  return `${displayHour}:${minute.slice(0, 2)} ${suffix}`;
};

const getStatusClass = (status?: string) => {
  const normalized = String(status || "").toLowerCase();
  if (["active", "available"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-600 border border-emerald-200";
  }
  if (normalized === "scheduled") {
    return "bg-blue-50 text-blue-600 border border-blue-200";
  }
  if (["expired", "closed", "inactive", "cancelled"].includes(normalized)) {
    return "bg-amber-50 text-amber-600 border border-amber-200";
  }
  return "bg-slate-50 text-slate-600 border border-slate-200";
};

const getCoverPhotoUrl = (listingDetails?: any) => {
  const coverPhoto = listingDetails?.cover_photo;
  if (!coverPhoto) return null;

  if (typeof coverPhoto === "string") {
    return coverPhoto.startsWith("http")
      ? coverPhoto
      : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${coverPhoto}`;
  }

  if (Array.isArray(coverPhoto) && coverPhoto.length > 0) {
    const first = coverPhoto[0];
    if (typeof first === "string") {
      return first.startsWith("http")
        ? first
        : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${first}`;
    }
    if (first && typeof first === "object" && "path" in first) {
      const path = String((first as { path?: string }).path || "");
      if (!path) return null;
      return path.startsWith("http")
        ? path
        : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${path}`;
    }
  }

  if (coverPhoto && typeof coverPhoto === "object" && "path" in coverPhoto) {
    const path = String((coverPhoto as { path?: string }).path || "");
    if (!path) return null;
    return path.startsWith("http")
      ? path
      : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${path}`;
  }

  return null;
};

export default function OpenHousesListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userUuid, setUserUuid] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isError, error, isFetching } = useOpenHouses({
    page: currentPage,
    keyword: activeKeyword,
  });

  const handleSearch = useCallback(() => {
    const trimmed = keyword.trim();
    if (trimmed.length > 0 && trimmed.length < 3) {
      setSearchError("Search keyword must be at least 3 characters long");
      setTimeout(() => setSearchError(null), 3000);
      return;
    }

    setCurrentPage(1);
    setActiveKeyword(trimmed);
  }, [keyword]);

  const handleQueryChange = useCallback((value: string) => {
    setKeyword(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim() === "" || value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        setCurrentPage(1);
        setActiveKeyword(value.trim());
      }, 500);
    }
  }, []);

  useEffect(() => {
    setUserUuid(sessionStorage.getItem("user_uuid") || "");
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const openHouses = useMemo(() => {
    if (Array.isArray((data as { data?: unknown[] })?.data)) {
      return (data as { data: OpenHouseLike[] }).data;
    }
    if (Array.isArray(data)) return data as OpenHouseLike[];
    return [] as OpenHouseLike[];
  }, [data]);

  const pagination =
    (
      data as {
        meta?: { [key: string]: number | string };
        pagination?: { [key: string]: number | string };
      }
    )?.meta ||
    (
      data as {
        meta?: { [key: string]: number | string };
        pagination?: { [key: string]: number | string };
      }
    )?.pagination ||
    null;

  const totalPages = Number(
    pagination?.last_page || pagination?.total_pages || 1,
  );
  const currentPageNum = Number(pagination?.current_page || currentPage);
  const totalItems = Number(
    pagination?.total || pagination?.totalItems || openHouses.length,
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOpenHouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-houses"] });
      setShowDeleteModal(false);
      setDeleteId(null);
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to delete open house event.";
      alert(message);
    },
  });

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;

    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, currentPageNum - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return (
      <div className="flex flex-col items-center gap-3 mt-8">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(currentPageNum - 1)}
            disabled={currentPageNum === 1 || isLoading || isFetching}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>

          {start > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className={`w-8 h-8 text-sm rounded-lg border transition ${
                  currentPageNum === 1
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "border-slate-200 text-slate-600 hover:bg-white"
                }`}
              >
                1
              </button>
              {start > 2 && <span className="px-1 text-slate-400">...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={isLoading || isFetching}
              className={`w-8 h-8 text-sm rounded-lg border transition ${
                page === currentPageNum
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "border-slate-200 text-slate-600 hover:bg-white"
              }`}
            >
              {page}
            </button>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && (
                <span className="px-1 text-slate-400">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`w-8 h-8 text-sm rounded-lg border transition ${
                  currentPageNum === totalPages
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "border-slate-200 text-slate-600 hover:bg-white"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(currentPageNum + 1)}
            disabled={currentPageNum === totalPages || isLoading || isFetching}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Page {currentPageNum} of {totalPages}
          {totalItems ? ` (${totalItems} total)` : ""}
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-9 w-40" />
        </div>
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-[100px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
        <p className="text-red-500">
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">
          Open Houses
        </h1>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:flex items-center">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 text-slate-400" />
            <Input
              type="text"
              placeholder="Search open houses..."
              value={keyword}
              onChange={(event) => handleQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              className="w-[340px] pl-9 pr-10 py-2 text-sm rounded-full border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 text-slate-400 hover:text-slate-600 transition"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/admin/open-houses/create"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Create New Open House
          </Link>
        </div>
      </div>

      {searchError && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm"
          role="alert"
        >
          {searchError}
        </div>
      )}

      <div className="space-y-3">
        {Array.isArray(openHouses) && openHouses.length > 0 ? (
          openHouses.map((openHouse) => {
            const listingDetails = openHouse.listing_details || {};
            const listingCoverPhoto = getCoverPhotoUrl(listingDetails);
            const eventName =
              openHouse.title ||
              openHouse.name ||
              `Open House MLS-${listingDetails?.ListingKey || openHouse.id}`;
            const dateValue = openHouse.event_date || openHouse.date || "";
            const timeFrom = openHouse.start_time || openHouse.time || "";
            const timeTo = openHouse.end_time || "";
            const propertyName =
              openHouse.property?.title ||
              openHouse.property?.name ||
              openHouse.property_title ||
              openHouse.property_name ||
              listingDetails?.address ||
              "Property details not linked";
            const propertyLocation =
              openHouse.property?.address ||
              listingDetails?.address ||
              listingDetails?.location ||
              "";
            const fallbackQuery = new URLSearchParams({
              eventName,
              propertyTitle: propertyName,
              propertyLocation: String(propertyLocation),
              price: String(listingDetails?.price || ""),

              propertyId: String(
                listingDetails?.id ||
                  (openHouse.property as { id?: string })?.id ||
                  "",
              ),
              mlsAgentId: userUuid,
            }).toString();

            return (
              <div
                key={openHouse.id}
                className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex overflow-hidden cursor-pointer"
                onClick={() =>
                  router.push(`/admin/open-houses/${openHouse.id}`)
                }
              >
                <div className="w-[120px] min-h-[100px] flex-shrink-0 hidden sm:flex items-center justify-center bg-emerald-50 text-emerald-700">
                  {listingCoverPhoto ? (
                    <img
                      src={listingCoverPhoto}
                      alt={propertyName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CalendarDaysIcon className="w-9 h-9 opacity-70" />
                  )}
                </div>

                <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center">
                  {/* Name row with badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-semibold text-slate-900 truncate">
                      {eventName}
                    </span>
                    {openHouse.status && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${getStatusClass(openHouse.status)}`}
                      >
                        {openHouse.status}
                      </span>
                    )}
                    {(listingDetails?.property_type ||
                      listingDetails?.PropertyType ||
                      listingDetails?.PropertySubType) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0">
                        {listingDetails.property_type ||
                          listingDetails.PropertyType ||
                          listingDetails.PropertySubType}
                      </span>
                    )}
                  </div>

                  {/* Property name */}
                  <p className="text-[12px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    {propertyName}
                  </p>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                    {dateValue && (
                      <span className="flex items-center gap-1">
                        <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(dateValue)}
                      </span>
                    )}
                    {timeFrom && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                        {formatTime(timeFrom)}
                        {timeTo ? ` - ${formatTime(timeTo)}` : ""}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 pr-5 flex-shrink-0"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Link
                    href={`/open-houses/${openHouse.id}?${fallbackQuery}`}
                    target="_blank"
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition"
                    title="Open Public Page"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/open-houses/${openHouse.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View
                  </Link>
                  <Link
                    href={`/admin/open-houses/${openHouse.id}?mode=edit`}
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition"
                    title="Edit"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      setDeleteId(openHouse.id);
                      setShowDeleteModal(true);
                    }}
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 text-slate-400">
            <HomeModernIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg">No open house events found.</p>
          </div>
        )}
      </div>

      {renderPagination()}

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Open House</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete this open house event? This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
