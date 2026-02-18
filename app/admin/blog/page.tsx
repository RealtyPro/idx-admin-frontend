"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { mockBlogs } from "@/lib/mockData";
import React from "react";
import { useBlogList } from "@/services/blog/BlogQueris";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { deleteBlog, BlogSearchParams } from "@/services/blog/BlogServices";
import { useRouter, useSearchParams } from "next/navigation";
import SearchFilters from "@/components/SearchFilters";
import { FileText } from "lucide-react";
interface Blog {
  id: string;
  title: string;
  author: string;
  publishDate: string;
  category: string;
  isFeatured: boolean;
  subtitle: string;
  status: string;
  content: string;
}

function BlogListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const capitalizeFirst = (value?: string) => {
    const text = (value || "").trim();
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // Initialize state from URL params
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Search filter states (for form inputs - updates on every keystroke)
  const [filters, setFilters] = useState<BlogSearchParams>({
    page: pageFromUrl,
    q: searchParams.get("q") || "",
  });

  // Active search filters (only updates when search is triggered - prevents API calls on every keystroke)
  const [activeFilters, setActiveFilters] = useState<BlogSearchParams>({
    page: pageFromUrl,
    q: searchParams.get("q") || "",
  });

  const { data: blogListDatas, isLoading, error } = useBlogList(activeFilters);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const queryClient = useQueryClient();
  const pagination = blogListDatas?.meta || blogListDatas?.pagination || null;
  const totalPages =
    pagination?.last_page ||
    pagination?.total_pages ||
    pagination?.totalPages ||
    1;
  const totalItems =
    pagination?.total || pagination?.totalItems || blogs.length;

  // Sync filters with URL parameters
  useEffect(() => {
    const newFilters: BlogSearchParams = {
      page: parseInt(searchParams.get("page") || "1", 10),
      q: searchParams.get("q") || "",
    };
    setFilters(newFilters);
    setActiveFilters(newFilters); // Also update active filters to trigger API call
    setCurrentPage(newFilters.page || 1);
  }, [searchParams]); // Only watch keyword to avoid loops

  const removeBlogMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(id),

    onSuccess: (data) => {
      console.log("blog deleted successfully:", data);
      alert("Blog deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["bloglist", activeFilters] });
    },
    onError: (error) => {
      console.error("Error  while loggin:", error);
    },
  });

  const buildQueryString = (newFilters: BlogSearchParams) => {
    const params = new URLSearchParams();

    if (newFilters.page) params.append("page", newFilters.page.toString());
    // Only include keyword if it's empty or has at least 3 characters
    if (newFilters.q && newFilters.q.length >= 3)
      params.append("q", newFilters.q);

    return params.toString();
  };

  const handleSearch = () => {
    // Validate keyword length
    if (
      filters.q &&
      filters.q.trim().length > 0 &&
      filters.q.trim().length < 3
    ) {
      setSearchError("Search keyword must be at least 3 characters long");
      setTimeout(() => setSearchError(null), 3000);
      return;
    }

    const newFilters = { ...filters, page: 1 }; // Reset to page 1 on new search
    setActiveFilters(newFilters); // Update active filters to trigger API call
    const queryString = buildQueryString(newFilters);
    router.push(`/admin/blog?${queryString}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    const newFilters: BlogSearchParams = { page: 1 };
    setFilters(newFilters);
    setActiveFilters(newFilters);
    router.push("/admin/blog?page=1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleKeywordClear = () => {
    const nextFilters = { ...filters, q: "" };
    setFilters(nextFilters);

    if (activeFilters.q && activeFilters.q.length >= 3) {
      const newFilters = { ...nextFilters, page: 1 };
      setActiveFilters(newFilters);
      const queryString = buildQueryString(newFilters);
      router.push(`/admin/blog?${queryString}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const hasActiveFilters = !!(filters.q && filters.q.length >= 3);
  const isKeywordValid =
    !filters.q || filters.q.length === 0 || filters.q.length >= 3;

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

  useEffect(() => {
    if (blogListDatas && !isLoading && !error) {
      setBlogs(blogListDatas.data || blogListDatas);
      console.log("blogListDatas", blogListDatas);
    }
  }, [blogListDatas, isLoading, error]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const newFilters = { ...filters, page };
      const queryString = buildQueryString(newFilters);
      router.push(`/admin/blog?${queryString}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1 && !pagination) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
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
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>

          {startPage > 1 && (
            <>
              <Button
                variant={1 === currentPage ? "default" : "outline"}
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
              variant={page === currentPage ? "default" : "outline"}
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
                variant={totalPages === currentPage ? "default" : "outline"}
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
        {pagination && (
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}{" "}
            {totalItems && `(${totalItems} total items)`}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="contain-auto py-6 px-2 sm:px-4 spx-w-2xl">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-6">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }
  const handleDelete = (id: string) => {
    removeBlogMutation.mutate(id);
  };
  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <div className="flex gap-2 items-center flex-1 justify-end">
          <SearchFilters
            className="max-w-lg"
            keyword={filters.q || ""}
            isKeywordValid={isKeywordValid}
            hasActiveFilters={hasActiveFilters}
            isLoading={isLoading}
            onKeywordChange={(value) => setFilters({ ...filters, q: value })}
            onKeywordClear={handleKeywordClear}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            renderFields={() => null}
          />
          <Button asChild>
            <Link href="/admin/blog/create">New Blog Post</Link>
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {searchError && (
        <div
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{searchError}</span>
        </div>
      )}

      {blogs.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No blog posts found.
        </div>
      ) : (
        <div className="grid gap-2">
          {blogs.map((blog) => (
            <Card
              key={blog.id}
              className="cursor-pointer"
              onClick={() => router.push(`/admin/blog/${blog.id}`)}
            >
              <CardHeader className="flex flex-row justify-between items-center p-4 gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Leading image or placeholder */}
                  <div className="flex-shrink-0">
                    {(() => {
                      const imgUrl = getBlogImageUrl(blog as any);
                      return imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={blog.title}
                          className="w-16 h-16 rounded-lg object-cover border"
                          onError={(e) => {
                            const t = e.currentTarget;
                            t.style.display = "none";
                            const sib = t.nextElementSibling as HTMLElement | null;
                            if (sib) sib.style.display = "flex";
                          }}
                        />
                      ) : null;
                    })()}
                    <div
                      className="w-16 h-16 rounded-lg bg-muted border flex items-center justify-center"
                      style={{ display: getBlogImageUrl(blog as any) ? "none" : "flex" }}
                    >
                      <FileText className="w-7 h-7 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Link
                        href={`/admin/blog/${blog.id}`}
                        className="hover:text-primary hover:underline transition-colors"
                      >
                        {blog.title}
                      </Link>
                      {blog.isFeatured && (
                        <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-[11px] text-yellow-800">
                          Featured
                        </span>
                      )}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {blog.subtitle && (
                        <div className="italic mb-1">{blog.subtitle}</div>
                      )}

                      <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                        <span>By {blog.author}</span>
                        <span className="mx-2">|</span>
                        <span>Category</span>
                        {blog.category && (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700">
                            {capitalizeFirst(blog.category)}
                          </span>
                        )}
                        <span className="mx-2">|</span>
                        <span>Status</span>
                        {blog.status && (
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 ${
                              String(blog.status).toLowerCase() === "published"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {capitalizeFirst(blog.status)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button asChild variant="default" size="sm">
                    <Link href={`/admin/blog/${blog.id}`}>View</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/blog/${blog.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(blog.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
      {renderPagination()}
    </div>
  );
}

export default function BlogListPage() {
  return (
    <Suspense
      fallback={
        <div className="contain-auto py-6 px-2 sm:px-4 spx-w-2xl">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-6">
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      }
    >
      <BlogListContent />
    </Suspense>
  );
}
