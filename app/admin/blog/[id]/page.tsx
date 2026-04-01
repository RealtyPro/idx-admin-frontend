"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState } from "react";
import { useSingleBlog } from "@/services/blog/BlogQueris";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBlog } from "@/services/blog/BlogServices";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarDaysIcon,
  TagIcon,
  StarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function BlogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: blogData, isLoading, error } = useSingleBlog({ id: params.id as string });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const blog = blogData?.data || blogData;

  const deleteBlogMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloglist"] });
      router.push("/admin/blog");
    },
    onError: (error: any) => {
      console.error("Error while deleting blog:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete blog post.";
      alert(errorMessage);
    },
  });

  const getImageUrl = () => {
    if (!blog?.image) return null;
    if (typeof blog.image === "string") {
      return blog.image.startsWith("http")
        ? blog.image
        : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/image/local/original/${blog.image}`;
    }
    if (typeof blog.image === "object" && blog.image.path) {
      return blog.image.path.startsWith("http")
        ? blog.image.path
        : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/image/local/original/${blog.image.path}`;
    }
    return null;
  };

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const capitalizeFirst = (value?: string) => {
    const text = (value || "").trim();
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const imageUrl = getImageUrl();
  const isFeatured = blog?.is_featured === "1" || blog?.is_featured === 1 || blog?.is_featured === true;

  /* ---------- loading ---------- */
  if (isLoading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-[360px] w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  /* ---------- error ---------- */
  if (error || !blog) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <DocumentTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Blog Not Found</h2>
          <p className="text-sm text-slate-400 mb-4">The blog post you are looking for does not exist.</p>
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Blog List
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900 truncate pr-4">{blog.title || "Blog Post"}</h1>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/admin/blog/${params.id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteBlogMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
          <Link
            href="/admin/blog"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* ---- Main Content ---- */}
        <div className={imageUrl ? "lg:col-span-8 space-y-5" : "lg:col-span-12 space-y-5"}>
          {/* Image */}
          {imageUrl && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <img
                src={imageUrl}
                alt={blog.title}
                className="w-full h-[360px] object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Subtitle */}
          {blog.subtitle && (
            <p className="text-base italic text-slate-400 -mt-2">{blog.subtitle}</p>
          )}

          {/* Content */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-4">
              <DocumentTextIcon className="w-5 h-5 text-slate-400" />
              <h2 className="text-base font-semibold text-slate-900">Content</h2>
            </div>
            {blog.content ? (
              <div
                className="prose prose-sm sm:prose lg:prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-emerald-600"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            ) : (
              <p className="text-sm text-slate-400 italic">No content available</p>
            )}
          </div>
        </div>

        {/* ---- Sidebar ---- */}
        <div className={imageUrl ? "lg:col-span-4" : "lg:col-span-12"}>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-900">Details</h2>

            {/* Status & Featured */}
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  blog.status === "published"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-amber-50 text-amber-600 border border-amber-200"
                }`}>
                  {capitalizeFirst(blog.status) || "Draft"}
                </span>
                {isFeatured && (
                  <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600 border border-yellow-200">
                    <StarIcon className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Category */}
            {blog.category && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Category</p>
                <span className="flex items-center gap-1.5 text-sm text-slate-700">
                  <TagIcon className="w-4 h-4 text-slate-400" />
                  {capitalizeFirst(blog.category)}
                </span>
              </div>
            )}

            {/* Author */}
            {blog.author && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Author</p>
                <span className="flex items-center gap-1.5 text-sm text-slate-700">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  {blog.author}
                </span>
              </div>
            )}

            {/* Publish Date */}
            {blog.publishDate && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Published</p>
                <span className="flex items-center gap-1.5 text-sm text-slate-700">
                  <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                  {formatDate(blog.publishDate)}
                </span>
              </div>
            )}

            {/* Created At */}
            {blog.created_at && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Created</p>
                <span className="flex items-center gap-1.5 text-sm text-slate-700">
                  <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                  {formatDate(blog.created_at)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Delete modal ---- */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete this blog post? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteBlogMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteBlogMutation.mutate(params.id as string)}
              disabled={deleteBlogMutation.isPending}
            >
              {deleteBlogMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}