"use client";

import axios from "axios";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDaysIcon,
  ClockIcon,
  HomeModernIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Bath, BedDouble, Ruler, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/services/Api";
import {
  usePublicSingleOpenHouse,
  useUpdateOpenHouse,
} from "@/services/open-house/OpenHouseQueries";

type OpenHouseProperty = {
  id?: string | number;
  title?: string;
  name?: string;
  address?: string;
  location?: string;
  price?: string | number;
  bed?: string | number;
  beds?: string | number;
  bath?: string | number;
  baths?: string | number;
  sqft?: string | number;
  bua?: string | number;
  cover_photo?: unknown;
  images?: unknown;
  image?: unknown;
  photo?: unknown;
  [key: string]: unknown;
};

type OpenHouseDetails = {
  id: string;
  title?: string;
  name?: string;
  status?: string;
  event_date?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  time?: string;
  property_id?: string;
  listing_details?: OpenHouseProperty;
  property?: OpenHouseProperty;
  [key: string]: unknown;
};

type EnquiryForm = {
  name: string;
  email: string;
  phone: string;
  comments: string;
  planningToBuy: string;
};

const PLANNING_OPTIONS = ["Now", "0 to 6 months", "6+ months"];

const initialForm: EnquiryForm = {
  name: "",
  email: "",
  phone: "",
  comments: "",
  planningToBuy: "",
};

