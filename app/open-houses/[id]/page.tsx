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
      <div className="h-screen bg-slate-50 flex flex-col gap-3 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Skeleton className="h-full w-full" />
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if ((isError || !openHouse) && !fallbackFromQuery) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full border border-slate-200 bg-white p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Open house unavailable</h2>
          <p className="text-sm text-slate-500 mb-6">
            This open house is no longer available or the link is invalid.
          </p>
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/">Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100">
      {/* ── Top bar ── */}
      <header className="flex-none flex items-center justify-between bg-white border-b border-slate-200 px-5 py-0 h-12">
        <div className="flex items-center gap-2 text-emerald-700">
          <HomeModernIcon className="w-5 h-5" />
          <span className="text-xs font-semibold tracking-widest uppercase">Open House</span>
        </div>
        <button
          type="button"
          onClick={handleClosePage}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
          Close
        </button>
      </header>

      {/* ── Main two-column layout ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_2fr] overflow-hidden">

        {/* ── LEFT: Property showcase ── */}
        <div className="flex flex-col overflow-hidden border-r border-slate-200">
          {/* Hero image */}
          <div className="relative flex-1 bg-slate-800 overflow-hidden min-h-0">
            {bannerImage ? (
              <img
                src={bannerImage}
                alt={propertyTitle}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <HomeModernIcon className="w-16 h-16 opacity-30" />
              </div>
            )}
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

            {/* Property title overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-16">
              <p className="text-[10px] tracking-[0.25em] uppercase text-emerald-400 font-semibold mb-1">
                Open House
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug line-clamp-2">
                {resolvedEventName}
              </h1>
              <p className="mt-1.5 text-sm text-white/75 flex items-center gap-1.5">
                <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{propertyLocation}</span>
              </p>
            </div>

            {/* Image strip */}
            {imageUrls.length > 1 && (
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 max-h-[calc(100%-80px)] overflow-y-auto">
                {imageUrls.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`w-14 h-10 overflow-hidden border-2 transition flex-shrink-0 ${
                      index === activeImage
                        ? "border-emerald-400"
                        : "border-white/30 hover:border-white/70"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property stats bar */}
          <div className="flex-none bg-white border-t border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-200">
              <div className="px-4 py-3 flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Price</span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  {propertyPrice}
                </span>
              </div>
              <div className="px-4 py-3 flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Beds</span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  <BedDouble className="w-3.5 h-3.5 text-emerald-600" />
                  {propertyBeds}
                </span>
              </div>
              <div className="px-4 py-3 flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Baths</span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-emerald-600" />
                  {propertyBaths}
                </span>
              </div>
              <div className="px-4 py-3 flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Sq Ft</span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                  {propertySqft}
                </span>
              </div>
            </div>
            {/* Date/time strip */}
            <div className="border-t border-slate-200 bg-emerald-50 px-4 py-2.5 flex flex-wrap gap-x-6 gap-y-1">
              <span className="text-xs text-emerald-800 flex items-center gap-1.5">
                <CalendarDaysIcon className="w-3.5 h-3.5" />
                {formatDate(eventDate)}
              </span>
              <span className="text-xs text-emerald-800 flex items-center gap-1.5">
                <ClockIcon className="w-3.5 h-3.5" />
                {formatTime(eventStart)}{eventEnd ? ` – ${formatTime(eventEnd)}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Enquiry form ── */}
        <div className="flex flex-col overflow-y-auto bg-white">
          <div className="px-6 pt-5 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Interested In This Home?</h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Tell us about your timeline — we&apos;ll reach out with personalized guidance.
            </p>
          </div>

          <form className="flex-1 px-6 py-4 flex flex-col gap-3" onSubmit={handleSubmit}>
            {submitSuccess && (
              <div className="border border-emerald-300 bg-emerald-50 text-emerald-700 px-3 py-2 text-xs">
                {submitSuccess}
              </div>
            )}
            {submitError && (
              <div className="border border-red-300 bg-red-50 text-red-600 px-3 py-2 text-xs">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1" htmlFor="name">
                  Name
                </label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="rounded-none border-slate-300 focus:border-emerald-500 focus:ring-0 text-sm h-9"
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="rounded-none border-slate-300 focus:border-emerald-500 focus:ring-0 text-sm h-9"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1" htmlFor="phone">
                  Phone
                </label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="rounded-none border-slate-300 focus:border-emerald-500 focus:ring-0 text-sm h-9"
                  placeholder="Phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1" htmlFor="planning_to_buy">
                  Planning to Buy
                </label>
                <select
                  id="planning_to_buy"
                  value={form.planningToBuy}
                  onChange={(e) => updateField("planningToBuy", e.target.value)}
                  className="w-full border border-slate-300 bg-white px-3 h-9 text-sm focus:outline-none focus:border-emerald-500 text-slate-700"
                  required
                >
                  <option value="">Select timeline</option>
                  {PLANNING_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1" htmlFor="comments">
                Comments
              </label>
              <textarea
                id="comments"
                rows={3}
                value={form.comments}
                onChange={(e) => updateField("comments", e.target.value)}
                className="w-full border border-slate-300 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:border-emerald-500"
                placeholder="Share your goals, preferred timeline, or questions…"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 transition-colors"
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
  );
}
