"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/services/Api";
import { searchProperties } from "@/services/property/PropertyServices";
import {
  useCitiesByCounty,
  useCountiesByState,
  useStates,
} from "@/services/location/LocationQueries";

const LISTING_SOURCES = [
  "listing_tour",
  "openhouse",
  "listing_enquire",
  "idx-admin",
];
const SCHEDULE_TOUR_SOURCE = "listing_tour";
const ENQUIRY_SOURCE = "listing_enquire";
const SELL_SOURCE = "sell";

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const PLANNING_OPTIONS = ["Now", "0 to 6 months", "6+ months"];

interface PropertyItem {
  id: number | string;
  title?: string;
  address?: string;
  city?: string;
  mls_number?: string;
}

interface CreateEnquiryForm {
  name: string;
  email: string;
  contact_no: string;
  address: string;
  state: string;
  county: string;
  city: string;
  zip: string;
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
  address?: string;
  state?: string;
  county?: string;
  city?: string;
  zip?: string;
  description?: string;
  source?: string;
  listing_id?: string;
  tour_date?: string;
  time_slot?: string;
  planning_to_buy?: string;
  planning_to_sell?: string;
}

const initialForm: CreateEnquiryForm = {
  name: "",
  email: "",
  contact_no: "",
  address: "",
  state: "",
  county: "",
  city: "",
  zip: "",
  description: "",
  listing_id: "",
  source: "",
  tour_date: "",
  time_slot: "",
  planning_to_buy: "",
  planning_to_sell: "",
};

