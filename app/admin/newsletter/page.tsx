"use client";
import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNewsletterSubscribers, useDeleteNewsletterSubscriber } from "@/services/newsletter/NewsletterQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { NewsletterSearchParams } from "@/services/newsletter/NewsletterServices";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  TrashIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";

function NewsletterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const prevSubscribersRef = useRef<any[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getEmailAcronym = (subscriber: any): string => {
    const email: string = subscriber.email || subscriber.name || "N";
    return email.slice(0, 2).toUpperCase();
  };

  const avatarColors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];

  const getAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [filters, setFilters] = useState<NewsletterSearchParams>({ page: pageFromUrl, q: searchParams.get("q") || "" });
  const [activeFilters, setActiveFilters] = useState<NewsletterSearchParams>({ page: pageFromUrl, q: searchParams.get("q") || "" });

  const { data, isLoading, isFetching, isError, error } = useNewsletterSubscribers(activeFilters);
  const deleteMutation = useDeleteNewsletterSubscriber();
  const rawSubscribers = Array.isArray(data?.data || data) ? (data?.data || data || []) : [];
  if (rawSubscribers.length > 0) prevSubscribersRef.current = rawSubscribers;
  // Only fall back to old data while a fetch is in-flight; an empty completed response should show the empty state
  const subscribers = (rawSubscribers.length === 0 && isFetching) ? prevSubscribersRef.current : rawSubscribers;
  const pagination = data?.meta || data?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1;
  const currentPageNum = pagination?.current_page || pagination?.currentPage || currentPage;
  const totalItems = pagination?.total || pagination?.totalItems || subscribers.length;

  useEffect(() => {
    const f: NewsletterSearchParams = { page: parseInt(searchParams.get("page") || "1", 10), q: searchParams.get("q") || "" };
    setFilters(f); setActiveFilters(f); setCurrentPage(f.page || 1);
  }, [searchParams]);

  const buildQueryString = (f: NewsletterSearchParams) => {
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
    router.push(`/admin/newsletter?${buildQueryString(f)}`);
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
        router.push(`/admin/newsletter?${buildQueryString(f)}`, { scroll: false });
      }, 500);
    }
  }, [filters, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearFilters = () => {
    const f: NewsletterSearchParams = { page: 1 };
    setFilters(f); setActiveFilters(f);
    router.push("/admin/newsletter?page=1");
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const f = { ...filters, page };
      router.push(`/admin/newsletter?${buildQueryString(f)}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
          <button onClick={() => handlePageChange(currentPageNum - 1)} disabled={currentPageNum === 1 || isLoading} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Previous</button>
          {startPage > 1 && (<><button onClick={() => handlePageChange(1)} className={`w-8 h-8 text-sm rounded-lg border transition ${1 === currentPageNum ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}>1</button>{startPage > 2 && <span className="px-1 text-slate-400">...</span>}</>)}
          {pages.map((p) => (<button key={p} onClick={() => handlePageChange(p)} disabled={isLoading} className={`w-8 h-8 text-sm rounded-lg border transition ${p === currentPageNum ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}>{p}</button>))}
          {endPage < totalPages && (<>{endPage < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}<button onClick={() => handlePageChange(totalPages)} className={`w-8 h-8 text-sm rounded-lg border transition ${totalPages === currentPageNum ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}>{totalPages}</button></>)}
          <button onClick={() => handlePageChange(currentPageNum + 1)} disabled={currentPageNum === totalPages || isLoading} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Next</button>
        </div>
        {pagination && <p className="text-xs text-slate-400">Page {currentPageNum} of {totalPages}{totalItems ? ` (${totalItems} total items)` : ""}</p>}
      </div>
    );
  };

  if (isLoading && prevSubscribersRef.current.length === 0) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <div className="flex justify-between items-center mb-2"><Skeleton className="h-7 w-36" /><div className="flex gap-3"><Skeleton className="h-10 w-[300px] rounded-full" /></div></div>
        {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-[90px] w-full rounded-2xl" />))}
      </div>
    );
  }

  if (isError) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto"><p className="text-red-500">Error loading subscribers: {error instanceof Error ? error.message : "Unknown error"}</p></div>);
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Top progress bar ---- */}
      <div className={`fixed top-0 left-0 right-0 z-50 h-[3px] overflow-hidden transition-opacity duration-300 ${isFetching ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="h-full bg-emerald-500 animate-[progressBar_1.2s_ease-in-out_infinite]" />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Newsletter Subscribers</h1>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:flex items-center">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 text-slate-400" />
            <input type="text" placeholder="Search subscribers... (min 3 chars)" value={filters.q || ""}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="w-[300px] pl-9 pr-10 py-2 text-sm rounded-full border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition" />
            <button onClick={handleSearch} className="absolute right-3 text-slate-400 hover:text-slate-600 transition"><AdjustmentsHorizontalIcon className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {searchError && (<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">{searchError}</div>)}

      <div className="relative">
        {isFetching && subscribers.length > 0 && (
          <div className="absolute inset-0 z-20 rounded-2xl flex items-center justify-center" style={{ animation: "overlayFadeIn 0.18s ease forwards" }}>
            <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[2px]" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Loading results…</span>
            </div>
          </div>
        )}
        <div className="space-y-3">
        {Array.isArray(subscribers) && subscribers.length === 0 && !isFetching ? (
          <div className="text-center py-16 text-slate-400"><NewspaperIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-lg">No subscribers found.</p></div>
        ) : (
          subscribers.map((s: any, idx: number) => (
            <div key={s.id} className="newsletter-card-enter bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex overflow-hidden cursor-pointer"
              style={{ animationDelay: `${idx * 60}ms` }}
              onClick={() => router.push(`/admin/newsletter/${s.id}`)}>
              <div className="w-[100px] min-h-[90px] flex-shrink-0 flex items-center justify-center hidden sm:flex">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${getAvatarColor(s.email || s.name || "")}`}>{getEmailAcronym(s)}</div>
              </div>
              <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center">
                <span className="text-[15px] font-semibold text-slate-900 truncate">{s.name || s.email || "No Name"}</span>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 mt-1">
                  {s.email && <span className="flex items-center gap-1.5"><EnvelopeIcon className="w-3.5 h-3.5 text-slate-400" />{s.email}</span>}
                  {s.created_at && <span className="flex items-center gap-1.5"><CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />{formatDate(s.created_at)}</span>}
                </div>
                {s.status && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium mt-2 w-fit ${String(s.status).toLowerCase() === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pr-5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Link href={`/admin/newsletter/${s.id}`} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                  <EyeIcon className="w-4 h-4" /> View
                </Link>
                <button onClick={() => { setDeleteId(s.id); setShowDeleteModal(true); }} disabled={deleteMutation.isPending && deleteId === s.id}
                  className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition disabled:opacity-50" title="Delete">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {renderPagination()}

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Subscriber</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete this subscriber? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers", activeFilters] }); setShowDeleteModal(false); setDeleteId(null); } }); }} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function NewsletterPage() {
  return (
    <Suspense fallback={<div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4"><div className="flex justify-between items-center mb-6"><Skeleton className="h-7 w-36" /><Skeleton className="h-10 w-[300px] rounded-full" /></div>{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-[90px] w-full rounded-2xl" />))}</div>}>
      <NewsletterContent />
    </Suspense>
  );
}