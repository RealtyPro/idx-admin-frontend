"use client";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNeighbourhoods, useDeleteNeighbourhood } from "@/services/neighbourhood/NeighbourhoodQueries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNeighbourhood, NeighbourhoodSearchParams } from "@/services/neighbourhood/NeighbourhoodServices";
import { useStates, useCountiesByState, useCitiesByCounty } from "@/services/location/LocationQueries";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarDaysIcon,
  MapPinIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function NeighbourhoodsListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const prevNeighbourhoodsRef = useRef<any[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchParams, setSearchParams] = useState<NeighbourhoodSearchParams>({ region_id: "", county_id: "", city_id: "", keyword: "" });
  const [activeFilters, setActiveFilters] = useState<NeighbourhoodSearchParams>({ region_id: "", county_id: "", city_id: "", keyword: "" });

  const { data: statesData, isLoading: statesLoading } = useStates();
  const { data: countiesData, isLoading: countiesLoading } = useCountiesByState(searchParams.region_id);
  const { data: citiesData, isLoading: citiesLoading } = useCitiesByCounty(searchParams.county_id);

  const states = statesData?.data || statesData || [];
  const counties = countiesData?.data || countiesData || [];
  const cities = citiesData?.data || citiesData || [];

  useEffect(() => { if (searchParams.region_id) setSearchParams(p => ({ ...p, county_id: "", city_id: "" })); }, [searchParams.region_id]);
  useEffect(() => { if (searchParams.county_id) setSearchParams(p => ({ ...p, city_id: "" })); }, [searchParams.county_id]);

  const { data, isLoading, isFetching, isError, error } = useNeighbourhoods({ ...activeFilters, page: currentPage });
  const freshNeighbourhoods: any[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  if (freshNeighbourhoods.length > 0) prevNeighbourhoodsRef.current = freshNeighbourhoods;
  // Only fall back to old data while a fetch is in-flight; an empty completed response should show the empty state
  const neighbourhoods = (freshNeighbourhoods.length === 0 && isFetching) ? prevNeighbourhoodsRef.current : freshNeighbourhoods;
  const pagination = data?.meta || data?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1;
  const currentPageNum = pagination?.current_page || pagination?.currentPage || currentPage;
  const totalItems = pagination?.total || pagination?.totalItems || neighbourhoods.length;

  const deleteNeighbourhoodMutation = useMutation({
    mutationFn: (id: string) => deleteNeighbourhood(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["neighbourhoods"] }); setShowDeleteModal(false); setDeleteId(null); },
    onError: (error: any) => { alert(error?.response?.data?.message || error?.message || "Failed to delete neighbourhood."); },
  });

  const hasActiveFilters = !!(activeFilters.region_id || activeFilters.county_id || activeFilters.city_id || activeFilters.keyword);

  const handleSearch = () => { setActiveFilters({ ...searchParams }); setCurrentPage(1); };

  /* debounced keyword search — 500ms */
  const handleKeywordChange = useCallback((value: string) => {
    setSearchParams(p => ({ ...p, keyword: value }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim() === "" || value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        setActiveFilters(prev => ({ ...prev, keyword: value }));
        setCurrentPage(1);
      }, 500);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearSearch = () => {
    const cleared: NeighbourhoodSearchParams = { region_id: "", county_id: "", city_id: "", keyword: "" };
    setSearchParams(cleared); setActiveFilters(cleared); setCurrentPage(1);
  };

  const getNeighbourhoodImageUrl = (n: any): string | null => {
    const img = n.images || n.image;
    if (!img) return null;
    if (typeof img === "string") {
      if (img.includes("/img/default/") || img.includes("default")) return null;
      return img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${img}`;
    }
    if (typeof img === "object" && img.path) return img.path.startsWith("http") ? img.path : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${img.path}`;
    return null;
  };

  const getAcronym = (n: any): string => {
    const label = n.name || n.city?.name || n.city || "N";
    return label.split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join("");
  };

  const avatarColors = ["bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700"];
  const getAvatarColor = (str: string) => { let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h); return avatarColors[Math.abs(h) % avatarColors.length]; };

  const formatDate = (d: string) => { if (!d) return ""; const dt = new Date(d); if (isNaN(dt.getTime())) return d; return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); };

  const handlePageChange = (page: number) => { if (page >= 1 && page <= totalPages) { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); } };

  const renderPagination = () => {
    if (totalPages <= 1 && (!pagination || neighbourhoods.length < 10)) return null;
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
        {pagination && <p className="text-xs text-slate-400">Page {currentPageNum} of {totalPages}{totalItems ? ` (${totalItems} total items)` : ""}</p>}
      </div>
    );
  };

  if (isLoading && prevNeighbourhoodsRef.current.length === 0) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4"><div className="flex justify-between items-center mb-2"><Skeleton className="h-7 w-44" /><div className="flex gap-3"><Skeleton className="h-10 w-[300px] rounded-full" /><Skeleton className="h-10 w-32 rounded-full" /></div></div>{[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-[100px] w-full rounded-2xl" />))}</div>);
  }

  if (isError) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto"><p className="text-red-500">Error: {error instanceof Error ? error.message : "Unknown error"}</p></div>);
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Top progress bar ---- */}
      <div className={`fixed top-0 left-0 right-0 z-50 h-[3px] overflow-hidden transition-opacity duration-300 ${isFetching ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="h-full bg-emerald-500 animate-[progressBar_1.2s_ease-in-out_infinite]" />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Neighbourhoods</h1>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:flex items-center">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 text-slate-400" />
            <input type="text" placeholder="Search neighbourhoods..." value={searchParams.keyword || ""}
              onChange={e => handleKeywordChange(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
              className="w-[260px] pl-9 pr-4 py-2 text-sm rounded-full border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border transition-colors ${hasActiveFilters ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <FunnelIcon className="w-4 h-4" /> Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
          </button>
          <Link href="/admin/neighbourhoods/create" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
            <PlusIcon className="w-4 h-4" /> Add New
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-5 space-y-4">
          <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold text-slate-900">Filter by Location</h3>{hasActiveFilters && <button onClick={handleClearSearch} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"><XMarkIcon className="w-3 h-3" /> Clear all</button>}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
              <select value={searchParams.region_id || ""} onChange={e => setSearchParams(p => ({ ...p, region_id: e.target.value }))} disabled={statesLoading}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition disabled:opacity-50">
                <option value="">{statesLoading ? "Loading..." : "All states"}</option>
                {Array.isArray(states) && states.map((o: any) => <option key={o.id} value={o.id}>{o.name || o.title || o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">County</label>
              <select value={searchParams.county_id || ""} onChange={e => setSearchParams(p => ({ ...p, county_id: e.target.value }))} disabled={!searchParams.region_id || countiesLoading}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition disabled:opacity-50">
                <option value="">{countiesLoading ? "Loading..." : "All counties"}</option>
                {Array.isArray(counties) && counties.map((o: any) => <option key={o.id} value={o.id}>{o.name || o.title || o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
              <select value={searchParams.city_id || ""} onChange={e => setSearchParams(p => ({ ...p, city_id: e.target.value }))} disabled={!searchParams.county_id || citiesLoading}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition disabled:opacity-50">
                <option value="">{citiesLoading ? "Loading..." : "All cities"}</option>
                {Array.isArray(cities) && cities.map((o: any) => <option key={o.id} value={o.id}>{o.name || o.title || o.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleSearch} className="px-5 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">Apply Filters</button>
        </div>
      )}

      <div className="relative">
        {isFetching && neighbourhoods.length > 0 && (
          <div className="absolute inset-0 z-20 rounded-2xl flex items-center justify-center" style={{ animation: "overlayFadeIn 0.18s ease forwards" }}>
            <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[2px]" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Loading results…</span>
            </div>
          </div>
        )}
        <div className="space-y-3">
        {Array.isArray(neighbourhoods) && neighbourhoods.length > 0 ? (
          neighbourhoods.map((n: any, idx: number) => {
            const imgUrl = getNeighbourhoodImageUrl(n);
            const name = n.name || n.city?.name || n.city || "Neighbourhood";
            return (
              <div key={n.id} className="nb-card-enter bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex overflow-hidden cursor-pointer"
                style={{ animationDelay: `${idx * 60}ms` }} onClick={() => router.push(`/admin/neighbourhoods/${n.id}`)}>
                <div className="w-[100px] min-h-[100px] flex-shrink-0 hidden sm:block relative">
                  {imgUrl ? (
                    <img src={imgUrl} alt={name} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; const sib = e.currentTarget.nextElementSibling as HTMLElement; if (sib) sib.style.display = "flex"; }} />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${getAvatarColor(name)}`} style={{ display: imgUrl ? "none" : "flex" }}>{getAcronym(n)}</div>
                </div>
                <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center">
                  <span className="text-[15px] font-semibold text-slate-900 truncate">{name}</span>
                  {n.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.description.substring(0, 120)}</p>}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                    {n.created_at && <span className="flex items-center gap-1"><CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />{formatDate(n.created_at)}</span>}
                    {(n.city?.name || n.state?.name) && <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5 text-slate-400" />{[n.city?.name, n.state?.name].filter(Boolean).join(", ")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 pr-5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <Link href={`/admin/neighbourhoods/${n.id}`} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"><EyeIcon className="w-4 h-4" /> View</Link>
                  <Link href={`/admin/neighbourhoods/${n.id}/edit`} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition" title="Edit"><PencilSquareIcon className="w-4 h-4" /></Link>
                  <button onClick={() => { setDeleteId(n.id); setShowDeleteModal(true); }} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })
        ) : !isFetching ? (
          <div className="text-center py-16 text-slate-400"><MapPinIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-lg">No neighbourhoods found.</p></div>
        ) : null}
        </div>
      </div>

      {renderPagination()}

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent><DialogHeader><DialogTitle>Delete Neighbourhood</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Are you sure you want to delete this neighbourhood? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteNeighbourhoodMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) deleteNeighbourhoodMutation.mutate(deleteId); }} disabled={deleteNeighbourhoodMutation.isPending}>{deleteNeighbourhoodMutation.isPending ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}