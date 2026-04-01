"use client";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useProperties } from "@/services/property/PropertyQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProperty } from "@/services/property/PropertyServices";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HomeModernIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

export default function PropertiesListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isLoading, isError, error } = useProperties({ page: currentPage });
  const properties = data?.data || data || [];
  const pagination = data?.meta || data?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || 1;
  const currentPageNum = pagination?.current_page || currentPage;
  const totalItems = pagination?.total || pagination?.totalItems || properties.length;

  const deletePropertyMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["properties"] }); setShowDeleteModal(false); setDeleteId(null); },
    onError: (error: any) => { alert(error?.response?.data?.message || error?.message || "Failed to delete."); },
  });

  const formatPrice = (p: any) => { if (!p) return ""; const n = typeof p === "number" ? p : parseFloat(p); return isNaN(n) ? p : `$${n.toLocaleString()}`; };
  const formatDate = (d?: string) => { if (!d) return ""; const dt = new Date(d); return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };
  const getImageUrl = (prop: any) => {
    const img = prop.images || prop.image;
    if (!img) return null;
    if (typeof img === "string") return img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${img}`;
    if (typeof img === "object" && img.path) return img.path.startsWith("http") ? img.path : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${img.path}`;
    if (Array.isArray(img) && img.length > 0) { const f = img[0]; return typeof f === "string" ? (f.startsWith("http") ? f : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${f}`) : f.path ? (f.path.startsWith("http") ? f.path : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${f.path}`) : null; }
    return null;
  };
  const avatarColors = ["bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700"];
  const getColor = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length]; };

  const handlePageChange = (page: number) => { if (page >= 1 && page <= totalPages) { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); } };

  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;
    const pages: number[] = [];
    const max = 5;
    let s = Math.max(1, currentPageNum - Math.floor(max / 2));
    let e = Math.min(totalPages, s + max - 1);
    if (e - s < max - 1) s = Math.max(1, e - max + 1);
    for (let i = s; i <= e; i++) pages.push(i);
    return (
      <div className="flex flex-col items-center gap-3 mt-8">
        <div className="flex items-center gap-1.5">
          <button onClick={() => handlePageChange(currentPageNum - 1)} disabled={currentPageNum === 1 || isLoading} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Previous</button>
          {s > 1 && (<><button onClick={() => handlePageChange(1)} className={`w-8 h-8 text-sm rounded-lg border transition ${1 === currentPageNum ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}>1</button>{s > 2 && <span className="px-1 text-slate-400">...</span>}</>)}
          {pages.map(p => (<button key={p} onClick={() => handlePageChange(p)} disabled={isLoading} className={`w-8 h-8 text-sm rounded-lg border transition ${p === currentPageNum ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}>{p}</button>))}
          {e < totalPages && (<>{e < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}<button onClick={() => handlePageChange(totalPages)} className={`w-8 h-8 text-sm rounded-lg border transition ${totalPages === currentPageNum ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}>{totalPages}</button></>)}
          <button onClick={() => handlePageChange(currentPageNum + 1)} disabled={currentPageNum === totalPages || isLoading} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Next</button>
        </div>
        <p className="text-xs text-slate-400">Page {currentPageNum} of {totalPages}{totalItems ? ` (${totalItems} total)` : ""}</p>
      </div>
    );
  };

  if (isLoading) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4"><div className="flex justify-between items-center mb-6"><Skeleton className="h-7 w-32" /></div>{[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-[100px] w-full rounded-2xl" />))}</div>);
  }

  if (isError) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto"><p className="text-red-500">Error: {error instanceof Error ? error.message : "Unknown error"}</p></div>);
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Properties</h1>
      </div>

      <div className="space-y-3">
        {Array.isArray(properties) && properties.length > 0 ? (
          properties.map((prop: any) => {
            const imgUrl = getImageUrl(prop);
            const name = prop.title || prop.name || prop.address || `Property ${prop.id}`;
            return (
              <div key={prop.id} className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex overflow-hidden cursor-pointer" onClick={() => router.push(`/admin/properties/${prop.id}`)}>
                <div className="w-[120px] min-h-[100px] flex-shrink-0 hidden sm:block relative">
                  {imgUrl ? (
                    <img src={imgUrl} alt={name} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; const sib = e.currentTarget.nextElementSibling as HTMLElement; if (sib) sib.style.display = "flex"; }} />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${getColor(name)}`} style={{ display: imgUrl ? "none" : "flex" }}>
                    <HomeModernIcon className="w-8 h-8 opacity-60" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center">
                  <span className="text-[15px] font-semibold text-slate-900 truncate">{name}</span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                    {prop.address && <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5 text-slate-400" />{prop.address}</span>}
                    {prop.price && <span className="flex items-center gap-1 font-medium text-emerald-600"><CurrencyDollarIcon className="w-3.5 h-3.5" />{formatPrice(prop.price)}</span>}
                    {prop.created_at && <span className="flex items-center gap-1"><CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />{formatDate(prop.created_at)}</span>}
                  </div>
                  {prop.status && <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium mt-2 w-fit ${["available","active"].includes(String(prop.status).toLowerCase()) ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>{prop.status}</span>}
                </div>
                <div className="flex items-center gap-2 pr-5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <Link href={`/admin/properties/${prop.id}`} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"><EyeIcon className="w-4 h-4" /> View</Link>
                  <Link href={`/admin/properties/${prop.id}/edit`} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition" title="Edit"><PencilSquareIcon className="w-4 h-4" /></Link>
                  <button onClick={() => { setDeleteId(prop.id); setShowDeleteModal(true); }} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 text-slate-400"><HomeModernIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-lg">No properties found.</p></div>
        )}
      </div>

      {renderPagination()}

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent><DialogHeader><DialogTitle>Delete Property</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete this property? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deletePropertyMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) deletePropertyMutation.mutate(deleteId); }} disabled={deletePropertyMutation.isPending}>{deletePropertyMutation.isPending ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}