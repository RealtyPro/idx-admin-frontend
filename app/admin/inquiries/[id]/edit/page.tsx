"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/services/Api";
import { searchProperties } from "@/services/property/PropertyServices";

const LISTING_SOURCES = ["listing_tour", "openhouse", "listing_enquire", "idx-admin"];
const SCHEDULE_TOUR_SOURCE = "listing_tour";
const ENQUIRY_SOURCE = "listing_enquire";
const SELL_SOURCE = "sell";

const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

const PLANNING_OPTIONS = ["Now", "0 to 6 months", "6+ months"];

interface PropertyItem {
  id: number | string;
  title?: string;
  address?: string;
  city?: string;
  mls_number?: string;
}

interface EditEnquiryForm {
  name: string;
  email: string;
  contact_no: string;
  description: string;
  listing_id: string;
  source: string;
  tour_date: string;
  time_slot: string;
  planning_to_buy: string;
  planning_to_sell: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  contact_no?: string;
  description?: string;
}

const initialForm: EditEnquiryForm = {
  name: "",
  email: "",
  contact_no: "",
  description: "",
  listing_id: "",
  source: "",
  tour_date: "",
  time_slot: "",
  planning_to_buy: "",
  planning_to_sell: "",
};

export default function EditEnquiryPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [enquiry, setEnquiry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [form, setForm] = useState<EditEnquiryForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [propertyQuery, setPropertyQuery] = useState("");
  const [propertyOptions, setPropertyOptions] = useState<PropertyItem[]>([]);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const propertyLabel = (item: PropertyItem) => {
    return item.title || item.address || item.city || item.mls_number || `Property #${item.id}`;
  };

  useEffect(() => {
    const fetchEnquiry = async () => {
      if (!id) {
        setIsError(true);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setIsError(false);
      try {
        const res = await axiosInstance.get(`v1/admin/enquiry/${id}`);
        const payload = res?.data?.data || res?.data || null;
        setEnquiry(payload);
      } catch {
        setIsError(true);
        setEnquiry(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnquiry();
  }, [id]);

  useEffect(() => {
    if (enquiry) {
      setForm({
        name: enquiry.name || "",
        email: enquiry.email || "",
        contact_no: enquiry.contact_no || "",
        description: enquiry.message || enquiry.description || "",
        listing_id: enquiry.listing_id ? String(enquiry.listing_id) : "",
        source: enquiry.source || "",
        tour_date: enquiry.tour_date || "",
        time_slot: enquiry.time_slot || "",
        planning_to_buy: enquiry.planning_to_buy || "",
        planning_to_sell: enquiry.planning_to_sell || "",
      });
      if (enquiry.listing_id) {
        setSelectedProperty({
          id: enquiry.listing_id,
          title: enquiry.listing_title || `Listing #${enquiry.listing_id}`,
        });
      }
    }
  }, [enquiry]);

  const loadProperties = async (keyword: string) => {
    setPropertyLoading(true);
    try {
      const data = await searchProperties(keyword);
      const rows = Array.isArray(data) ? data : data?.data || data?.properties || data?.listings || [];
      setPropertyOptions(rows);
    } catch {
      setPropertyOptions([]);
    } finally {
      setPropertyLoading(false);
    }
  };

  useEffect(() => {
    loadProperties("");
  }, []);

  useEffect(() => {
    const outsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", outsideClick);
    return () => {
      document.removeEventListener("mousedown", outsideClick);
    };
  }, []);

  const onPropertySearch = (value: string) => {
    setPropertyQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadProperties(value.trim());
    }, 350);
  };

  const onSelectProperty = (item: PropertyItem) => {
    setSelectedProperty(item);
    setForm((prev) => ({ ...prev, listing_id: String(item.id) }));
    setShowDropdown(false);
    setPropertyQuery("");
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nextErrors.email = "Enter a valid email";
    }

    if (!form.contact_no.trim()) {
      nextErrors.contact_no = "Contact number is required";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validate()) return;

    setLoading(true);
    try {
      const showListing = LISTING_SOURCES.includes(form.source);
      const showTourFields = form.source === SCHEDULE_TOUR_SOURCE;
      const showPlanning = form.source === SCHEDULE_TOUR_SOURCE || form.source === ENQUIRY_SOURCE;
      const showSellPlanning = form.source === SELL_SOURCE;

      const params = {
        name: form.name.trim(),
        email: form.email.trim(),
        contact_no: form.contact_no.trim(),
        description: form.description.trim(),
        source: form.source || undefined,
        listing_id: showListing ? form.listing_id || undefined : undefined,
        tour_date: showTourFields ? form.tour_date || undefined : undefined,
        time_slot: showTourFields ? form.time_slot || undefined : undefined,
        planning_to_buy: showPlanning ? form.planning_to_buy || undefined : undefined,
        planning_to_sell: showSellPlanning ? form.planning_to_sell || undefined : undefined,
      };

      await axiosInstance.put(`v1/admin/enquiry/${id}`, params);

      setSuccessMessage("Enquiry updated successfully.");
      setTimeout(() => router.push(`/admin/inquiries/${id}`), 1200);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to update enquiry");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-10">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !enquiry) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Enquiry not found.
        </div>
        <Link
          href="/admin/inquiries"
          className="mt-4 inline-block px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
        >
          <ArrowLeftIcon className="w-4 h-4 inline mr-2" /> Back
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Edit Enquiry</h1>
        <Link
          href={`/admin/inquiries/${id}`}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* ---- Form Card ---- */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
        <form className="space-y-6" onSubmit={onSubmit}>
          {successMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Name
            </label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
              placeholder="Enter name"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                placeholder="name@example.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contact_no" className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>
              <Input
                id="contact_no"
                value={form.contact_no}
                onChange={(e) => setForm((prev) => ({ ...prev, contact_no: e.target.value }))}
                required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                placeholder="Enter contact number"
              />
              {errors.contact_no && <p className="text-xs text-red-500 mt-1">{errors.contact_no}</p>}
            </div>
          </div>

          {/* Source */}
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-slate-700 mb-1.5">
              Source
            </label>
            <select
              id="source"
              value={form.source}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  source: e.target.value,
                  listing_id: "",
                  tour_date: "",
                  time_slot: "",
                  planning_to_buy: "",
                  planning_to_sell: "",
                }))
              }
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
            >
              <option value="">Select source</option>
              <option value="sell">Sell</option>
              <option value="connect">General</option>
              <option value="listing_tour">Schedule Tour</option>
              <option value="listing_enquire">Listing Inquire</option>
              <option value="signup">Sign Up</option>
              <option value="openhouse">Open House</option>
              <option value="idx-admin">IDX Admin</option>
            </select>
          </div>

          {/* Listing Search — shown for specific sources */}
          {LISTING_SOURCES.includes(form.source) && (
            <div ref={dropdownRef}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Attach Listing
              </label>
              {!selectedProperty ? (
                <div className="relative">
                  <div className="flex items-center gap-2 w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={propertyQuery}
                      onFocus={() => setShowDropdown(true)}
                      onChange={(e) => onPropertySearch(e.target.value)}
                      placeholder="Search and find listing"
                      className="flex-1 text-sm focus:outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDropdown((prev) => !prev)}
                      className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg max-h-60 overflow-auto">
                      {propertyLoading && (
                        <p className="px-4 py-3 text-sm text-slate-400">Loading listings...</p>
                      )}
                      {!propertyLoading && propertyOptions.length === 0 && (
                        <p className="px-4 py-3 text-sm text-slate-400">No listing found</p>
                      )}
                      {!propertyLoading &&
                        propertyOptions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectProperty(item)}
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-emerald-50 border-b border-slate-100 last:border-b-0 transition"
                          >
                            <p className="font-medium">{propertyLabel(item)}</p>
                            <p className="text-xs text-slate-400 mt-0.5">ID: {item.id}</p>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-900">{propertyLabel(selectedProperty)}</p>
                    <p className="text-xs text-slate-500">ID: {selectedProperty.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProperty(null);
                      setForm((prev) => ({ ...prev, listing_id: "" }));
                      setPropertyQuery("");
                    }}
                    className="text-xs text-slate-500 hover:text-red-500 flex-shrink-0 transition"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Schedule Tour extra fields */}
          {form.source === SCHEDULE_TOUR_SOURCE && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="tour_date" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tour Date
                </label>
                <Input
                  id="tour_date"
                  type="date"
                  value={form.tour_date}
                  onChange={(e) => setForm((prev) => ({ ...prev, tour_date: e.target.value }))}
                  className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label htmlFor="time_slot" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Time Slot
                </label>
                <select
                  id="time_slot"
                  value={form.time_slot}
                  onChange={(e) => setForm((prev) => ({ ...prev, time_slot: e.target.value }))}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
                >
                  <option value="">Select time slot</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* When planning to buy — shown for Schedule Tour and Inquiry */}
          {(form.source === SCHEDULE_TOUR_SOURCE || form.source === ENQUIRY_SOURCE) && (
            <div>
              <label htmlFor="planning_to_buy" className="block text-sm font-medium text-slate-700 mb-1.5">
                When are you planning to buy?
              </label>
              <select
                id="planning_to_buy"
                value={form.planning_to_buy}
                onChange={(e) => setForm((prev) => ({ ...prev, planning_to_buy: e.target.value }))}
                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
              >
                <option value="">Select timeline</option>
                {PLANNING_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          )}

          {/* When planning to sell — shown for Sell */}
          {form.source === SELL_SOURCE && (
            <div>
              <label htmlFor="planning_to_sell" className="block text-sm font-medium text-slate-700 mb-1.5">
                When are you planning to sell?
              </label>
              <select
                id="planning_to_sell"
                value={form.planning_to_sell}
                onChange={(e) => setForm((prev) => ({ ...prev, planning_to_sell: e.target.value }))}
                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
              >
                <option value="">Select timeline</option>
                {PLANNING_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
              Message
            </label>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              required
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
              placeholder="Enter enquiry message"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
