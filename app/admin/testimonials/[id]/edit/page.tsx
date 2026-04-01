"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { useSingleTestimonial, useUpdateTestimonial, useDeleteTestimonial } from "@/services/testimonial/TestimonialQueries";
import {
  ArrowLeftIcon,
  TrashIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

export default function TestimonialEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const { data, isLoading, isError } = useSingleTestimonial(id);
  const testimonial = data?.data || data;
  const updateTestimonialMutation = useUpdateTestimonial();
  const deleteTestimonialMutation = useDeleteTestimonial();

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [rating, setRating] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (testimonial) {
      setName(testimonial.name || "");
      setPosition(testimonial.position || "");
      setRating(testimonial.rating ? String(testimonial.rating) : "");
      setDetails(testimonial.details || testimonial.content || "");
    }
  }, [testimonial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name,
      position: position || "",
      rating: rating || "",
      details,
      status: testimonial?.status || "active",
      upload_folder: testimonial?.upload_folder || "testimonial/testimonial",
    };
    updateTestimonialMutation.mutate(
      { id: testimonial.id, data: payload },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => {
            router.push("/admin/testimonials");
          }, 1200);
        },
        onError: (err: any) => {
          const errorMessage =
            err?.response?.data?.message || err?.message || "Failed to update testimonial. Please try again.";
          setError(errorMessage);
          console.error("Error updating testimonial:", err);
        },
      }
    );
  };

  /* ---------- loading ---------- */
  if (isLoading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
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

  /* ---------- render ---------- */
  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Edit Testimonial</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteTestimonialMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
          <Link
            href={`/admin/testimonials/${testimonial.id}`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      {/* ---- Success banner ---- */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-5 text-sm">
          Testimonial updated successfully! Redirecting...
        </div>
      )}

      {/* ---- Form Card ---- */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Two-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                placeholder="Enter full name"
              />
            </div>

            {/* Position */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-slate-700 mb-1.5">
                Position
              </label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                placeholder="e.g., CEO, TechCorp Solutions"
              />
            </div>

            {/* Rating */}
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-slate-700 mb-1.5">
                Rating
              </label>
              <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
              >
                <option value="">Select rating</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
          </div>

          {/* Details */}
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-slate-700 mb-1.5">
              Testimonial Details
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              rows={5}
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
              placeholder="Enter the testimonial content..."
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updateTestimonialMutation.isPending}
              className="px-8 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updateTestimonialMutation.isPending ? "Updating..." : "Update Testimonial"}
            </button>
          </div>
        </form>
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