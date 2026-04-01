"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSinglePage } from "@/services/page/PageQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePage } from "@/services/page/PageServices";
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon, CalendarDaysIcon, LinkIcon } from "@heroicons/react/24/outline";

export default function PageDetails() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const { data, isLoading, isError } = useSinglePage(id);
  const page = data?.data || data;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deletePageMutation = useMutation({
    mutationFn: (id: string) => deletePage(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pages"] }); router.push("/admin/pages"); },
    onError: (error: any) => { alert(error?.response?.data?.message || error?.message || "Failed to delete."); },
  });

  const formatDate = (d?: string) => { if (!d) return "N/A"; const dt = new Date(d); return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

  if (isLoading) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4"><div className="flex items-center gap-3 mb-6"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-7 w-48" /></div><Skeleton className="h-[300px] w-full rounded-2xl" /></div>);
  }

  if (isError || !page) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto"><div className="bg-white rounded-2xl border border-slate-100 p-8 text-center"><p className="text-slate-500 mb-4">Page not found.</p><Link href="/admin/pages" className="text-emerald-600 hover:underline text-sm">Back to Pages</Link></div></div>);
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition"><ArrowLeftIcon className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-[22px] font-semibold text-slate-900">{page.title || "Page Details"}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              {page.slug && <span className="flex items-center gap-1 text-xs text-slate-500"><LinkIcon className="w-3.5 h-3.5" />/{page.slug}</span>}
              {(page.date || page.created_at) && <span className="flex items-center gap-1 text-xs text-slate-500"><CalendarDaysIcon className="w-3.5 h-3.5" />{formatDate(page.date || page.created_at)}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/pages/${id}/edit`} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"><PencilSquareIcon className="w-4 h-4" /> Edit</Link>
          <button onClick={() => setShowDeleteModal(true)} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition" title="Delete"><TrashIcon className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Content</h3>
          {page.content ? (
            <div className="prose max-w-none text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <p className="text-sm text-slate-400 italic">No content available</p>
          )}
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Details</h3>
            <div className="space-y-3">
              {[
                { label: "Name", value: page.name },
                { label: "Title", value: page.title },
                { label: "Heading", value: page.heading },
                { label: "Sub Heading", value: page.sub_heading },
                { label: "Slug", value: page.slug },
                { label: "Status", value: page.status, badge: true },
                { label: "Order", value: page.order },
                { label: "Created", value: formatDate(page.created_at) },
                { label: "Updated", value: formatDate(page.updated_at) },
              ].filter(r => r.value).map((row, i) => (
                <div key={i}>
                  <p className="text-xs text-slate-400">{row.label}</p>
                  {row.badge ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium mt-0.5 ${row.value === "show" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>{row.value === "show" ? "Visible" : "Hidden"}</span>
                  ) : <p className="text-sm text-slate-700">{row.value}</p>}
                </div>
              ))}
            </div>
          </div>
          {(page.meta_title || page.meta_keyword || page.meta_description) && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">SEO</h3>
              <div className="space-y-3">
                {page.meta_title && <div><p className="text-xs text-slate-400">Meta Title</p><p className="text-sm text-slate-700">{page.meta_title}</p></div>}
                {page.meta_keyword && <div><p className="text-xs text-slate-400">Meta Keywords</p><p className="text-sm text-slate-700">{page.meta_keyword}</p></div>}
                {page.meta_description && <div><p className="text-xs text-slate-400">Meta Description</p><p className="text-sm text-slate-700">{page.meta_description}</p></div>}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent><DialogHeader><DialogTitle>Delete Page</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete this page? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deletePageMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletePageMutation.mutate(id)} disabled={deletePageMutation.isPending}>{deletePageMutation.isPending ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}