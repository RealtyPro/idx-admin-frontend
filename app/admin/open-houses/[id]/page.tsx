"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowTopRightOnSquareIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckIcon,
  ClockIcon,
  HomeModernIcon,
  MapPinIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { Bath, BedDouble, Ruler, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSingleOpenHouse,
  useUpdateOpenHouse,
} from "@/services/open-house/OpenHouseQueries";
import { useProperties } from "@/services/property/PropertyQueries";

interface OpenHouseProperty {
  id?: string;
  title?: string;
  name?: string;
  address?: string;
  location?: string;
  price?: number | string;
  bed?: number | string;
  beds?: number | string;
  bath?: number | string;
  baths?: number | string;
  bua?: string | number;
  sqft?: number | string;
  images?: unknown;
  image?: unknown;
  [key: string]: unknown;
}

interface OpenHouseDetails {
  id: string;
  title?: string;
  name?: string;
  status?: string;
  event_date?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  time?: string;
  description?: string;
  notes?: string;
  property_id?: string;
  property?: OpenHouseProperty;
  listing_details?: OpenHouseProperty;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

const getStatusClass = (status?: string) => {
  const normalized = String(status || "").toLowerCase();
  if (["active", "available"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-600 border border-emerald-200";
  }
  if (["expired", "closed", "inactive"].includes(normalized)) {
    return "bg-amber-50 text-amber-600 border border-amber-200";
  }
  return "bg-slate-50 text-slate-600 border border-slate-200";
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

const formatDateTime = (dateValue?: string) => {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (timeValue?: string) => {
  if (!timeValue) return "";
  const [hour, minute] = timeValue.split(":");
  if (!hour || !minute) return timeValue;
  const hh = Number(hour);
  const suffix = hh >= 12 ? "PM" : "AM";
  const displayHour = hh % 12 || 12;
  return `${displayHour}:${minute.slice(0, 2)} ${suffix}`;
};

const formatPrice = (price?: string | number) => {
  if (price === null || price === undefined || price === "") return "Price N/A";
  const numeric =
    typeof price === "number"
      ? price
      : Number(String(price).replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(numeric)) return String(price);
  return `$${numeric.toLocaleString()}`;
};

const getPropertyImage = (property?: OpenHouseProperty | null) => {
  if (!property) return null;

  const imageValue =
    property.images ||
    property.image ||
    property.cover_photo ||
    property.photo ||
    null;
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

export default function OpenHouseDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const { data, isLoading, isError, error } = useSingleOpenHouse(id);
  const updateMutation = useUpdateOpenHouse();

  const openHouse = ((data as { data?: OpenHouseDetails })?.data || data) as
    | OpenHouseDetails
    | undefined;

  const [isEditMode, setIsEditMode] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");

  const [propertyQuery, setPropertyQuery] = useState("");
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<OpenHouseProperty | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userUuid, setUserUuid] = useState("");
  const [isClosingEvent, setIsClosingEvent] = useState(false);

  useEffect(() => {
    setUserUuid(sessionStorage.getItem("user_uuid") || "");
  }, []);

  const { data: propertyData, isFetching: loadingProperties } = useProperties({
    page: 1,
    keyword: propertyQuery,
  });

  const propertyOptions = useMemo(() => {
    if (Array.isArray((propertyData as { data?: unknown[] })?.data)) {
      return (propertyData as { data: OpenHouseProperty[] }).data;
    }
    if (Array.isArray(propertyData)) return propertyData as OpenHouseProperty[];
    return [] as OpenHouseProperty[];
  }, [propertyData]);

  useEffect(() => {
    const shouldEdit = searchParams.get("mode") === "edit";
    setIsEditMode(shouldEdit);
  }, [searchParams]);

  useEffect(() => {
    if (!openHouse) return;
    setEventDate((openHouse.event_date || openHouse.date || "").slice(0, 10));
    setStartTime(openHouse.start_time || "");
    setEndTime(openHouse.end_time || "");
    setStatus(openHouse.status || "active");
    setDescription(openHouse.description || openHouse.notes || "");
    setSelectedProperty(openHouse.property || null);
    if (openHouse.property?.title || openHouse.property?.name) {
      setPropertyQuery(
        String(openHouse.property.title || openHouse.property.name || ""),
      );
    }
  }, [openHouse]);

  const handleSave = async () => {
    if (!eventDate || !startTime) {
      setErrorMessage("Event date and start time are required.");
      return;
    }

    if (!selectedProperty?.id && !openHouse?.property_id) {
      setErrorMessage("Please select a property.");
      return;
    }

    setErrorMessage(null);

    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime || undefined,
          status,
          description,
          property_id: String(
            selectedProperty?.id || openHouse?.property_id || "",
          ),
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["open-house", id] });
      await queryClient.invalidateQueries({ queryKey: ["open-houses"] });

      setSuccessMessage("Open house event updated successfully.");
      setIsEditMode(false);
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Failed to update open house event.";
      setErrorMessage(message);
    }
  };

