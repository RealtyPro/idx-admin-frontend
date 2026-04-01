"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import axiosInstance from "@/services/Api";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface EditUserForm {
  name: string;
  email: string;
  phone: string;
  enquiryDetails: string;
  propertyId: string;
  source: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

const initialForm: EditUserForm = {
  name: "",
  email: "",
  phone: "",
  enquiryDetails: "",
  propertyId: "",
  source: "",
};

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [form, setForm] = useState<EditUserForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setIsError(true);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setIsError(false);
      try {
        const res = await axiosInstance.get(`v1/user/customer/${id}`);
        const payload = res?.data?.data || res?.data || null;
        setUser(payload);
      } catch {
        setIsError(true);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.contact_no || "",
        enquiryDetails: user.enquiry?.message || "",
        propertyId: user.listing?.id ? String(user.listing.id) : "",
        source: user.enquiry?.source || "",
      });
    }
  }, [user]);

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = "Enter a valid email";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required";
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
      const params = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        enquiry_details: form.enquiryDetails.trim(),
        property_id: form.propertyId || undefined,
        source: form.source || undefined,
      };
      await axiosInstance.put(`v1/user/customer/${id}`, params);
      setSuccessMessage("User updated successfully.");
      setTimeout(() => router.push(`/admin/users/${id}`), 1200);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || "Failed to update user"
      );
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

  if (isError || !user) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          User not found.
        </div>
        <Link href="/admin/users" className="mt-4 inline-block px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition">
          <ArrowLeftIcon className="w-4 h-4 inline mr-2" /> Back
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Edit User</h1>
        <Link
          href={`/admin/users/${id}`}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Link>
      </div>
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
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
              placeholder="Enter full name"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
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
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="enquiryDetails" className="block text-sm font-medium text-slate-700 mb-1.5">Enquire Details</label>
            <textarea
              id="enquiryDetails"
              rows={4}
              value={form.enquiryDetails}
              onChange={(e) => setForm((prev) => ({ ...prev, enquiryDetails: e.target.value }))}
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
              placeholder="Enter enquire details"
            />
          </div>
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-slate-700 mb-1.5">Source</label>
            <select
              id="source"
              value={form.source}
              onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
            >
              <option value="">Select source</option>
              <option value="idx_general_form">IDX Website - General</option>
              <option value="idx_schedule_tour">IDX Website - Schedule Tour</option>
              <option value="idx_enquiry_form">IDX Website - Enquiry</option>
              <option value="manual_idm_admin">Manual Entry - IDM Admin</option>
            </select>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
