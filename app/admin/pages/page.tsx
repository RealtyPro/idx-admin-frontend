"use client";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { usePages } from "@/services/page/PageQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePage } from "@/services/page/PageServices";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

export default function PagesListPage() {
  const router = useRouter();
  const page = 1;
  const { data, isLoading, isError, error } = usePages(page);
  const queryClient = useQueryClient();
  const pages = data?.data || data || [];

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deletePageMutation = useMutation({
    mutationFn: (id: string) => deletePage(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pages"] }); setShowDeleteModal(false); setDeleteId(null); },
    onError: (error: any) => { alert(error?.response?.data?.message || error?.message || "Failed to delete page."); },
  });

  const formatDate = (d?: string) => { if (!d) return ""; const dt = new Date(d); return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

  const avatarColors = ["bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700"];
  const getColor = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length]; };

  if (isLoading) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4"><div className="flex justify-between items-center mb-6"><Skeleton className="h-7 w-24" /><Skeleton className="h-10 w-32 rounded-full" /></div>{[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-[80px] w-full rounded-2xl" />))}</div>);
  }

  if (isError) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto"><p className="text-red-500">Error: {error instanceof Error ? error.message : "Unknown error"}</p></div>);
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Pages</h1>
        <Link href="/admin/pages/create" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
          <PlusIcon className="w-4 h-4" /> Add Page
        </Link>
      </div>

      <div className="space-y-3">
        {Array.isArray(pages) && pages.length > 0 ? (
          pages.map((p: any) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex overflow-hidden cursor-pointer" onClick={() => router.push(`/admin/pages/${p.id}`)}>
              <div className="w-[80px] min-h-[80px] flex-shrink-0 flex items-center justify-center hidden sm:flex">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${getColor(p.title || p.name || "")}`}>
                  {(p.title || p.name || "P").split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join("")}
                </div>
              </div>
              <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center">
                <span className="text-[15px] font-semibold text-slate-900 truncate">{p.title || p.name || "Untitled"}</span>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  {p.slug && <span className="flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5 text-slate-400" />/{p.slug}</span>}
                  {(p.date || p.created_at) && <span className="flex items-center gap-1"><CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />{formatDate(p.date || p.created_at)}</span>}
                  {p.status && <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${p.status === "show" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>{p.status === "show" ? "Visible" : "Hidden"}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 pr-5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <Link href={`/admin/pages/${p.id}`} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"><EyeIcon className="w-4 h-4" /> View</Link>
                <Link href={`/admin/pages/${p.id}/edit`} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition" title="Edit"><PencilSquareIcon className="w-4 h-4" /></Link>
                <button onClick={() => { setDeleteId(p.id); setShowDeleteModal(true); }} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition" title="Delete"><TrashIcon className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-400"><DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-lg">No pages found.</p></div>
        )}
      </div>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent><DialogHeader><DialogTitle>Delete Page</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete this page? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deletePageMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) deletePageMutation.mutate(deleteId); }} disabled={deletePageMutation.isPending}>{deletePageMutation.isPending ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}