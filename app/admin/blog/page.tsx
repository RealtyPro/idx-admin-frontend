"use client";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";
import { useBlogList } from "@/services/blog/BlogQueris";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBlog, BlogSearchParams } from "@/services/blog/BlogServices";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MagnifyingGlassIcon,
  MoonIcon,
  AdjustmentsHorizontalIcon,
  PlusCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  UserIcon,
  TagIcon,
  DocumentTextIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

interface Blog {
  id: string;
  title: string;
  author: string;
  publishDate: string;
  category: string;
  isFeatured: boolean;
  is_featured: string | number | boolean;
  subtitle: string;
  status: string;
  content: string;
  created_at?: string;
  image?: any;
  thumbnail?: any;
  featured_image?: any;
  cover_image?: any;
}

/* ------------------------------------------------------------------ */
/*  BlogListContent                                                    */
/* ------------------------------------------------------------------ */
function BlogListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  /* ---------- helpers ---------- */
  const capitalizeFirst = (value?: string) => {
    const text = (value || "").trim();
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getBlogImageUrl = (blog: any): string | null => {
    const imageData = blog.image || blog.thumbnail || blog.featured_image || blog.cover_image;
    if (!imageData) return null;
    if (typeof imageData === "string") {
      if (imageData.includes("/img/default/") || imageData.includes("default")) return null;
      return imageData.startsWith("http")
        ? imageData
        : `https://demorealestate2.webnapps.net/storage/${imageData}`;
    }
    if (typeof imageData === "object" && (imageData.path || imageData.url)) {
      const src = imageData.path || imageData.url;
      return src.startsWith("http")
        ? src
        : `https://demorealestate2.webnapps.net/storage/${src}`;
    }
    return null;
  };

  /* ---------- state ---------- */
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const [filters, setFilters] = useState<BlogSearchParams>({
    page: pageFromUrl,
    q: searchParams.get("q") || "",
  });
  const [activeFilters, setActiveFilters] = useState<BlogSearchParams>({
    page: pageFromUrl,
    q: searchParams.get("q") || "",
  });

  const { data: blogListDatas, isLoading, error } = useBlogList(activeFilters);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const pagination = blogListDatas?.meta || blogListDatas?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1;
  const totalItems = pagination?.total || pagination?.totalItems || blogs.length;

  useEffect(() => {
    const f: BlogSearchParams = {
      page: parseInt(searchParams.get("page") || "1", 10),
      q: searchParams.get("q") || "",
    };
    setFilters(f);
    setActiveFilters(f);
    setCurrentPage(f.page || 1);
  }, [searchParams]);

  useEffect(() => {
    if (blogListDatas && !isLoading && !error) {
      setBlogs(blogListDatas.data || blogListDatas);
    }
  }, [blogListDatas, isLoading, error]);

  /* ---------- actions ---------- */
  const buildQueryString = (f: BlogSearchParams) => {
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
    router.push(`/admin/blog?${buildQueryString(f)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    const f: BlogSearchParams = { page: 1 };
    setFilters(f);
    setActiveFilters(f);
    router.push("/admin/blog?page=1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const f = { ...filters, page };
      router.push(`/admin/blog?${buildQueryString(f)}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ---------- delete ---------- */
  const removeBlogMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloglist", activeFilters] });
      setShowDeleteModal(false);
      setDeleteId(null);
    },
    onError: (error: any) => {
      console.error("Error while deleting blog:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete blog post.";
      alert(errorMessage);
    },
  });

  /* ---------- pagination ---------- */
  const renderPagination = () => {
    if (totalPages <= 1 && !pagination) return null;
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);

    return (
      <div className="flex flex-col items-center gap-3 mt-8">
        <div className="flex items-center gap-1.5">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Previous</button>
          {startPage > 1 && (
            <>
              <button onClick={() => handlePageChange(1)} className={`w-8 h-8 text-sm rounded-lg border transition ${1 === currentPage ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}>1</button>
              {startPage > 2 && <span className="px-1 text-slate-400">...</span>}
            </>
          )}
          {pages.map((p) => (
            <button key={p} onClick={() => handlePageChange(p)} disabled={isLoading} className={`w-8 h-8 text-sm rounded-lg border transition ${p === currentPage ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}>{p}</button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
              <button onClick={() => handlePageChange(totalPages)} className={`w-8 h-8 text-sm rounded-lg border transition ${totalPages === currentPage ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}>{totalPages}</button>
            </>
          )}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Next</button>
        </div>
        {pagination && (
          <p className="text-xs text-slate-400">Page {currentPage} of {totalPages}{totalItems ? ` (${totalItems} total items)` : ""}</p>
        )}
      </div>
    );
  };

  /* ---------- loading / error ---------- */
  if (isLoading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-7 w-32" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-[300px] rounded-full" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-[110px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
        <p className="text-red-500">Error loading blog posts: {error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Blog Posts</h1>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative hidden md:flex items-center">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search blog posts... (min 3 chars)"
              value={filters.q || ""}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="w-[300px] pl-9 pr-10 py-2 text-sm rounded-full border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
            />
            <button onClick={handleSearch} className="absolute right-3 text-slate-400 hover:text-slate-600 transition">
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Add New */}
          <Link
            href="/admin/blog/create"
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <PlusCircleIcon className="w-4 h-4" />
            New Blog Post
          </Link>

          {/* Dark mode */}
          <button className="p-2 rounded-full hover:bg-white transition">
            <MoonIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* ---- Error alert ---- */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm" role="alert">
          {searchError}
        </div>
      )}

      {/* ---- Blog Cards ---- */}
      <div className="space-y-3">
        {blogs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg">No blog posts found.</p>
            <p className="text-sm mt-1">Try adjusting your search or create a new post.</p>
          </div>
        ) : (
          blogs.map((blog) => {
            const imgUrl = getBlogImageUrl(blog);
            const isFeatured = blog.is_featured === "1" || blog.is_featured === 1 || blog.is_featured === true || blog.isFeatured;
            const date = formatDate(blog.publishDate || blog.created_at);

            return (
              <div
                key={blog.id}
                className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex overflow-hidden cursor-pointer"
                onClick={() => router.push(`/admin/blog/${blog.id}`)}
              >
                {/* Thumbnail */}
                <div className="w-[200px] min-h-[130px] bg-slate-100 flex-shrink-0 relative overflow-hidden hidden sm:block">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const t = e.currentTarget;
                        t.style.display = "none";
                        const sib = t.nextElementSibling as HTMLElement | null;
                        if (sib) sib.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ display: imgUrl ? "none" : "flex" }}
                  >
                    <DocumentTextIcon className="w-10 h-10 text-slate-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-semibold text-slate-900 truncate">{blog.title}</span>

                    {/* Status badge */}
                    {blog.status && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        String(blog.status).toLowerCase() === "published"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-amber-50 text-amber-600 border border-amber-200"
                      }`}>
                        {capitalizeFirst(blog.status)}
                      </span>
                    )}

                    {/* Featured badge */}
                    {isFeatured && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-50 text-yellow-600 border border-yellow-200">
                        <StarIcon className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>

                  {blog.subtitle && (
                    <p className="text-sm text-slate-400 italic mb-2 line-clamp-1">{blog.subtitle}</p>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                    {blog.author && (
                      <span className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        {blog.author}
                      </span>
                    )}
                    {blog.category && (
                      <span className="flex items-center gap-1.5">
                        <TagIcon className="w-3.5 h-3.5 text-slate-400" />
                        {capitalizeFirst(blog.category)}
                      </span>
                    )}
                    {date && (
                      <span className="flex items-center gap-1.5">
                        <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
                        {date}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pr-5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/admin/blog/${blog.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View
                  </Link>
                  <Link
                    href={`/admin/blog/${blog.id}/edit`}
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => { setDeleteId(blog.id); setShowDeleteModal(true); }}
                    disabled={removeBlogMutation.isPending && deleteId === blog.id}
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition disabled:opacity-50"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {renderPagination()}

      {/* ---- Delete modal ---- */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete this blog post? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={removeBlogMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && removeBlogMutation.mutate(deleteId)}
              disabled={removeBlogMutation.isPending}
            >
              {removeBlogMutation.isPending ? "Deleting..." : "Delete"}
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
export default function BlogListPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-7 w-32" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-[300px] rounded-full" />
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[110px] w-full rounded-2xl" />
          ))}
        </div>
      }
    >
      <BlogListContent />
    </Suspense>
  );
}