const toStorageUrl = (path: string) => {
  return path.startsWith("http")
    ? path
    : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${path}`;
};

const extractImageUrls = (value: unknown): string[] => {
  if (!value) return [];

  if (typeof value === "string") {
    return value ? [toStorageUrl(value)] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractImageUrls(item));
  }

  if (typeof value === "object" && value && "path" in value) {
    const path = String((value as { path?: string }).path || "");
    return path ? [toStorageUrl(path)] : [];
  }

  return [];
};

const formatPrice = (price?: string | number) => {
  if (price === null || price === undefined || price === "")
    return "Price on request";
  const numeric =
    typeof price === "number"
      ? price
      : Number(String(price).replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(numeric)) return String(price);
  return `$${numeric.toLocaleString()}`;
};

const formatDate = (dateValue?: string) => {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timeValue?: string) => {
  if (!timeValue) return "N/A";
  const [hour, minute] = timeValue.split(":");
  if (!hour || !minute) return timeValue;
  const hh = Number(hour);
  const suffix = hh >= 12 ? "PM" : "AM";
  const displayHour = hh % 12 || 12;
  return `${displayHour}:${minute.slice(0, 2)} ${suffix}`;
};

export default function PublicOpenHousePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const { data, isLoading, isError } = usePublicSingleOpenHouse(id);
  const endOpenHouseMutation = useUpdateOpenHouse();

  const [form, setForm] = useState<EnquiryForm>(initialForm);
  const [activeImage, setActiveImage] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const openHouse = ((data as { data?: OpenHouseDetails })?.data || data) as
    | OpenHouseDetails
    | undefined;

  const fallbackFromQuery = useMemo(() => {
    const eventName = searchParams.get("eventName") || "";
    const propertyTitle = searchParams.get("propertyTitle") || "";
    const propertyLocation = searchParams.get("propertyLocation") || "";
    const price = searchParams.get("price") || "";
    const beds = searchParams.get("beds") || "";
    const baths = searchParams.get("baths") || "";
    const sqft = searchParams.get("sqft") || "";
    const image = searchParams.get("image") || "";
    const eventDate = searchParams.get("eventDate") || "";
    const startTime = searchParams.get("startTime") || "";
    const endTime = searchParams.get("endTime") || "";
    const propertyId = searchParams.get("propertyId") || "";
    const mlsAgentId = searchParams.get("mlsAgentId") || "";

    const hasFallback =
      !!eventName || !!propertyTitle || !!propertyLocation || !!image;
    if (!hasFallback) return null;
    return {};
    return {
      eventName,
      eventDate,
      startTime,
      endTime,
      mlsAgentId,
      property: {
        id: propertyId,
        title: propertyTitle,
        address: propertyLocation,
        price,
        bed: beds,
        bath: baths,
        sqft,
        cover_photo: image,
      } as OpenHouseProperty,
    };
  }, [searchParams]);

  const listing =
    openHouse?.listing_details ||
    openHouse?.property ||
    fallbackFromQuery?.property ||
    ({} as OpenHouseProperty);

  const imageUrls = useMemo(() => {
    const all = [
      ...extractImageUrls(listing?.cover_photo),
      ...extractImageUrls(listing?.images),
      ...extractImageUrls(listing?.image),
      ...extractImageUrls(listing?.photo),
    ].filter(Boolean);

    return Array.from(new Set(all));
  }, [listing]);

  const bannerImage = imageUrls[activeImage] || null;
  const propertyTitle =
    listing?.title || listing?.name || "Featured Open House Property";
  const propertyLocation =
    listing?.address || listing?.location || "Location available on request";
  const propertyBeds = listing?.bed ?? listing?.beds ?? "-";
  const propertyBaths = listing?.bath ?? listing?.baths ?? "-";
  const propertySqft = listing?.sqft ?? listing?.bua ?? "-";
  const propertyPrice = formatPrice(listing?.price);
  const eventDate =
    openHouse?.event_date ||
    openHouse?.date ||
    fallbackFromQuery?.eventDate ||
    "";
  const eventStart =
    openHouse?.start_time ||
    openHouse?.time ||
    fallbackFromQuery?.startTime ||
    "";
  const eventEnd = openHouse?.end_time || fallbackFromQuery?.endTime || "";
  const resolvedEventName =
    openHouse?.title ||
    openHouse?.name ||
    fallbackFromQuery?.eventName ||
    propertyTitle;

  const canSubmit =
    form.name.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.comments.trim() &&
    form.planningToBuy.trim();

  const updateField = (key: keyof EnquiryForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClosePage = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    window.close();
  };

  const handleEndOpenHouse = async () => {
    if (!id) return;
    setIsEnding(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await endOpenHouseMutation.mutateAsync({
        id,
        payload: { status: "expired" },
      });
      setSubmitSuccess("Open house ended successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to end open house.";
      setSubmitError(message);
    } finally {
      setIsEnding(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || !id) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const uuid =
        fallbackFromQuery?.mlsAgentId ||
        (typeof window !== "undefined"
          ? sessionStorage.getItem("user_uuid") || ""
          : "");

      await axiosInstance.post("v1/enquiry", {
        lagnt: uuid,
        name: form.name.trim(),
        email: form.email.trim(),
        contact_no: form.phone.trim(),
        description: form.comments.trim(),
        schedule: form.planningToBuy,
        property_id: String(
          listing?.id ||
            openHouse?.property_id ||
            fallbackFromQuery?.property?.id ||
            "",
        ),
        type: "openhouse",
      });

      setSubmitSuccess("Enquiry submitted successfully.");
      setForm(initialForm);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSubmitError(
          error.response?.data?.message ||
            error.message ||
            "Failed to submit enquiry.",
        );
      } else {
        setSubmitError("Failed to submit enquiry.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl rounded-2xl overflow-hidden border border-slate-200 shadow-lg grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full bg-slate-200" />
        </div>
      </div>
    );
  }

  if ((isError || !openHouse) && !fallbackFromQuery) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-md">
          <HomeModernIcon className="w-9 h-9 text-[#C9A84C] mx-auto mb-4" />
          <h2 className="text-base font-semibold text-slate-900 mb-2">Open house unavailable</h2>
          <p className="text-sm text-slate-500 mb-7 leading-relaxed">
            This open house is no longer available or the link is invalid.
          </p>
          <Button asChild variant="outline" className="border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-lg text-xs font-bold tracking-widest uppercase">
            <Link href="/">Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* ── Top bar ── */}
      <header className="flex-none flex items-center justify-between px-6 h-13 py-3 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 text-[#C9A84C]">
          <HomeModernIcon className="w-5 h-5" />
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-slate-800">Open House</span>
        </div>
        <button
          type="button"
          onClick={handleClosePage}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#C9A84C] transition-colors font-medium"
        >
          <XMarkIcon className="w-4 h-4" />
          Close
        </button>
      </header>

      {/* ── Centered card ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-10">
        <div className="w-full max-w-6xl rounded-2xl overflow-hidden border border-slate-200 shadow-[0_16px_48px_rgba(0,0,0,0.1)] grid grid-cols-1 lg:grid-cols-[55%_45%]">

          {/* ── LEFT: Property photo + info ── */}
          <div className="relative flex flex-col min-h-[440px] lg:min-h-0">
            {/* Photo */}
            <div className="absolute inset-0">
              {bannerImage ? (
                <img src={bannerImage} alt={propertyTitle} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <HomeModernIcon className="w-16 h-16 text-slate-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            </div>

            {/* Badge + thumbnails row */}
            <div className="relative z-10 p-5 flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 border border-[#C9A84C] bg-white/90 backdrop-blur-sm text-[#C9A84C] text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
                Live Open House
              </span>

              {imageUrls.length > 1 && (
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                  {imageUrls.map((img, index) => (
                    <button
                      key={`${img}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`w-12 h-9 overflow-hidden border-2 transition flex-shrink-0 rounded-lg shadow ${
                        index === activeImage ? "border-[#C9A84C]" : "border-white/60 hover:border-[#C9A84C]"
                      }`}
                    >
                      <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property info — bottom */}
            <div className="relative z-10 mt-auto px-7 pb-6">
              <div className="w-8 h-0.5 bg-[#C9A84C] mb-3" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-snug line-clamp-2 mb-2 tracking-tight">
                {resolvedEventName}
              </h1>
              <p className="text-base text-white/70 flex items-center gap-1.5 mb-6">
                <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0 text-[#C9A84C]" />
                <span className="truncate">{propertyLocation}</span>
              </p>

              {/* Stats */}
              <div className="grid grid-cols-4 divide-x divide-white/20 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
                {[
                  { label: "Price", value: propertyPrice, Icon: Tag },
                  { label: "Beds", value: propertyBeds, Icon: BedDouble },
                  { label: "Baths", value: propertyBaths, Icon: Bath },
                  { label: "Sq Ft", value: propertySqft, Icon: Ruler },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="px-4 py-3.5 flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-semibold">{label}</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" />
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Date/time */}
              <div className="mt-2 px-5 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex flex-wrap gap-x-6 gap-y-1">
                <span className="text-sm text-white/80 flex items-center gap-1.5 font-medium">
                  <CalendarDaysIcon className="w-4 h-4 text-[#C9A84C]" />
                  {formatDate(eventDate)}
                </span>
                <span className="text-sm text-white/80 flex items-center gap-1.5 font-medium">
                  <ClockIcon className="w-4 h-4 text-[#C9A84C]" />
                  {formatTime(eventStart)}{eventEnd ? ` – ${formatTime(eventEnd)}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Enquiry form ── */}
          <div className="flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-slate-100">

            <div className="px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="w-8 h-0.5 bg-[#C9A84C] mb-4" />
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#C9A84C] font-bold mb-2">Private Enquiry</p>
              <h2 className="text-2xl font-bold text-slate-900 leading-snug tracking-tight">Interested In This Home?</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Tell us about your timeline — we&apos;ll reach out with personalized guidance.
              </p>
            </div>

            <form className="flex-1 px-8 py-7 flex flex-col gap-4 overflow-y-auto" onSubmit={handleSubmit}>
              {submitSuccess && (
                <div className="rounded-lg border border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#8a6d1e] px-4 py-3 text-sm font-semibold">
                  {submitSuccess}
                </div>
              )}
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-semibold">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]" htmlFor="name">Name</label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="bg-slate-50 border border-slate-200 hover:border-[#C9A84C]/50 text-slate-900 text-sm px-3.5 h-11 rounded-lg placeholder:text-slate-300 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/20 transition-colors"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="bg-slate-50 border border-slate-200 hover:border-[#C9A84C]/50 text-slate-900 text-sm px-3.5 h-11 rounded-lg placeholder:text-slate-300 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/20 transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]" htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="bg-slate-50 border border-slate-200 hover:border-[#C9A84C]/50 text-slate-900 text-sm px-3.5 h-11 rounded-lg placeholder:text-slate-300 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/20 transition-colors"
                    placeholder="Phone number"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]" htmlFor="planning_to_buy">Timeline</label>
                  <select
                    id="planning_to_buy"
                    value={form.planningToBuy}
                    onChange={(e) => updateField("planningToBuy", e.target.value)}
                    className="bg-slate-50 border border-slate-200 hover:border-[#C9A84C]/50 text-slate-900 text-sm px-3.5 h-11 rounded-lg focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/20 transition-colors appearance-none"
                    required
                  >
                    <option value="">Select timeline</option>
                    {PLANNING_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]" htmlFor="comments">Comments</label>
                <textarea
                  id="comments"
                  rows={4}
                  value={form.comments}
                  onChange={(e) => updateField("comments", e.target.value)}
                  className="bg-slate-50 border border-slate-200 hover:border-[#C9A84C]/50 text-slate-900 text-sm px-3.5 py-3 rounded-lg resize-none placeholder:text-slate-300 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/20 transition-colors"
                  placeholder="Share your goals, preferred timeline, or questions…"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full bg-[#C9A84C] hover:bg-[#b8943d] disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-white text-base font-bold py-3.5 rounded-lg tracking-wide transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {isSubmitting ? "Submitting…" : "Submit Enquiry"}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Your information is kept private and never shared.
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