export default function CreateEnquiryPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateEnquiryForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [propertyQuery, setPropertyQuery] = useState("");
  const [propertyOptions, setPropertyOptions] = useState<PropertyItem[]>([]);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(
    null,
  );
  const [stateName, setStateName] = useState("");
  const [cityName, setCityName] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { data: statesData, isLoading: statesLoading } = useStates();
  const { data: countiesData, isLoading: countiesLoading } =
    useCountiesByState(form.state);
  const { data: citiesData, isLoading: citiesLoading } =
    useCitiesByCounty(form.county);

  const states = statesData?.data || statesData || [];
  const counties = countiesData?.data || countiesData || [];
  const cities = citiesData?.data || citiesData || [];

  const getOptionLabel = (opts: any[], val: string) => {
    if (!Array.isArray(opts)) return "";
    const found = opts.find((o: any) => String(o.id || o.value || o) === val);
    if (!found) return "";
    return String(found.name || found.title || found.label || "");
  };

  const getCityZip = (cityId: string) => {
    if (!cityId || !Array.isArray(cities)) return "";
    const selectedCity = cities.find(
      (o: any) => String(o.id || o.value || o) === cityId,
    );
    if (!selectedCity || typeof selectedCity !== "object") return "";

    const zipValue =
      selectedCity.zip ||
      selectedCity.zipcode ||
      selectedCity.zip_code ||
      selectedCity.postal_code ||
      selectedCity.postalCode ||
      selectedCity.postal;

    return zipValue ? String(zipValue) : "";
  };

  const renderSelect = (opts: any[], loading: boolean, placeholder: string) => {
    return (
      <>
        <option value="">{loading ? "Loading..." : placeholder}</option>
        {Array.isArray(opts) &&
          opts.map((o: any, i: number) => (
            <option key={o.id || i} value={String(o.id || o.value || o)}>
              {o.name || o.title || o.label || o}
            </option>
          ))}
      </>
    );
  };

  const propertyLabel = (item: PropertyItem) => {
    return (
      item.title ||
      item.address ||
      item.city ||
      item.mls_number ||
      `Property #${item.id}`
    );
  };

  const loadProperties = async (keyword: string) => {
    setPropertyLoading(true);
    try {
      const data = await searchProperties(keyword);
      const rows = Array.isArray(data)
        ? data
        : data?.data || data?.properties || data?.listings || [];
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

  const clearFieldErrors = (fields: (keyof FormErrors)[]) => {
    setErrors((prev) => {
      const next = { ...prev };
      fields.forEach((field) => {
        delete next[field];
      });
      return next;
    });
  };

  const updateField = (field: keyof CreateEnquiryForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field as keyof FormErrors]) {
      clearFieldErrors([field as keyof FormErrors]);
    }

    if (errorMessage) {
      setErrorMessage("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const getFieldError = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.find((item) => typeof item === "string") || "Invalid value";
    }

    if (typeof value === "string") {
      return value;
    }

    return undefined;
  };

  const inferFieldFromMessage = (message: string): keyof FormErrors | null => {
    const normalized = message.toLowerCase();

    if (normalized.includes("contact") || normalized.includes("phone")) {
      return "contact_no";
    }
    if (normalized.includes("email")) {
      return "email";
    }
    if (normalized.includes("name")) {
      return "name";
    }
    if (normalized.includes("description") || normalized.includes("message")) {
      return "description";
    }
    if (normalized.includes("address")) {
      return "address";
    }
    if (normalized.includes("state") || normalized.includes("region")) {
      return "state";
    }
    if (normalized.includes("county")) {
      return "county";
    }
    if (normalized.includes("city")) {
      return "city";
    }
    if (normalized.includes("zip") || normalized.includes("postal")) {
      return "zip";
    }
    if (normalized.includes("source") || normalized.includes("type")) {
      return "source";
    }
    if (normalized.includes("listing") || normalized.includes("property")) {
      return "listing_id";
    }
    if (normalized.includes("tour date")) {
      return "tour_date";
    }
    if (normalized.includes("time slot") || normalized.includes("tour time")) {
      return "time_slot";
    }
    if (normalized.includes("buy")) {
      return "planning_to_buy";
    }
    if (normalized.includes("sell")) {
      return "planning_to_sell";
    }

    return null;
  };

  const mapApiErrorsToForm = (apiErrors: unknown): FormErrors => {
    const nextErrors: FormErrors = {};

    if (Array.isArray(apiErrors)) {
      apiErrors
        .filter((item): item is string => typeof item === "string")
        .forEach((message) => {
          const mappedField = inferFieldFromMessage(message);
          if (mappedField && !nextErrors[mappedField]) {
            nextErrors[mappedField] = message;
          }
        });

      return nextErrors;
    }

    if (!apiErrors || typeof apiErrors !== "object") {
      return nextErrors;
    }

    Object.entries(apiErrors as Record<string, unknown>).forEach(
      ([field, value]) => {
      const message = getFieldError(value);

      if (!message) {
        return;
      }

      switch (field) {
        case "type":
        case "source":
          nextErrors.source = message;
          break;
        case "property_id":
        case "listing_id":
          nextErrors.listing_id = message;
          break;
        case "tour_date":
          nextErrors.tour_date = message;
          break;
        case "tour_time":
        case "time_slot":
          nextErrors.time_slot = message;
          break;
        case "address":
          nextErrors.address = message;
          break;
        case "region_id":
        case "state":
          nextErrors.state = message;
          break;
        case "county_id":
        case "county":
          nextErrors.county = message;
          break;
        case "city_id":
        case "city":
          nextErrors.city = message;
          break;
        case "zip":
        case "zipcode":
        case "postal_code":
          nextErrors.zip = message;
          break;
        case "schedule":
          if (form.source === SELL_SOURCE) {
            nextErrors.planning_to_sell = message;
          } else {
            nextErrors.planning_to_buy = message;
          }
          break;
        case "planning_to_buy":
          nextErrors.planning_to_buy = message;
          break;
        case "planning_to_sell":
          nextErrors.planning_to_sell = message;
          break;
        case "name":
        case "email":
        case "contact_no":
        case "description":
          nextErrors[field] = message;
          break;
        case "phone":
          nextErrors.contact_no = message;
          break;
        default:
          break;
      }
    },
    );

    return nextErrors;
  };

  useEffect(() => {
    const outsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
    clearFieldErrors(["listing_id"]);
    setErrorMessage("");
    setShowDropdown(false);
    setPropertyQuery("");
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const showListing = LISTING_SOURCES.includes(form.source);
    const showTourFields = form.source === SCHEDULE_TOUR_SOURCE;
    const showPlanning =
      form.source === SCHEDULE_TOUR_SOURCE || form.source === ENQUIRY_SOURCE;
    const showSellPlanning = form.source === SELL_SOURCE;

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

    if (!form.source) {
      nextErrors.source = "Source is required";
    }

    if (showListing && !form.listing_id) {
      nextErrors.listing_id = "Select a listing to attach";
    }

    if (showTourFields && !form.tour_date) {
      nextErrors.tour_date = "Tour date is required";
    }

    if (showTourFields && !form.time_slot) {
      nextErrors.time_slot = "Time slot is required";
    }

    if (showPlanning && !form.planning_to_buy) {
      nextErrors.planning_to_buy = "Select when the client plans to buy";
    }

    if (showSellPlanning && !form.planning_to_sell) {
      nextErrors.planning_to_sell = "Select when the client plans to sell";
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
    const uuid = sessionStorage.getItem("user_uuid") || "";
    try {
      const showListing = LISTING_SOURCES.includes(form.source);
      const showTourFields = form.source === SCHEDULE_TOUR_SOURCE;
      const showPlanning =
        form.source === SCHEDULE_TOUR_SOURCE || form.source === ENQUIRY_SOURCE;
      const showSellPlanning = form.source === SELL_SOURCE;

      const params = {
        lagnt: uuid,
        name: form.name.trim(),
        email: form.email.trim(),
        contact_no: form.contact_no.trim(),
        address: form.address.trim() || undefined,
        state: stateName || undefined,
        region_id: form.state || undefined,
        county_id: form.county || undefined,
        city: cityName || undefined,
        city_id: form.city || undefined,
        zip: form.zip.trim() || undefined,
        zipcode: form.zip.trim() || undefined,
        description: form.description.trim(),
        // source: form.source || undefined,
        type: form.source || undefined,
        // listing_id: showListing ? form.listing_id || undefined : undefined,
        property_id: showListing ? form.listing_id || undefined : undefined,
        tour_date: showTourFields ? form.tour_date || undefined : undefined,
        tour_time: showTourFields ? form.time_slot || undefined : undefined,
        // time_slot: showTourFields ? form.time_slot || undefined : undefined,
        // planning_to_buy: showPlanning
        //   ? form.planning_to_buy || undefined
        //   : undefined,

        // planning_to_sell: showSellPlanning
        //   ? form.planning_to_sell || undefined
        //   : undefined,

        schedule: showPlanning
          ? form.planning_to_buy || undefined
          : showSellPlanning
            ? form.planning_to_sell || undefined
            : undefined,
      };

      await axiosInstance.post("v1/admin/enquiry", params);

      setSuccessMessage("Enquiry created successfully.");
      setErrors({});
      setForm(initialForm);
      setStateName("");
      setCityName("");
      setSelectedProperty(null);
      setTimeout(() => router.push("/admin/inquiries"), 1200);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const apiErrors = err.response?.data?.errors;
        const mappedErrors = apiErrors ? mapApiErrorsToForm(apiErrors) : {};

        if (Object.keys(mappedErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...mappedErrors }));
        }

        if (err.response?.status === 422) {
          const fallbackValidationMessage = Array.isArray(apiErrors)
            ? apiErrors.find((item): item is string => typeof item === "string")
            : undefined;

          setErrorMessage(
            err.response?.data?.message ||
              fallbackValidationMessage ||
              "Review the highlighted fields and try again.",
          );
        } else {
          setErrorMessage(
            err.response?.data?.message ||
              err.message ||
              "Failed to create enquiry",
          );
        }
      } else {
        setErrorMessage("Failed to create enquiry");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">
          Add Enquiry
        </h1>
        <Link
          href="/admin/inquiries"
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
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {/* <p className="font-medium text-red-700">Unable to create enquiry</p> */}
              <p className="mt-1">{errorMessage}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Name
            </label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
              aria-invalid={!!errors.name}
              className={`rounded-xl focus:border-emerald-400 focus:ring-emerald-500/20 ${
                errors.name ? "border-red-300 focus:border-red-400" : "border-slate-200"
              }`}
              placeholder="Enter name"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
                aria-invalid={!!errors.email}
                className={`rounded-xl focus:border-emerald-400 focus:ring-emerald-500/20 ${
                  errors.email
                    ? "border-red-300 focus:border-red-400"
                    : "border-slate-200"
                }`}
                placeholder="name@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label
                htmlFor="contact_no"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Phone Number
              </label>
              <Input
                id="contact_no"
                value={form.contact_no}
                onChange={(e) => updateField("contact_no", e.target.value)}
                required
                aria-invalid={!!errors.contact_no}
                className={`rounded-xl focus:border-emerald-400 focus:ring-emerald-500/20 ${
                  errors.contact_no
                    ? "border-red-300 focus:border-red-400"
                    : "border-slate-200"
                }`}
                placeholder="Enter contact number"
              />
              {errors.contact_no && (
                <p className="text-xs text-red-500 mt-1">{errors.contact_no}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Address
            </label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              aria-invalid={!!errors.address}
              className={`rounded-xl focus:border-emerald-400 focus:ring-emerald-500/20 ${
                errors.address
                  ? "border-red-300 focus:border-red-400"
                  : "border-slate-200"
              }`}
              placeholder="Enter full address"
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                State
              </label>
              <select
                id="state"
                value={form.state}
                onChange={(e) => {
                  const value = e.target.value;
                  const selectedStateName = getOptionLabel(states, value);
                  setForm((prev) => ({
                    ...prev,
                    state: value,
                    county: "",
                    city: "",
                    zip: "",
                  }));
                  setStateName(selectedStateName);
                  setCityName("");
                  clearFieldErrors(["state", "county", "city", "zip"]);
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                disabled={statesLoading}
                aria-invalid={!!errors.state}
                className={`w-full px-4 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition ${
                  errors.state
                    ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                }`}
              >
                {renderSelect(states, statesLoading, "Select state")}
              </select>
              {errors.state && (
                <p className="text-xs text-red-500 mt-1">{errors.state}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="county"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                County
              </label>
              <select
                id="county"
                value={form.county}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    county: value,
                    city: "",
                    zip: "",
                  }));
                  setCityName("");
                  clearFieldErrors(["county", "city", "zip"]);
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                disabled={!form.state || countiesLoading}
                aria-invalid={!!errors.county}
                className={`w-full px-4 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition ${
                  errors.county
                    ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                }`}
              >
                {renderSelect(counties, countiesLoading, "Select county")}
              </select>
              {errors.county && (
                <p className="text-xs text-red-500 mt-1">{errors.county}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                City
              </label>
              <select
                id="city"
                value={form.city}
                onChange={(e) => {
                  const value = e.target.value;
                  const detectedZip = getCityZip(value);
                  const selectedCityName = getOptionLabel(cities, value);
                  setForm((prev) => ({
                    ...prev,
                    city: value,
                    zip: detectedZip || "",
                  }));
                  setCityName(selectedCityName);
                  clearFieldErrors(["city", "zip"]);
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                disabled={!form.county || citiesLoading}
                aria-invalid={!!errors.city}
                className={`w-full px-4 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition ${
                  errors.city
                    ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                }`}
              >
                {renderSelect(cities, citiesLoading, "Select city")}
              </select>
              {errors.city && (
                <p className="text-xs text-red-500 mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="zip"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Zip
              </label>
              <Input
                id="zip"
                value={form.zip}
                onChange={(e) => updateField("zip", e.target.value)}
                aria-invalid={!!errors.zip}
                className={`rounded-xl focus:border-emerald-400 focus:ring-emerald-500/20 ${
                  errors.zip
                    ? "border-red-300 focus:border-red-400"
                    : "border-slate-200"
                }`}
                placeholder={form.city ? "Auto-filled or enter zip" : "Enter zip"}
              />
              {errors.zip && (
                <p className="text-xs text-red-500 mt-1">{errors.zip}</p>
              )}
            </div>
          </div>
          

          {/* Source */}
          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Source
            </label>
            <select
              id="source"
              value={form.source}
              onChange={(e) => {
                const value = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  source: value,
                  listing_id: "",
                  tour_date: "",
                  time_slot: "",
                  planning_to_buy: "",
                  planning_to_sell: "",
                }));
                setSelectedProperty(null);
                setPropertyQuery("");
                setShowDropdown(false);
                clearFieldErrors([
                  "source",
                  "listing_id",
                  "tour_date",
                  "time_slot",
                  "planning_to_buy",
                  "planning_to_sell",
                ]);
                if (errorMessage) {
                  setErrorMessage("");
                }
                if (successMessage) {
                  setSuccessMessage("");
                }
              }}
              aria-invalid={!!errors.source}
              className={`w-full px-4 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition ${
                errors.source
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
              }`}
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
            {errors.source && (
              <p className="text-xs text-red-500 mt-1">{errors.source}</p>
            )}
          </div>

          {/* Listing Search — shown for specific sources */}
          {LISTING_SOURCES.includes(form.source) && (
            <div ref={dropdownRef}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Attach Listing
              </label>
              {!selectedProperty ? (
                <div className="relative">
                  <div
                    className={`flex items-center gap-2 w-full px-3 py-2 border rounded-xl bg-white transition ${
                      errors.listing_id
                        ? "border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-500/20"
                        : "border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20"
                    }`}
                  >
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
                        <p className="px-4 py-3 text-sm text-slate-400">
                          Loading listings...
                        </p>
                      )}
                      {!propertyLoading && propertyOptions.length === 0 && (
                        <p className="px-4 py-3 text-sm text-slate-400">
                          No listing found
                        </p>
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
                            <p className="text-xs text-slate-400 mt-0.5">
                              ID: {item.id}
                            </p>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-900">
                      {propertyLabel(selectedProperty)}
                    </p>
                    <p className="text-xs text-slate-500">
                      ID: {selectedProperty.id}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProperty(null);
                      setForm((prev) => ({ ...prev, listing_id: "" }));
                      setPropertyQuery("");
                      setShowDropdown(true);
                    }}
                    className="text-xs text-slate-500 hover:text-red-500 flex-shrink-0 transition"
                  >
                    Remove
                  </button>
                </div>
              )}
              {errors.listing_id && (
                <p className="text-xs text-red-500 mt-1">{errors.listing_id}</p>
              )}
            </div>
          )}

          {/* Schedule Tour extra fields */}
          {form.source === SCHEDULE_TOUR_SOURCE && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="tour_date"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Tour Date
                </label>
                <Input
                  id="tour_date"
                  type="date"
                  value={form.tour_date}
                  onChange={(e) => updateField("tour_date", e.target.value)}
                  aria-invalid={!!errors.tour_date}
                  className={`rounded-xl focus:border-emerald-400 focus:ring-emerald-500/20 ${
                    errors.tour_date
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-200"
                  }`}
                />
                {errors.tour_date && (
                  <p className="text-xs text-red-500 mt-1">{errors.tour_date}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="time_slot"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Time Slot
                </label>
                <select
                  id="time_slot"
                  value={form.time_slot}
                  onChange={(e) => updateField("time_slot", e.target.value)}
                  aria-invalid={!!errors.time_slot}
                  className={`w-full px-4 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition ${
                    errors.time_slot
                      ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                  }`}
                >
                  <option value="">Select time slot</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.time_slot && (
                  <p className="text-xs text-red-500 mt-1">{errors.time_slot}</p>
                )}
              </div>
            </div>
          )}

          {/* When planning to buy — shown for Schedule Tour and Inquiry */}
          {(form.source === SCHEDULE_TOUR_SOURCE ||
            form.source === ENQUIRY_SOURCE) && (
            <div>
              <label
                htmlFor="planning_to_buy"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                When are you planning to buy?
              </label>
              <select
                id="planning_to_buy"
                value={form.planning_to_buy}
                onChange={(e) => updateField("planning_to_buy", e.target.value)}
                aria-invalid={!!errors.planning_to_buy}
                className={`w-full px-4 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition ${
                  errors.planning_to_buy
                    ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                }`}
              >
                <option value="">Select timeline</option>
                {PLANNING_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {errors.planning_to_buy && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.planning_to_buy}
                </p>
              )}
            </div>
          )}

          {/* When planning to sell — shown for Sell */}
          {form.source === SELL_SOURCE && (
            <div>
              <label
                htmlFor="planning_to_sell"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                When are you planning to sell?
              </label>
              <select
                id="planning_to_sell"
                value={form.planning_to_sell}
                onChange={(e) => updateField("planning_to_sell", e.target.value)}
                aria-invalid={!!errors.planning_to_sell}
                className={`w-full px-4 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition ${
                  errors.planning_to_sell
                    ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                }`}
              >
                <option value="">Select timeline</option>
                {PLANNING_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {errors.planning_to_sell && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.planning_to_sell}
                </p>
              )}
            </div>
          )}

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Message
            </label>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              required
              aria-invalid={!!errors.description}
              className={`w-full px-4 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 transition resize-none ${
                errors.description
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
              }`}
              placeholder="Enter enquiry message"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Add Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
