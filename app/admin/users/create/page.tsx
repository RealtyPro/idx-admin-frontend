"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/services/Api";
import { searchProperties } from "@/services/property/PropertyServices";

interface PropertyItem {
  id: number | string;
  title?: string;
  address?: string;
  city?: string;
  mls_number?: string;
}

interface CreateUserForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  enquiryDetails: string;
  propertyId: string;
  source: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

const initialForm: CreateUserForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  enquiryDetails: "",
  propertyId: "",
  source: "",
};

export default function CreateUserPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateUserForm>(initialForm);
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
    setForm((prev) => ({ ...prev, propertyId: String(item.id) }));
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

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone is required";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
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
      const params = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        password_confirmation: form.confirmPassword,
        enquiry_details: form.enquiryDetails.trim(),
        property_id: form.propertyId || undefined,
        source: form.source || undefined,
        uuid: uuid,
      };

      await axiosInstance.post("customer/register", params, {});

      setSuccessMessage("User created successfully.");
      setForm(initialForm);
      setSelectedProperty(null);
      setTimeout(() => router.push("/admin/users"), 1200);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || "Failed to create user",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Add User</h1>
        <Link
          href="/admin/users"
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

          {/* Two-column grid for short fields */}
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
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
              placeholder="Enter full name"
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
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                placeholder="name@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Phone
              </label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
                required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                placeholder="Re-enter password"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Attach Listing */}
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
                            className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 border-b border-slate-50 last:border-b-0"
                          >
                            <p className="font-medium text-slate-800 truncate">
                              {propertyLabel(item)}
                            </p>
                            {item.city && (
                              <p className="text-xs text-slate-500 truncate">
                                {item.city}
                              </p>
                            )}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-emerald-700 truncate">
                      {propertyLabel(selectedProperty)}
                    </p>
                    {selectedProperty.city && (
                      <p className="text-xs text-emerald-600 truncate">
                        {selectedProperty.city}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProperty(null);
                      setForm((prev) => ({ ...prev, propertyId: "" }));
                    }}
                    className="text-xs text-slate-500 hover:text-red-500 flex-shrink-0 transition"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

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
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, source: e.target.value }))
                }
                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
              >
                <option value="">Select source</option>
                <option value="idx_general_form">IDX Website - General</option>
                <option value="idx_schedule_tour">
                  IDX Website - Schedule Tour
                </option>
                <option value="idx_enquiry_form">IDX Website - Enquiry</option>
                <option value="manual_idm_admin">
                  Manual Entry - IDM Admin
                </option>
              </select>
            </div>
          </div>

          {/* Enquire Details */}
          <div>
            <label
              htmlFor="enquiryDetails"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Enquire Details
            </label>
            <textarea
              id="enquiryDetails"
              rows={4}
              value={form.enquiryDetails}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, enquiryDetails: e.target.value }))
              }
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
              placeholder="Enter enquire details"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
