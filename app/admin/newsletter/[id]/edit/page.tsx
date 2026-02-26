"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/services/Api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, NewspaperIcon } from "@heroicons/react/24/outline";

const useSingleNewsletterSubscriber = (id: string) => {
  return useQuery({
    queryKey: ["newsletter-subscriber", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`v1/admin/newsletter/${id}`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });
};

export default function EditNewsletterPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: subscriber, isLoading } = useSingleNewsletterSubscriber(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_no: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    if (subscriber) {
      setFormData({
        name: subscriber.name || "",
        email: subscriber.email || "",
        contact_no: subscriber.contact_no || "",
        description: subscriber.description || "",
        status: subscriber.status || "active",
      });
    }
  }, [subscriber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosInstance.put(`v1/admin/newsletter/${id}`, formData);
      router.push(`/admin/newsletter/${id}`);
    } catch (err) {
      console.error("Failed to update subscriber:", err);
      alert("Failed to update subscriber. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-6"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-7 w-48" /></div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/newsletter/${id}`} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition">
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
        <h1 className="text-[22px] font-semibold text-slate-900">Edit Subscriber</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center"><NewspaperIcon className="w-5 h-5 text-emerald-600" /></div>
          <div><h2 className="text-base font-semibold text-slate-900">Subscriber Details</h2><p className="text-xs text-slate-500">Update subscriber information</p></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name <span className="text-red-400">*</span></label>
            <input name="name" value={formData.name} onChange={handleChange} required placeholder="Full name"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email <span className="text-red-400">*</span></label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Email address"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Number</label>
            <input name="contact_no" value={formData.contact_no} onChange={handleChange} placeholder="Phone number"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select name="status" value={formData.status} onChange={handleChange}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Notes or description..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition resize-none" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors">
            {isSubmitting ? "Saving..." : "Update Subscriber"}
          </button>
          <Link href={`/admin/newsletter/${id}`} className="px-6 py-2.5 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}