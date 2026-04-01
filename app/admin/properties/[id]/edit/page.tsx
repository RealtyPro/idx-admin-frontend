"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useSingleProperty } from "@/services/property/PropertyQueries";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const { data, isLoading, isError } = useSingleProperty(id);
  const property = data?.data || data;

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (property) {
      setTitle(property.title || property.name || "");
      setAddress(property.address || "");
      setPrice(property.price?.toString() || "");
      setStatus(property.status || "");
      setDescription(property.description || property.content || "");
    }
  }, [property]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Update functionality will be implemented when the update API endpoint is available.");
  };

  const labelCls = "block text-xs font-medium text-slate-700 mb-1.5";
  const inputCls = "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition placeholder:text-slate-400";
  const selectCls = "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition";

  if (isLoading) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4"><div className="flex items-center gap-3 mb-6"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-7 w-52" /></div><Skeleton className="h-[400px] w-full rounded-2xl" /></div>);
  }

  if (isError || !property) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto"><div className="bg-white rounded-2xl border border-slate-100 p-8 text-center"><p className="text-slate-500 mb-4">Property not found.</p><Link href="/admin/properties" className="text-emerald-600 hover:underline text-sm">Back to Properties</Link></div></div>);
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/properties/${id}`} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition"><ArrowLeftIcon className="w-4 h-4" /></Link>
        <h1 className="text-[22px] font-semibold text-slate-900">Edit Property</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
          <h3 className="text-sm font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className={labelCls}>Title</label>
              <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="Property title" />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input className={inputCls} value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address" />
            </div>
            <div>
              <label className={labelCls}>Price</label>
              <input className={inputCls} type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={selectCls} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">Select status</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea className={`${inputCls} min-h-[140px]`} value={description} onChange={e => setDescription(e.target.value)} placeholder="Property description..." />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Link href={`/admin/properties/${id}`} className="px-5 py-2.5 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Cancel</Link>
          <button type="submit" className="px-5 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">Save Changes</button>
        </div>
      </form>
    </div>
  );
}