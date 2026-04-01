"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSingleProperty } from "@/services/property/PropertyQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProperty } from "@/services/property/PropertyServices";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  HomeModernIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const { data, isLoading, isError } = useSingleProperty(id);
  const property = data?.data || data;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deletePropertyMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["properties"] }); router.push("/admin/properties"); },
    onError: (error: any) => { alert(error?.response?.data?.message || error?.message || "Failed to delete."); },
  });

  const getImageUrl = () => {
    if (!property) return null;
    const img = property.images || property.image;
    if (!img) return null;
    if (typeof img === "string") return img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${img}`;
    if (typeof img === "object" && !Array.isArray(img) && img.path) return img.path.startsWith("http") ? img.path : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${img.path}`;
    if (Array.isArray(img) && img.length > 0) { const f = img[0]; return typeof f === "string" ? (f.startsWith("http") ? f : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${f}`) : f?.path ? (f.path.startsWith("http") ? f.path : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${f.path}`) : null; }
    return null;
  };
  const imageUrl = getImageUrl();
  const formatDate = (d?: string) => { if (!d) return "N/A"; const dt = new Date(d); return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };
  const formatPrice = (p: any) => { if (!p) return ""; const n = typeof p === "number" ? p : parseFloat(p); return isNaN(n) ? p : `$${n.toLocaleString()}`; };

  if (isLoading) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4"><div className="flex items-center gap-3 mb-6"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-7 w-52" /></div><Skeleton className="h-[400px] w-full rounded-2xl" /><Skeleton className="h-[200px] w-full rounded-2xl" /></div>);
  }

  if (isError || !property) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto"><div className="bg-white rounded-2xl border border-slate-100 p-8 text-center"><p className="text-slate-500 mb-4">Property not found.</p><Link href="/admin/properties" className="text-emerald-600 hover:underline text-sm">Back to Properties</Link></div></div>);
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/properties" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition"><ArrowLeftIcon className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-[22px] font-semibold text-slate-900">{property.title || property.name || "Property Details"}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              {property.address && <span className="flex items-center gap-1 text-xs text-slate-500"><MapPinIcon className="w-3.5 h-3.5" />{property.address}</span>}
              {property.price && <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CurrencyDollarIcon className="w-3.5 h-3.5" />{formatPrice(property.price)}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/properties/${id}/edit`} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"><PencilSquareIcon className="w-4 h-4" /> Edit</Link>
          <button onClick={() => setShowDeleteModal(true)} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition" title="Delete"><TrashIcon className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {imageUrl && (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <img src={imageUrl} alt={property.title || "Property"} className="w-full h-[400px] object-cover" onError={e => { e.currentTarget.style.display = "none"; }} />
          </div>
        )}
        <div className={`${imageUrl ? "lg:col-span-4" : "lg:col-span-12"} bg-white rounded-2xl border border-slate-100 p-6`}>
          <div className="flex items-center gap-2 mb-4"><HomeModernIcon className="w-5 h-5 text-slate-400" /><h3 className="text-sm font-semibold text-slate-900">Details</h3></div>
          <div className="space-y-4">
            {property.status && <div><p className="text-xs text-slate-400">Status</p><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium mt-0.5 ${["available","active"].includes(String(property.status).toLowerCase()) ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>{property.status}</span></div>}
            {property.price && <div><p className="text-xs text-slate-400">Price</p><p className="text-lg font-semibold text-slate-900">{formatPrice(property.price)}</p></div>}
            {property.property_type && <div><p className="text-xs text-slate-400">Type</p><p className="text-sm text-slate-700 capitalize">{property.property_type}</p></div>}
            {(property.bedrooms || property.bathrooms || property.square_feet) && (
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                {property.bedrooms && <div className="text-center"><p className="text-lg font-bold text-slate-900">{property.bedrooms}</p><p className="text-xs text-slate-500">Beds</p></div>}
                {property.bathrooms && <div className="text-center"><p className="text-lg font-bold text-slate-900">{property.bathrooms}</p><p className="text-xs text-slate-500">Baths</p></div>}
                {property.square_feet && <div className="text-center"><p className="text-lg font-bold text-slate-900">{property.square_feet}</p><p className="text-xs text-slate-500">Sq Ft</p></div>}
              </div>
            )}
            {property.address && <div><p className="text-xs text-slate-400">Address</p><p className="text-sm text-slate-700">{property.address}</p></div>}
            {property.created_at && <div><p className="text-xs text-slate-400">Created</p><p className="text-sm text-slate-700">{formatDate(property.created_at)}</p></div>}
          </div>
        </div>
      </div>

      {(property.description || property.content) && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 mt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Description</h3>
          <div className="prose max-w-none text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: property.description || property.content || "" }} />
        </div>
      )}

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent><DialogHeader><DialogTitle>Delete Property</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete this property? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deletePropertyMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletePropertyMutation.mutate(id)} disabled={deletePropertyMutation.isPending}>{deletePropertyMutation.isPending ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}