"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateOpenHouse } from "@/services/open-house/OpenHouseQueries";
import { useProperties } from "@/services/property/PropertyQueries";

interface PropertyOption {
  id: string;
  title?: string;
  name?: string;
  address?: string;
  price?: number | string;
  bed?: number | string;
  beds?: number | string;
  bath?: number | string;
  baths?: number | string;
  sqft?: number | string;
  images?: unknown;
  image?: unknown;
  [key: string]: unknown;
}

const toText = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

const formatPrice = (price?: string | number) => {
  if (price === null || price === undefined || price === "") return "Price N/A";
  const numeric =
    typeof price === "number"
      ? price
      : Number(toText(price).replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(numeric)) return toText(price);
  return `$${numeric.toLocaleString()}`;
};

const getPropertyImage = (property: PropertyOption) => {
  const imageValue = property.images || property.image;
  if (!imageValue) return null;

  if (typeof imageValue === "string") {
    return imageValue.startsWith("http")
      ? imageValue
      : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${imageValue}`;
  }

  if (Array.isArray(imageValue) && imageValue.length > 0) {
    const first = imageValue[0];
    if (typeof first === "string") {
      return first.startsWith("http")
        ? first
        : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${first}`;
    }
    if (typeof first === "object" && first && "path" in first) {
      const path = String((first as { path?: string }).path || "");
      if (!path) return null;
      return path.startsWith("http")
        ? path
        : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${path}`;
    }
  }

  if (typeof imageValue === "object" && imageValue && "path" in imageValue) {
    const path = String((imageValue as { path?: string }).path || "");
    if (!path) return null;
    return path.startsWith("http")
      ? path
      : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${path}`;
  }

  return null;
};

export default function CreateOpenHousePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");

  const [propertyQuery, setPropertyQuery] = useState("");
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyOption | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateOpenHouse();

  const { data: propertyData, isFetching: loadingProperties } = useProperties({
    page: 1,
    keyword: propertyQuery,
  });

  const propertyOptions = useMemo(() => {
    if (Array.isArray((propertyData as { data?: unknown[] })?.data)) {
      return (propertyData as { data: PropertyOption[] }).data;
    }
    if (Array.isArray(propertyData)) return propertyData as PropertyOption[];
    return [] as PropertyOption[];
  }, [propertyData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProperty?.id) {
      setErrorMessage("Please select a property for this open house event.");
      return;
    }

    if (!eventDate || !startTime) {
      setErrorMessage("Event date and start time are required.");
      return;
    }

    setErrorMessage(null);

    try {
      const response = (await createMutation.mutateAsync({
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime || undefined,
        notes: description.trim() || undefined,
        description,
        status,
        property_id: selectedProperty.id,
      })) as { data?: { id?: string }; id?: string };

      await queryClient.invalidateQueries({ queryKey: ["open-houses"] });

      const createdId = response?.data?.id || response?.id;
      if (createdId) {
        router.push(`/admin/open-houses/${createdId}`);
        return;
      }

      router.push("/admin/open-houses");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create open house event.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">
          Create Open House
        </h1>
        <Link
          href="/admin/open-houses"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <p className="mt-1">{errorMessage}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="property-search"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Listing *
            </label>

            {!selectedProperty ? (
              <div className="relative">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="property-search"
                    value={propertyQuery}
                    onChange={(e) => {
                      setPropertyQuery(e.target.value);
                      setIsPropertyDropdownOpen(true);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onFocus={() => setIsPropertyDropdownOpen(true)}
                    placeholder="Search and select listing for the open house event"
                    className="pl-9 pr-10 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPropertyDropdownOpen((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                </div>

                {isPropertyDropdownOpen && (
                  <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl max-h-[320px] overflow-auto">
                    {loadingProperties ? (
                      <div className="p-3 text-sm text-slate-500">
                        Loading properties...
                      </div>
                    ) : propertyOptions.length > 0 ? (
                      propertyOptions.map((property) => {
                        const image = getPropertyImage(property);
                        const title =
                          property.title ||
                          property.name ||
                          `Property ${property.id}`;
                        const location =
                          property.address || "Location unavailable";
                        const beds = property.bed ?? property.beds ?? "-";
                        const baths = property.bath ?? property.baths ?? "-";
                        const sqft = property.sqft ?? "-";

                        return (
                          <button
                            type="button"
                            key={property.id}
                            className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 border-b border-slate-100 last:border-b-0 transition"
                            onClick={() => {
                              setSelectedProperty(property);
                              setPropertyQuery(String(title));
                              setIsPropertyDropdownOpen(false);
                              if (errorMessage) setErrorMessage(null);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-md bg-slate-100 overflow-hidden flex-shrink-0">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={String(title)}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                  {title}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {location}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                  {formatPrice(property.price)} · {beds} bd ·{" "}
                                  {baths} ba · {sqft} sqft
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-sm text-slate-500">
                        No matching properties found.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-900">
                    {selectedProperty.title ||
                      selectedProperty.name ||
                      `Property ${selectedProperty.id}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedProperty.address || "No address"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProperty(null);
                    setPropertyQuery("");
                    setIsPropertyDropdownOpen(true);
                  }}
                  className="text-xs text-slate-500 hover:text-red-500 flex-shrink-0 transition"
                >
                  Change
                </button>
              </div>
            )}

            {/* {!selectedProperty && (
              <div className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700 mt-1">
                Select a property first, then fill event details.
              </div>
            )} */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label
                htmlFor="event-date"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Event Date
              </Label>
              <div className="relative">
                <CalendarDaysIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="pl-9 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                  required
                  disabled={!selectedProperty}
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="event-status"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Status
              </Label>
              <select
                id="event-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={!selectedProperty}
                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:border-emerald-400 focus:ring-emerald-500/20 transition disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <Label
                htmlFor="start-time"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Start Time
              </Label>
              <div className="relative">
                <ClockIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-9 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                  required
                  disabled={!selectedProperty}
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="end-time"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                End Time
              </Label>
              <div className="relative">
                <ClockIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-9 rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                  disabled={!selectedProperty}
                />
              </div>
            </div>
          </div>

          <div>
            <Label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Description
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={!selectedProperty}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:border-emerald-400 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400"
              placeholder="Add event description, instructions, and highlights"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/open-houses")}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !selectedProperty}
              className="rounded-full bg-emerald-500 hover:bg-emerald-600"
            >
              {createMutation.isPending ? "Creating..." : "Create Open House"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
