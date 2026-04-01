"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { createTestimonial } from "@/services/testimonial/TestimonialServices";
import {
  ArrowLeftIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export default function TestimonialCreatePage() {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [rating, setRating] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      name,
      position: position || "",
      rating: rating || "",
      details,
      status: "active",
      upload_folder: "testimonial/testimonial",
    };
    try {
      await createTestimonial(payload);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/testimonials");
      }, 1200);
    } catch (err: any) {
      setLoading(false);
      setError(err?.response?.data?.message || err?.message || "Failed to add testimonial");
    }
  };

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Add Testimonial</h1>
        <Link
          href="/admin/testimonials"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* ---- Success banner ---- */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-5 text-sm">
          Testimonial added successfully! Redirecting...
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
              disabled={loading}
              className="px-8 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add Testimonial"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}