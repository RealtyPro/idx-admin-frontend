"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSingleNeighbourhood } from "@/services/neighbourhood/NeighbourhoodQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNeighbourhood } from "@/services/neighbourhood/NeighbourhoodServices";
import { useStates, useCountiesByState, useCitiesByCounty } from "@/services/location/LocationQueries";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

export default function NeighbourhoodDetails() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const { data, isLoading, isError } = useSingleNeighbourhood(id);
  const neighbourhood = data?.data || data;

  const { data: statesData } = useStates();
  const { data: countiesData } = useCountiesByState(neighbourhood?.state_id ? String(neighbourhood.state_id) : "");
  const { data: citiesData } = useCitiesByCounty(neighbourhood?.county_id ? String(neighbourhood.county_id) : "");

  const statesList = statesData?.data || statesData || [];
  const countiesList = countiesData?.data || countiesData || [];
  const citiesList = citiesData?.data || citiesData || [];

  const findName = (list: any[], id: any, fallback: string) => {
    if (!id) return fallback;
    const item = list.find((s: any) => String(s.value || s.key || s.id) === String(id));
    return item?.text || item?.name || fallback;
  };

  const stateName = findName(statesList, neighbourhood?.state_id, neighbourhood?.state?.name || "N/A");
  const countyName = findName(countiesList, neighbourhood?.county_id, neighbourhood?.county?.name || "N/A");
  const cityName = findName(citiesList, neighbourhood?.city_id, neighbourhood?.city?.name || "N/A");

  const getImageUrl = () => {
    if (!neighbourhood) return null;
    const img = neighbourhood.images || neighbourhood.image;
    if (!img) return null;
    if (typeof img === "string") {
      if (img.includes("/img/default/") || img.includes("default")) return null;
      return img.startsWith("http") ? img : `https://demorealestate2.webnapps.net/storage/${img}`;
    }
    if (typeof img === "object" && img.path) return img.path.startsWith("http") ? img.path : `https://demorealestate2.webnapps.net/storage/${img.path}`;
    return null;
  };
  const imageUrl = getImageUrl();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteNeighbourhoodMutation = useMutation({
    mutationFn: (id: string) => deleteNeighbourhood(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["neighbourhoods"] }); router.push("/admin/neighbourhoods"); },
    onError: (error: any) => { alert(error?.response?.data?.message || error?.message || "Failed to delete."); },
  });

  const formatDate = (d?: string) => { if (!d) return "N/A"; const dt = new Date(d); return isNaN(dt.getTime()) ? "N/A" : dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

  if (isLoading) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4"><div className="flex items-center gap-3 mb-6"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-7 w-52" /></div><Skeleton className="h-[400px] w-full rounded-2xl" /><Skeleton className="h-[200px] w-full rounded-2xl" /></div>);
  }

  if (isError || !neighbourhood) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto"><div className="bg-white rounded-2xl border border-slate-100 p-8 text-center"><p className="text-slate-500 mb-4">Neighbourhood not found.</p><Link href="/admin/neighbourhoods" className="text-emerald-600 hover:underline text-sm">Back to Neighbourhoods</Link></div></div>);
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/neighbourhoods" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition"><ArrowLeftIcon className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-[22px] font-semibold text-slate-900">{neighbourhood.name || neighbourhood.title || "Neighbourhood Details"}</h1>
            {(neighbourhood.city_id || neighbourhood.state_id) && (
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5"><MapPinIcon className="w-3.5 h-3.5" />{[cityName !== "N/A" ? cityName : null, countyName !== "N/A" ? countyName : null, stateName !== "N/A" ? stateName : null].filter(Boolean).join(", ") || "Location not specified"}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/neighbourhoods/${id}/edit`} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"><PencilSquareIcon className="w-4 h-4" /> Edit</Link>
          <button onClick={() => setShowDeleteModal(true)} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition" title="Delete"><TrashIcon className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {imageUrl && (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <img src={imageUrl} alt={neighbourhood.name || "Neighbourhood"} className="w-full h-[400px] object-cover" onError={e => { e.currentTarget.style.display = "none"; }} />
          </div>
        )}

        <div className={`${imageUrl ? "lg:col-span-4" : "lg:col-span-12"} bg-white rounded-2xl border border-slate-100 p-6`}>
          <div className="flex items-center gap-2 mb-4"><BuildingOffice2Icon className="w-5 h-5 text-slate-400" /><h3 className="text-sm font-semibold text-slate-900">Details</h3></div>
          <div className="space-y-4">
            {[
              { label: "Status", value: neighbourhood.status, badge: true },
              { label: "State", value: stateName },
              { label: "County", value: countyName },
              { label: "City", value: cityName },
              { label: "Created", value: formatDate(neighbourhood.created_at) },
              { label: "Updated", value: formatDate(neighbourhood.updated_at) },
            ].filter(r => r.value && r.value !== "N/A").map((row, i) => (
              <div key={i}>
                <p className="text-xs text-slate-400 mb-0.5">{row.label}</p>
                {row.badge ? (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${String(row.value).toLowerCase() === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>{row.value && typeof row.value === "string" ? row.value.charAt(0).toUpperCase() + row.value.slice(1) : row.value}</span>
                ) : <p className="text-sm text-slate-700">{row.value}</p>}
              </div>
            ))}
            {(neighbourhood.properties_count !== undefined || neighbourhood.listings_count !== undefined) && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">Statistics</p>
                <div className="grid grid-cols-2 gap-3">
                  {neighbourhood.properties_count !== undefined && <div className="text-center p-3 bg-slate-50 rounded-xl"><p className="text-lg font-bold text-slate-900">{neighbourhood.properties_count}</p><p className="text-xs text-slate-500">Properties</p></div>}
                  {neighbourhood.listings_count !== undefined && <div className="text-center p-3 bg-slate-50 rounded-xl"><p className="text-lg font-bold text-slate-900">{neighbourhood.listings_count}</p><p className="text-xs text-slate-500">Listings</p></div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {neighbourhood.description && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 mt-6">
          <div className="flex items-center gap-2 mb-3"><InformationCircleIcon className="w-5 h-5 text-slate-400" /><h3 className="text-sm font-semibold text-slate-900">Description</h3></div>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{neighbourhood.description}</p>
        </div>
      )}

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent><DialogHeader><DialogTitle>Delete Neighbourhood</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete this neighbourhood? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteNeighbourhoodMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteNeighbourhoodMutation.mutate(id)} disabled={deleteNeighbourhoodMutation.isPending}>{deleteNeighbourhoodMutation.isPending ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}