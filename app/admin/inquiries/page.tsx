"use client";
import Link from "next/link";
import React, {
  useState,
  useEffect,
  Suspense,
  useRef,
  useCallback,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useEnquiries } from "@/services/enquiry/EnquiryQueris";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/services/Api";
import { useRouter, useSearchParams } from "next/navigation";
import { EnquirySearchParams } from "@/services/enquiry/EnquiryServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MagnifyingGlassIcon,
  MoonIcon,
  AdjustmentsHorizontalIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  EyeIcon,
  TrashIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

/* ------------------------------------------------------------------ */
/*  Avatar colour palette                                              */
/* ------------------------------------------------------------------ */
const SOURCE_LABELS: Record<string, { label: string; className: string }> = {
  sell:             { label: "Sell",            className: "bg-orange-100 text-orange-700" },
  connect:          { label: "General",         className: "bg-blue-100 text-blue-700" },
  listing_tour:     { label: "Schedule Tour",   className: "bg-violet-100 text-violet-700" },
  listing_enquire:  { label: "Listing Inquire", className: "bg-cyan-100 text-cyan-700" },
  signup:           { label: "Sign Up",         className: "bg-emerald-100 text-emerald-700" },
  openhouse:        { label: "Open House",      className: "bg-amber-100 text-amber-700" },
  "idx-admin":      { label: "IDX Admin",       className: "bg-slate-100 text-slate-600" },
};

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-violet-100 text-violet-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
  "bg-orange-100 text-orange-600",
];
const pickColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
function InquiriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const prevInquiriesRef = useRef<any[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- helpers ---------- */
  const getInitials = (name?: string, email?: string) => {
    const source = name?.trim() || email?.trim() || "";
    if (!source) return "U";
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  };

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* ---------- state ---------- */
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const [filters, setFilters] = useState<EnquirySearchParams>({
    page: pageFromUrl,
    q: searchParams.get("q") || "",
  });
  const [activeFilters, setActiveFilters] = useState<EnquirySearchParams>({
    page: pageFromUrl,
    q: searchParams.get("q") || "",
  });

  const { data, isLoading, isFetching, isError, error } =
    useEnquiries(activeFilters);

  useEffect(() => {
    const f: EnquirySearchParams = {
      page: parseInt(searchParams.get("page") || "1", 10),
      q: searchParams.get("q") || "",
    };
    setFilters(f);
    setActiveFilters(f);
    setCurrentPage(f.page || 1);
  }, [searchParams]);

  const freshInquiries: any[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];
  if (freshInquiries.length > 0) prevInquiriesRef.current = freshInquiries;
  // Only fall back to old data while a fetch is in-flight; an empty completed response should show the empty state
  const inquiries =
    freshInquiries.length === 0 && isFetching
      ? prevInquiriesRef.current
      : freshInquiries;
  const pagination = data?.meta || data?.pagination || null;
  const totalPages =
    pagination?.last_page ||
    pagination?.total_pages ||
    pagination?.totalPages ||
    1;
  const currentPageNum =
    pagination?.current_page || pagination?.currentPage || currentPage;
  const totalItems =
    pagination?.total || pagination?.totalItems || inquiries.length;

  /* ---------- actions ---------- */
  const buildQueryString = (f: EnquirySearchParams) => {
    const params = new URLSearchParams();
    if (f.page) params.append("page", f.page.toString());
    if (f.q && f.q.length >= 3) params.append("q", f.q);
    return params.toString();
  };

  const handleSearch = () => {
    if (
      filters.q &&
      filters.q.trim().length > 0 &&
      filters.q.trim().length < 3
    ) {
      setSearchError("Search keyword must be at least 3 characters long");
      setTimeout(() => setSearchError(null), 3000);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const f = { ...filters, page: 1 };
    setActiveFilters(f);
    router.push(`/admin/inquiries?${buildQueryString(f)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* debounced search — 500ms */
  const handleQueryChange = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, q: value }));
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.trim() === "" || value.trim().length >= 2) {
        debounceRef.current = setTimeout(() => {
          const f = { ...filters, q: value, page: 1 };
          setActiveFilters(f);
          router.push(`/admin/inquiries?${buildQueryString(f)}`, {
            scroll: false,
          });
        }, 500);
      }
    },
    [filters, router],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearFilters = () => {
    const f: EnquirySearchParams = { page: 1 };
    setFilters(f);
    setActiveFilters(f);
    router.push("/admin/inquiries?page=1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const f = { ...filters, page };
      router.push(`/admin/inquiries?${buildQueryString(f)}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ---------- push to CRM ---------- */
  const handlePushToCRM = async (inquiry: any) => {
    try {
      const token = sessionStorage.getItem("access_token");
      if (!token) {
        toast.error("Please login to sync enquiry to CRM");
        return;
      }
      const response = await axiosInstance.post(
        `v1/admin/enquiry/sync-enquiry-to-crm/${inquiry.id}`,
        { params: { enquiry_id: inquiry.id } },
      );
      toast.success(
        response.data.message || "Enquiry successfully synced to CRM",
      );
      queryClient.invalidateQueries({ queryKey: ["enquiries", activeFilters] });
    } catch (err: any) {
      if (err.response?.status === 401)
        toast.error("Authentication failed. Please login again.");
      else
        toast.error(
          err.response?.data?.message
            ? `Failed to sync: ${err.response.data.message}`
            : "Failed to sync enquiry to CRM. Please try again.",
        );
    }
  };

  /* ---------- delete ---------- */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`v1/admin/enquiry/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enquiries", activeFilters] });
      setShowDeleteModal(false);
      setDeleteId(null);
    },
  });

  /* ---------- pagination ---------- */
  const renderPagination = () => {
    if (totalPages <= 1 && (!pagination || inquiries.length < 10)) return null;
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
            disabled={currentPageNum === 1 || isLoading}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
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
              disabled={isLoading}
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
                className={`w-8 h-8 text-sm rounded-lg border transition ${totalPages === currentPageNum ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => handlePageChange(currentPageNum + 1)}
            disabled={currentPageNum === totalPages || isLoading}
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

  /* ---------- loading / error ---------- */
  if (isLoading && prevInquiriesRef.current.length === 0) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-10 w-[340px] rounded-full" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-[100px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
        <p className="text-red-500">
          Error loading enquiries:{" "}
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
        <h1 className="text-[22px] font-semibold text-slate-900">Enquiries</h1>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative hidden md:flex items-center">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search enquiries…"
              value={filters.q || ""}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
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
            href="/admin/inquiries/create"
            className="px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            Create Enquiry
          </Link>

          {/* Dark mode */}
          <button className="p-2 rounded-full hover:bg-white transition">
            <MoonIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* ---- Error alert ---- */}
      {searchError && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm"
          role="alert"
        >
          {searchError}
        </div>
      )}

      {/* ---- Enquiry Cards ---- */}
      <div className="relative">
        {isFetching && inquiries.length > 0 && (
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
        <div className="space-y-3">
          {Array.isArray(inquiries) && inquiries.length > 0 ? (
            inquiries.map((inquiry: any, idx: number) => {
              const name = inquiry.name || inquiry.full_name || "No Name";
              const initials = getInitials(name, inquiry.email);
              const colorClass = pickColor(name);
              const date = formatDate(inquiry.date || inquiry.created_at);
              const listingId = inquiry.listingId || inquiry.listing_id;

              return (
                <div
                  key={inquiry.id}
                  className="inq-card-enter bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow px-6 py-5 flex items-center gap-4 cursor-pointer"
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => router.push(`/admin/inquiries/${inquiry.id}`)}
                >
                  {/* Avatar */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${colorClass}`}
                  >
                    {inquiry.photo || inquiry.avatar || inquiry.image ? (
                      <img
                        src={inquiry.photo || inquiry.avatar || inquiry.image}
                        alt={name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {/* Name row */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[15px] font-semibold text-slate-900">
                        {name}
                      </span>
                      {inquiry.type && SOURCE_LABELS[inquiry.type] && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${SOURCE_LABELS[inquiry.type].className}`}
                        >
                          {SOURCE_LABELS[inquiry.type].label}
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500 mb-2">
                      {inquiry.email && (
                        <span className="flex items-center gap-1.5">
                          <EnvelopeIcon className="w-3.5 h-3.5 text-slate-400" />
                          {inquiry.email}
                        </span>
                      )}
                      {date && (
                        <span className="flex items-center gap-1.5">
                          <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
                          {date}
                        </span>
                      )}
                      {listingId && (
                        <span className="flex items-center gap-1.5">
                          <DocumentTextIcon className="w-3.5 h-3.5 text-slate-400" />
                          Listing #{listingId}
                        </span>
                      )}
                    </div>

                    {/* Message preview */}
                    {(inquiry.message || inquiry.description) && (
                      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                        <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-slate-300" />
                        {inquiry.message || inquiry.description}
                      </p>
                    )}
                  </div>

                  {/* Actions + CRM */}
                  <div
                    className="hidden md:flex items-center gap-2 flex-shrink-0 self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!inquiry.crm_sync_status ||
                    inquiry.crm_sync_status === "0" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePushToCRM(inquiry);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors"
                      >
                        <CloudArrowUpIcon className="w-3.5 h-3.5" />
                        Push to CRM
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        In CRM
                      </span>
                    )}
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition disabled:opacity-50"
                    >
                      <EyeIcon className="w-4 h-4" />
                      {/* View */}
                    </Link>
                    <button
                      onClick={() => {
                        setDeleteId(inquiry.id);
                        setShowDeleteModal(true);
                      }}
                      disabled={
                        deleteMutation.isPending && deleteId === inquiry.id
                      }
                      className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition disabled:opacity-50"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : !isFetching ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg">No enquiries found.</p>
              <p className="text-sm mt-1">Try adjusting your search filters.</p>
            </div>
          ) : null}
        </div>
      </div>

      {renderPagination()}

      {/* ---- Delete modal ---- */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Enquiry</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete this enquiry? This action cannot be
            undone.
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
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page wrapper                                                       */
/* ------------------------------------------------------------------ */
export default function InquiriesPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-10 w-[340px] rounded-full" />
          </div>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full rounded-2xl" />
          ))}
        </div>
      }
    >
      <InquiriesContent />
    </Suspense>
  );
}
