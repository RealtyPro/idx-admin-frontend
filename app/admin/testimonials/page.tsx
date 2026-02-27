"use client";
import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTestimonials, useDeleteTestimonial } from "@/services/testimonial/TestimonialQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { TestimonialSearchParams } from "@/services/testimonial/TestimonialServices";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlusCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

/* ------------------------------------------------------------------ */
/*  TestimonialsListContent                                            */
/* ------------------------------------------------------------------ */
function TestimonialsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const prevTestimonialsRef = useRef<any[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- helpers ---------- */
  const getAcronym = (t: any): string => {
    const label: string = t.name || t.email || "N";
    return label
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0].toUpperCase())
      .join("");
  };

  const avatarColors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
  ];

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const renderStars = (rating: number) => {
    return (
      <span className="inline-flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`w-3.5 h-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`}
          />
        ))}
      </span>
    );
  };

  /* ---------- state ---------- */
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const [filters, setFilters] = useState<TestimonialSearchParams>({
    page: pageFromUrl,
    q: searchParams.get("q") || "",
  });
  const [activeFilters, setActiveFilters] = useState<TestimonialSearchParams>({
    page: pageFromUrl,
    q: searchParams.get("q") || "",
  });

  const { data, isLoading, isFetching, isError, error } = useTestimonials(activeFilters);
  const deleteTestimonialMutation = useDeleteTestimonial();

  useEffect(() => {
    const f: TestimonialSearchParams = {
      page: parseInt(searchParams.get("page") || "1", 10),
      q: searchParams.get("q") || "",
    };
    setFilters(f);
    setActiveFilters(f);
    setCurrentPage(f.page || 1);
  }, [searchParams]);

  /* ---------- actions ---------- */
  const buildQueryString = (f: TestimonialSearchParams) => {
    const params = new URLSearchParams();
    if (f.page) params.append("page", f.page.toString());
    if (f.q && f.q.length >= 3) params.append("q", f.q);
    return params.toString();
  };

  const handleSearch = () => {
    if (filters.q && filters.q.trim().length > 0 && filters.q.trim().length < 3) {
      setSearchError("Search keyword must be at least 3 characters long");
      setTimeout(() => setSearchError(null), 3000);
      return;
    }
    const f = { ...filters, page: 1 };
    setActiveFilters(f);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push(`/admin/testimonials?${buildQueryString(f)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* debounced search — 500ms */
  const handleQueryChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, q: value }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim() === "" || value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        const f = { ...filters, q: value, page: 1 };
        setActiveFilters(f);
        router.push(`/admin/testimonials?${buildQueryString(f)}`, { scroll: false });
      }, 500);
    }
  }, [filters, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearFilters = () => {
    const f: TestimonialSearchParams = { page: 1 };
    setFilters(f);
    setActiveFilters(f);
    router.push("/admin/testimonials?page=1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const f = { ...filters, page };
      router.push(`/admin/testimonials?${buildQueryString(f)}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ---------- pagination data ---------- */
  const rawTestimonials = Array.isArray(data?.data || data) ? (data?.data || data || []) : [];
  if (rawTestimonials.length > 0) prevTestimonialsRef.current = rawTestimonials;
  // Only fall back to old data while a fetch is in-flight; an empty completed response should show the empty state
  const displayTestimonials = (rawTestimonials.length === 0 && isFetching) ? prevTestimonialsRef.current : rawTestimonials;
  const testimonials = displayTestimonials;
  const pagination = data?.meta || data?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1;
  const currentPageNum = pagination?.current_page || pagination?.currentPage || currentPage;
  const totalItems = pagination?.total || pagination?.totalItems || testimonials.length;

  /* ---------- pagination renderer ---------- */
  const renderPagination = () => {
    if (totalPages <= 1 && !pagination) return null;
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPageNum - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
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
              {startPage > 2 && <span className="px-1 text-slate-400">...</span>}
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
              {endPage < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
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

  /* ---------- loading ---------- */
  if (isLoading && prevTestimonialsRef.current.length === 0) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-7 w-36" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-[300px] rounded-full" />
            <Skeleton className="h-10 w-44 rounded-full" />
          </div>
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
          Error loading testimonials: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Top progress bar ---- */}
      <div className={`fixed top-0 left-0 right-0 z-50 h-[3px] overflow-hidden transition-opacity duration-300 ${isFetching ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="h-full bg-emerald-500 animate-[progressBar_1.2s_ease-in-out_infinite]" />
      </div>
      <style>{`
        @keyframes progressBar { 0% { transform: translateX(-100%); } 50% { transform: translateX(0%); width: 70%; } 100% { transform: translateX(100%); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); } }
        .testimonial-card-enter { animation: fadeSlideIn 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @keyframes overlayFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Testimonials</h1>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative hidden md:flex items-center">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search testimonials…"
              value={filters.q || ""}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="w-[300px] pl-9 pr-10 py-2 text-sm rounded-full border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
            />
            <button onClick={handleSearch} className="absolute right-3 text-slate-400 hover:text-slate-600 transition">
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Add New */}
          <Link
            href="/admin/testimonials/create"
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <PlusCircleIcon className="w-4 h-4" />
            New Testimonial
          </Link>
        </div>
      </div>

      {/* ---- Error alert ---- */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm" role="alert">
          {searchError}
        </div>
      )}

      {/* ---- Testimonial Cards ---- */}
      <div className="relative">
        {isFetching && displayTestimonials.length > 0 && (
          <div className="absolute inset-0 z-20 rounded-2xl flex items-center justify-center" style={{ animation: "overlayFadeIn 0.18s ease forwards" }}>
            <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[2px]" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Loading results…</span>
            </div>
          </div>
        )}
        <div className="space-y-3">
        {Array.isArray(displayTestimonials) && displayTestimonials.length === 0 && !isFetching ? (
          <div className="text-center py-16 text-slate-400">
            <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg">No testimonials found.</p>
            <p className="text-sm mt-1">Try adjusting your search or add a new testimonial.</p>
          </div>
        ) : (
          displayTestimonials.map((t: any, idx: number) => {
            const date = formatDate(t.date || t.created_at);
            const ratingNum = t.rating ? parseInt(t.rating) : 0;

            return (
              <div
                key={t.id}
                className="testimonial-card-enter bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex overflow-hidden cursor-pointer"
                style={{ animationDelay: `${idx * 60}ms` }}
                onClick={() => router.push(`/admin/testimonials/${t.id}`)}
              >
                {/* Avatar */}
                <div className="w-[100px] min-h-[110px] flex-shrink-0 flex items-center justify-center hidden sm:flex">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${getAvatarColor(t.name || "")}`}>
                    {getAcronym(t)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-semibold text-slate-900 truncate">{t.name}</span>

                    {/* Status badge */}
                    {t.status && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          String(t.status).toLowerCase() === "active"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}
                      >
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase()}
                      </span>
                    )}

                    {/* Rating */}
                    {ratingNum > 0 && renderStars(ratingNum)}
                  </div>

                  {t.position && (
                    <p className="text-sm text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <BriefcaseIcon className="w-3.5 h-3.5 text-slate-400" />
                      {t.position}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                    {date && (
                      <span className="flex items-center gap-1.5">
                        <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
                        {date}
                      </span>
                    )}
                  </div>

                  {/* Review preview */}
                  {(t.details || t.content) && (
                    <p className="text-sm text-slate-400 italic mt-2 line-clamp-1">
                      &ldquo;{t.details || t.content}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pr-5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/admin/testimonials/${t.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View
                  </Link>
                  <Link
                    href={`/admin/testimonials/${t.id}/edit`}
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      setDeleteId(t.id);
                      setShowDeleteModal(true);
                    }}
                    disabled={deleteTestimonialMutation.isPending && deleteId === t.id}
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition disabled:opacity-50"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}        </div>      </div>

      {renderPagination()}

      {/* ---- Delete modal ---- */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Testimonial</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete this testimonial? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteTestimonialMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteId) {
                  deleteTestimonialMutation.mutate(deleteId, {
                    onSuccess: () => {
                      queryClient.invalidateQueries({ queryKey: ["testimonials", activeFilters] });
                      setShowDeleteModal(false);
                      setDeleteId(null);
                    },
                    onError: (err: any) => {
                      console.error("Error deleting testimonial:", err);
                      alert(err?.response?.data?.message || err?.message || "Failed to delete testimonial");
                    },
                  });
                }
              }}
              disabled={deleteTestimonialMutation.isPending}
            >
              {deleteTestimonialMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page wrapper                                                       */
/* ------------------------------------------------------------------ */
export default function TestimonialsListPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-7 w-36" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-[300px] rounded-full" />
              <Skeleton className="h-10 w-44 rounded-full" />
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full rounded-2xl" />
          ))}
        </div>
      }
    >
      <TestimonialsListContent />
    </Suspense>
  );
}