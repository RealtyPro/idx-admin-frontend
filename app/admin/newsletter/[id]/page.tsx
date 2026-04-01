"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/services/Api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  UserIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

export default function NewsletterDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: subscriber, isLoading, isError, error } = useSingleNewsletterSubscriber(id);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`v1/admin/newsletter/${id}`);
      router.push("/admin/newsletter");
    } catch {
      alert("Failed to delete subscriber.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-6"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-7 w-48" /></div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !subscriber) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto"><p className="text-red-500">Error: {error instanceof Error ? error.message : "Subscriber not found"}</p></div>);
  }

  const avatarColors = ["bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700"];
  const getAvatarColor = (str: string) => { let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length]; };
  const acronym = (subscriber.email || subscriber.name || "N").slice(0, 2).toUpperCase();

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/newsletter" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition">
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <h1 className="text-[22px] font-semibold text-slate-900">Subscriber Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/newsletter/${id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
            <PencilSquareIcon className="w-4 h-4" /> Edit
          </Link>
          <button onClick={() => setShowDeleteModal(true)}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition" title="Delete">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 ${getAvatarColor(subscriber.email || subscriber.name || "")}`}>{acronym}</div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{subscriber.name || "No Name"}</h2>
              {subscriber.email && <p className="text-sm text-slate-500 mt-0.5">{subscriber.email}</p>}
              {subscriber.status && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium mt-2 ${String(subscriber.status).toLowerCase() === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
                  {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                </span>
              )}
            </div>
          </div>
          {subscriber.description && (
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-2">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{subscriber.description}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Details</h3>
          <div className="space-y-4">
            {[
              { icon: UserIcon, label: "Name", value: subscriber.name },
              { icon: EnvelopeIcon, label: "Email", value: subscriber.email },
              { icon: PhoneIcon, label: "Phone", value: subscriber.contact_no },
              { icon: InformationCircleIcon, label: "Status", value: subscriber.status },
              { icon: CalendarDaysIcon, label: "Created", value: formatDate(subscriber.created_at) },
              { icon: CalendarDaysIcon, label: "Updated", value: formatDate(subscriber.updated_at) },
            ].filter(r => r.value).map((row, i) => (
              <div key={i} className="flex items-start gap-3">
                <row.icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div><p className="text-xs text-slate-400">{row.label}</p><p className="text-sm text-slate-700">{row.value}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Subscriber</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete this subscriber? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}