  const handleCloseEvent = async () => {
    if (!id) return;

    setIsClosingEvent(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateMutation.mutateAsync({
        id,
        payload: { status: "cancelled" },
      });

      await queryClient.invalidateQueries({ queryKey: ["open-house", id] });
      await queryClient.invalidateQueries({ queryKey: ["open-houses"] });

      setStatus("expired");
      setSuccessMessage("Open house event closed successfully.");
    } catch (closeError) {
      const message =
        closeError instanceof Error
          ? closeError.message
          : "Failed to close open house event.";
      setErrorMessage(message);
    } finally {
      setIsClosingEvent(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1100px] mx-auto space-y-4 py-1">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-[170px] w-full rounded-2xl" />
        <Skeleton className="h-[170px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !openHouse) {
    return (
      <div className="px-6 lg:px-8 max-w-[1100px] mx-auto py-2">
        <Card>
          <CardHeader>
            <CardTitle>Open House Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              {error instanceof Error
                ? error.message
                : "The open house event you are looking for does not exist."}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/admin/open-houses">Back to Open Houses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventName =
    openHouse.title || openHouse.name || `Open House ${openHouse.id}`;
  const normalizedCurrentStatus = String(
    openHouse.status || status || "",
  ).toLowerCase();
  const canCloseEvent = ["active", "scheduled"].includes(
    normalizedCurrentStatus,
  );
  const eventDateValue = openHouse.event_date || openHouse.date || "";
  const startTimeValue = openHouse.start_time || openHouse.time || "";
  const endTimeValue = openHouse.end_time || "";

  const property = selectedProperty || openHouse.listing_details || null;
  const propertyImage = getPropertyImage(property);
  const propertyTitle =
    property?.title || property?.name || "Property details unavailable";
  const propertyLocation =
    property?.address || property?.location || "Location unavailable";
  const propertyBeds = property?.bed ?? property?.beds ?? "-";
  const propertyBaths = property?.bath ?? property?.baths ?? "-";
  const propertySqft = property?.sqft ?? property?.bua ?? "-";

  const fallbackQuery = new URLSearchParams({
    eventName,
    propertyTitle,
    propertyLocation,
    price: String(property?.price || ""),
    beds: String(propertyBeds),
    baths: String(propertyBaths),
    sqft: String(propertySqft),
    image: String(propertyImage || ""),
    eventDate: String(eventDateValue || ""),
    startTime: String(startTimeValue || ""),
    endTime: String(endTimeValue || ""),
    propertyId: String(property?.id || openHouse.property_id || ""),
    mlsAgentId: userUuid,
  }).toString();

  return (
    <div className="px-6 lg:px-8 max-w-[1100px] mx-auto py-1 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900">
            {eventName}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Open House Event Details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link
              href="/admin/open-houses"
              className="inline-flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              href={`/open-houses/${id}?${fallbackQuery}`}
              target="_blank"
              className="inline-flex items-center gap-2"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              Open
            </Link>
          </Button>
          {canCloseEvent && !isEditMode && (
            <Button
              variant="destructive"
              onClick={handleCloseEvent}
              disabled={isClosingEvent || updateMutation.isPending}
              className="inline-flex items-center gap-1.5"
            >
              {isClosingEvent ? "Closing..." : "Close Event"}
            </Button>
          )}
          {!isEditMode ? (
            <Button
              onClick={() => setIsEditMode(true)}
              className="inline-flex items-center gap-1.5"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Edit Event
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm px-3 py-2">
          {successMessage}
        </div>
      )}

      {isEditMode && (
        <Card className="rounded-2xl border-slate-100 shadow-sm overflow-visible">
          <CardHeader>
            <CardTitle className="text-base">Edit Open House Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-date">Event Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="event-status">Status</Label>
                <select
                  id="event-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Event description"
              />
            </div>

            <div>
              <Label htmlFor="property-search">Property</Label>
              <Input
                id="property-search"
                value={propertyQuery}
                onChange={(e) => {
                  setPropertyQuery(e.target.value);
                  setIsPropertyDropdownOpen(true);
                }}
                onFocus={() => setIsPropertyDropdownOpen(true)}
                placeholder="Search and select property"
                className="mt-1.5"
              />
              {isPropertyDropdownOpen && (
                <div className="mt-2 rounded-lg border border-slate-200 bg-white shadow-xl max-h-[300px] overflow-auto">
                  {loadingProperties ? (
                    <div className="p-3 text-sm text-slate-500">
                      Loading properties...
                    </div>
                  ) : propertyOptions.length > 0 ? (
                    propertyOptions.map((propertyOption) => {
                      const optionImage = getPropertyImage(propertyOption);
                      const optionTitle =
                        propertyOption.title ||
                        propertyOption.name ||
                        `Property ${propertyOption.id}`;
                      const optionAddress =
                        propertyOption.address ||
                        propertyOption.location ||
                        "Location unavailable";
                      const optionBeds =
                        propertyOption.bed ?? propertyOption.beds ?? "-";
                      const optionBaths =
                        propertyOption.bath ?? propertyOption.baths ?? "-";
                      const optionSqft = propertyOption.sqft ?? "-";

                      return (
                        <button
                          key={propertyOption.id}
                          type="button"
                          className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                          onClick={() => {
                            setSelectedProperty(propertyOption);
                            setPropertyQuery(String(optionTitle));
                            setIsPropertyDropdownOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-md bg-slate-100 overflow-hidden flex-shrink-0">
                              {optionImage ? (
                                <img
                                  src={optionImage}
                                  alt={String(optionTitle)}
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
                                {optionTitle}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {optionAddress}
                              </p>
                              <p className="text-xs text-slate-600 mt-1">
                                {formatPrice(propertyOption.price)} ·{" "}
                                {optionBeds} bd · {optionBaths} ba ·{" "}
                                {optionSqft} sqft
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

              {selectedProperty && (
                <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1">
                  <CheckIcon className="w-3.5 h-3.5" />
                  Selected:{" "}
                  {selectedProperty.title ||
                    selectedProperty.name ||
                    `Property ${selectedProperty.id}`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">
            Property For This Open House
          </CardTitle>
        </CardHeader>
        <CardContent>
          {property ? (
            property.id ? (
              <Link
                href={`/admin/listings/${property.id}`}
                className="block rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-full h-44 sm:w-28 sm:h-20 rounded-md bg-slate-100 overflow-hidden flex-shrink-0">
                    {propertyImage ? (
                      <img
                        src={propertyImage}
                        alt={propertyTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <HomeModernIcon className="w-9 h-9" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {propertyTitle}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1 truncate">
                      <MapPinIcon className="w-4 h-4" />
                      {propertyLocation}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {formatPrice(property.price)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5" />
                        {propertyBeds}{" "}
                        {Number(propertyBeds) === 1 ? "Bedroom" : "Bedrooms"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" />
                        {propertyBaths}{" "}
                        {Number(propertyBaths) === 1 ? "Bathroom" : "Bathrooms"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5" />
                        {propertySqft} Sqft
                      </span>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-slate-400 flex-shrink-0 self-center" />
                </div>
              </Link>
            ) : (
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full h-44 sm:w-28 sm:h-20 rounded-md bg-slate-100 overflow-hidden flex-shrink-0">
                    {propertyImage ? (
                      <img
                        src={propertyImage}
                        alt={propertyTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <HomeModernIcon className="w-9 h-9" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {propertyTitle}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1 truncate">
                      <MapPinIcon className="w-4 h-4" />
                      {propertyLocation}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {formatPrice(property.price)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5" />
                        {propertyBeds}{" "}
                        {Number(propertyBeds) === 1 ? "Bedroom" : "Bedrooms"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" />
                        {propertyBaths}{" "}
                        {Number(propertyBaths) === 1 ? "Bathroom" : "Bathrooms"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5" />
                        {propertySqft} Sqft
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm px-3 py-2">
              No property details are linked with this open house event.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Open House Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Status
              </p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium mt-2 ${getStatusClass(
                  openHouse.status,
                )}`}
              >
                {openHouse.status || "N/A"}
              </span>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Date
              </p>
              <p className="text-sm font-medium text-slate-800 mt-2 flex items-center gap-1.5">
                <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                {formatDate(eventDateValue)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Time
              </p>
              <p className="text-sm font-medium text-slate-800 mt-2 flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4 text-slate-400" />
                {startTimeValue ? formatTime(startTimeValue) : "N/A"}
                {endTimeValue ? ` - ${formatTime(endTimeValue)}` : ""}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Last Updated
              </p>
              <p className="text-sm font-medium text-slate-800 mt-2">
                {formatDateTime(openHouse.updated_at || openHouse.created_at)}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 mt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Description
            </p>
            <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
              {openHouse.description ||
                openHouse.notes ||
                "No description provided."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
