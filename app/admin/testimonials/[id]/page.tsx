"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { useSingleTestimonial, useDeleteTestimonial } from "@/services/testimonial/TestimonialQueries";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarDaysIcon,
  StarIcon,
  BriefcaseIcon,
  ChatBubbleLeftIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

export default function TestimonialsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const { data, isLoading, isError } = useSingleTestimonial(id);
  const testimonial = data?.data || data;
  const deleteTestimonialMutation = useDeleteTestimonial();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`w-5 h-5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`}
          />
        ))}
      </div>
    );
  };

  const getAcronym = (name: string): string => {
    return (name || "N")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  };

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
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  /* ---------- error ---------- */
  if (isError || !testimonial) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <ChatBubbleLeftIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Testimonial Not Found</h2>
          <p className="text-sm text-slate-400 mb-4">The testimonial you are looking for does not exist.</p>
          <Link
            href="/admin/testimonials"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Testimonials
          </Link>
        </div>
      </div>
    );
  }

  const ratingNum = testimonial.rating ? parseInt(testimonial.rating) : 0;

  /* ---------- render ---------- */
  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900 truncate pr-4">
          {testimonial.name || "Testimonial Details"}
        </h1>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/admin/testimonials/${testimonial.id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteTestimonialMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
          <Link
            href="/admin/testimonials"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* ---- Main Content ---- */}
        <div className="lg:col-span-8 space-y-5">
          {/* Testimonial Content */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-4">
              <ChatBubbleLeftIcon className="w-5 h-5 text-slate-400" />
              <h2 className="text-base font-semibold text-slate-900">Testimonial</h2>
            </div>

            {/* Avatar + Name header */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
                {getAcronym(testimonial.name)}
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">{testimonial.name}</p>
                {testimonial.position && (
                  <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <BriefcaseIcon className="w-3.5 h-3.5" />
                    {testimonial.position}
                  </p>
                )}
              </div>
            </div>

            {testimonial.details || testimonial.content ? (
              <blockquote className="text-slate-600 leading-relaxed whitespace-pre-wrap italic border-l-4 border-emerald-300 pl-4">
                &ldquo;{testimonial.details || testimonial.content}&rdquo;
              </blockquote>
            ) : (
              <p className="text-sm text-slate-400 italic">No testimonial content available</p>
            )}
          </div>
        </div>

        {/* ---- Sidebar ---- */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-900">Details</h2>

            {/* Status */}
            {testimonial.status && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    String(testimonial.status).toLowerCase() === "active"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-amber-50 text-amber-600 border border-amber-200"
                  }`}
                >
                  <CheckBadgeIcon className="w-3.5 h-3.5 mr-1" />
                  {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1).toLowerCase()}
                </span>
              </div>
            )}

            {/* Rating */}
            {ratingNum > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Rating</p>
                {renderStars(ratingNum)}
              </div>
            )}

            {/* Name */}
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Name</p>
              <span className="flex items-center gap-1.5 text-sm text-slate-700">
                <UserIcon className="w-4 h-4 text-slate-400" />
                {testimonial.name}
              </span>
            </div>

            {/* Position */}
            {testimonial.position && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Position</p>
                <span className="flex items-center gap-1.5 text-sm text-slate-700">
                  <BriefcaseIcon className="w-4 h-4 text-slate-400" />
                  {testimonial.position}
                </span>
              </div>
            )}

            {/* Date */}
            {(testimonial.date || testimonial.created_at) && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Date</p>
                <span className="flex items-center gap-1.5 text-sm text-slate-700">
                  <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                  {formatDate(testimonial.date || testimonial.created_at)}
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
                deleteTestimonialMutation.mutate(testimonial.id, {
                  onSuccess: () => {
                    setShowDeleteModal(false);
                    router.push("/admin/testimonials");
                  },
                  onError: (err: any) => {
                    console.error("Error deleting testimonial:", err);
                    alert(err?.response?.data?.message || err?.message || "Failed to delete testimonial");
                  },
                });
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