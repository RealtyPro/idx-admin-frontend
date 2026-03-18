"use client";

import axios from "axios";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  HomeModernIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Bath, BedDouble, Ruler, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/services/Api";
import {
  useSingleOpenHouse,
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

  const { data, isLoading, isError } = useSingleOpenHouse(id);
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

    const hasFallback =
      !!eventName || !!propertyTitle || !!propertyLocation || !!image;
    if (!hasFallback) return null;

    return {
      eventName,
      eventDate,
      startTime,
      endTime,
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
        typeof window !== "undefined"
          ? sessionStorage.getItem("user_uuid") || ""
          : "";

      await axiosInstance.post("v1/admin/enquiry", {
        lagnt: uuid,
        name: form.name.trim(),
        email: form.email.trim(),
        contact_no: form.phone.trim(),
        description: form.comments.trim(),
        type: "openhouse",
        schedule: form.planningToBuy,
        property_id: String(
          listing?.id ||
            openHouse?.property_id ||
            fallbackFromQuery?.property?.id ||
            "",
        ),
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
      <div className="min-h-screen bg-slate-50 px-4 sm:px-8 py-8 space-y-6">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-[320px] w-full rounded-3xl" />
        <Skeleton className="h-[160px] w-full rounded-2xl" />
        <Skeleton className="h-[340px] w-full rounded-2xl" />
      </div>
    );
  }

  if ((isError || !openHouse) && !fallbackFromQuery) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 sm:px-8 py-8 flex items-center justify-center">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <CardTitle>Open house unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              This open house is no longer available or the link is invalid.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Go Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef7ff,#f8fafc_42%,#f6f9f3)] pb-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-6">
        <div className="flex justify-end gap-2 mb-4">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleClosePage}
            type="button"
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Close
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-full"
            onClick={handleEndOpenHouse}
            disabled={isEnding}
          >
            {isEnding ? "Ending..." : "End Open House"}
          </Button>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="relative h-[260px] sm:h-[360px] lg:h-[440px] bg-slate-100">
            {bannerImage ? (
              <img
                src={bannerImage}
                alt={propertyTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <HomeModernIcon className="w-12 h-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 text-white">
              <p className="text-xs tracking-[0.2em] uppercase text-white/80 mb-2">
                Open House
              </p>
              <h1 className="text-2xl sm:text-4xl font-semibold leading-tight">
                {resolvedEventName}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-white/90 inline-flex items-center gap-1.5">
                <MapPinIcon className="w-4 h-4" />
                {propertyLocation}
              </p>
            </div>
          </div>

          {imageUrls.length > 1 && (
            <div className="px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/70">
              <div className="flex gap-2 overflow-auto">
                {imageUrls.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition ${
                      index === activeImage
                        ? "border-emerald-500"
                        : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mt-4 space-y-4">
          {/* <Card className="rounded-2xl border-slate-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Property Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Price</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 inline-flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      {propertyPrice}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Bedrooms</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 inline-flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5 text-slate-500" />
                      {propertyBeds}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Bathrooms</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 inline-flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-slate-500" />
                      {propertyBaths}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Square Feet</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 inline-flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-slate-500" />
                      {propertySqft}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-emerald-50/40 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <p className="inline-flex items-center gap-1.5 text-slate-700">
                    <CalendarDaysIcon className="w-4 h-4 text-emerald-700" />
                    {formatDate(eventDate)}
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-slate-700">
                    <ClockIcon className="w-4 h-4 text-emerald-700" />
                    {formatTime(eventStart)}
                    {eventEnd ? ` - ${formatTime(eventEnd)}` : ""}
                  </p>
                </div>
              </CardContent>
          </Card> */}

          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                Interested In This Home?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-6">
                Tell us a little about your timeline and we will contact you
                with personalized guidance and next steps.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-100 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Open House Enquiry</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
                onSubmit={handleSubmit}
              >
                {submitSuccess && (
                  <div className="md:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
                    {submitSuccess}
                  </div>
                )}
                {submitError && (
                  <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 text-red-600 px-3 py-2 text-sm">
                    {submitError}
                  </div>
                )}

                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    className="rounded-xl"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    className="rounded-xl"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="phone"
                  >
                    Phone
                  </label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    className="rounded-xl"
                    placeholder="Your phone number"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="planning_to_buy"
                  >
                    When are you planning to buy?
                  </label>
                  <select
                    id="planning_to_buy"
                    value={form.planningToBuy}
                    onChange={(event) =>
                      updateField("planningToBuy", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    required
                  >
                    <option value="">Select timeline</option>
                    {PLANNING_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                    htmlFor="comments"
                  >
                    Comments
                  </label>
                  <textarea
                    id="comments"
                    rows={4}
                    value={form.comments}
                    onChange={(event) =>
                      updateField("comments", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    placeholder="Share your goals, preferred move timeline, or questions"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="md:col-span-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <div className="mt-8">
          <Button asChild variant="ghost" className="text-slate-600">
            <Link href="/">
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
