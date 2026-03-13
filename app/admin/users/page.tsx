"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import axiosInstance from "@/services/Api";
import {
  MagnifyingGlassIcon,
  MoonIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  PencilIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive?: string;
  crm_status?: string;
  created_at?: string;
  avatar?: string;
}

interface SearchFiltersState {
  email: string;
  name: string;
  crm_status: string;
  keyword: string;
}

/* ------------------------------------------------------------------ */
/*  Helper: avatar colour from initials                                */
/* ------------------------------------------------------------------ */
const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-violet-100 text-violet-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
  "bg-orange-100 text-orange-600",
];
const pickColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function UsersPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const lastFetchKeyRef = useRef<string | null>(null);
  const prevUsersRef = useRef<User[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFiltersState>({
    email: "",
    name: "",
    crm_status: "",
    keyword: "",
  });

  /* ---------- helpers ---------- */
  const getInitials = (name?: string, email?: string) => {
    const source = name?.trim() || email?.trim() || "";
    if (!source) return "U";
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  };

  const formatJoinedDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  /* ---------- API ---------- */
  const buildQueryString = (filters: SearchFiltersState = searchFilters) => {
    const parts: string[] = [];
    if (filters.email.trim()) parts.push(`email:LIKE,${filters.email.trim()}`);
    if (filters.name.trim()) parts.push(`name:LIKE,${filters.name.trim()}`);
    if (filters.crm_status) parts.push(`crm_status:=,${filters.crm_status}`);
    return parts.length > 0 ? parts.join(";") : "";
  };

  const fetchUsers = async (filtersToUse?: SearchFiltersState, force = false) => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page: currentPage };
      const qs = buildQueryString(filtersToUse);
      const fetchKey = `${currentPage}|${qs}`;
      // Skip duplicate fetch only when we already have data to render.
      if (!force && lastFetchKeyRef.current === fetchKey && users.length > 0) {
        setLoading(false);
        return;
      }
      lastFetchKeyRef.current = fetchKey;
      if (qs) params.q = qs;

      const response = await axiosInstance.get("v1/user/customer", { params });
      const data = response.data;
      const pagination = data?.meta || data?.pagination || null;
      setTotalPages(pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1);
      setTotalItems(pagination?.total || pagination?.totalItems || 0);

      const raw = Array.isArray(data) ? data : data.data || data.users || [];
      const mapped: User[] = raw.map((u: any, i: number) => ({
        id: u.id || u.user_id || i + 1,
        name: u.name || u.full_name || u.username || `User ${i + 1}`,
        email: u.email || u.email_address || "",
        role: u.role || u.user_role || "User",
        status: u.status || (u.is_active ? "Active" : "Inactive"),
        lastActive: u.last_active || u.last_login || u.updated_at || "",
        crm_status: u.crm_status ?? "0",
        created_at: u.created_at || "",
        avatar: u.avatar || u.photo || u.profile_image || u.image || u.profile_photo || "",
      }));
      if (mapped.length > 0) prevUsersRef.current = mapped;
      setUsers(mapped);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [currentPage]);

  const handleSearch = () => { setCurrentPage(1); fetchUsers(undefined, true); };

  /* debounced keyword search — fires 500ms after last keystroke */
  const handleKeywordChange = useCallback(
    (value: string) => {
      setSearchFilters((prev) => ({ ...prev, name: value }));
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.trim() === "" || value.trim().length >= 2) {
        debounceRef.current = setTimeout(() => {
          setCurrentPage(1);
          fetchUsers({ ...searchFilters, name: value }, true);
        }, 500);
      }
    },
    [searchFilters], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const handleClearSearch = () => {
    const empty: SearchFiltersState = { email: "", name: "", crm_status: "", keyword: "" };
    setSearchFilters(empty);
    setCurrentPage(1);
    setTimeout(() => fetchUsers(empty, true), 0);
  };

  const handlePushToCRM = async (user: User) => {
    try {
      const token = sessionStorage.getItem("access_token");
      if (!token) { alert("Please login to sync customers to CRM"); return; }
      const response = await axiosInstance.get(`/user/sync-customer-to-crm`, { params: { customer_id: user.id } });
      alert(response.data.message || "Customer successfully synced to CRM");
      await fetchUsers();
    } catch (err: any) {
      if (err.response?.status === 401) alert("Authentication failed. Please login again.");
      else alert(err.response?.data?.message ? `Failed to sync: ${err.response.data.message}` : "Failed to sync customer to CRM. Please try again.");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ---------- pagination ---------- */
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);

    return (
      <div className="flex flex-col items-center gap-3 mt-8">
        <div className="flex items-center gap-1.5">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Previous</button>
          {startPage > 1 && (
            <>
              <button onClick={() => handlePageChange(1)} className={`w-8 h-8 text-sm rounded-lg border transition ${1 === currentPage ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}>1</button>
              {startPage > 2 && <span className="px-1 text-slate-400">...</span>}
            </>
          )}
          {pages.map((p) => (
            <button key={p} onClick={() => handlePageChange(p)} disabled={loading} className={`w-8 h-8 text-sm rounded-lg border transition ${p === currentPage ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}>{p}</button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
              <button onClick={() => handlePageChange(totalPages)} className={`w-8 h-8 text-sm rounded-lg border transition ${totalPages === currentPage ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600 hover:bg-white"}`}>{totalPages}</button>
            </>
          )}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || loading} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition">Next</button>
        </div>
        <p className="text-xs text-slate-400">Page {currentPage} of {totalPages} ({totalItems} total users)</p>
      </div>
    );
  };

  /* ---------- loading / error ---------- */
  if (loading && prevUsersRef.current.length === 0) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
        <p className="text-red-500">Error loading users: {error}</p>
      </div>
    );
  }

  /* display: previously loaded users while refetching */
  // Only fall back to old data while a fetch is in-flight; an empty completed response should show the empty state
  const displayUsers = (users.length === 0 && loading) ? prevUsersRef.current : users;

  /* ---------- render ---------- */
  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Top progress bar ---- */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 h-[3px] overflow-hidden transition-opacity duration-300 ${loading ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="h-full bg-emerald-500 animate-[progressBar_1.2s_ease-in-out_infinite]" />
      </div>

      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Users & Leads</h1>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative hidden md:flex items-center">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search users…"
              value={searchFilters.name}
              onChange={(e) => handleKeywordChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              className="w-[340px] pl-9 pr-10 py-2 text-sm rounded-full border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
            />
            <button onClick={() => setShowFilters(!showFilters)} className="absolute right-3 text-slate-400 hover:text-slate-600 transition">
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Add New User */}
          <Link
            href="/admin/users/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add New User
          </Link>

          {/* Dark mode */}
          <button className="p-2 rounded-full hover:bg-white transition">
            <MoonIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* ---- Expanded filter panel ---- */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-5 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
              <input type="text" value={searchFilters.email} onChange={(e) => setSearchFilters({ ...searchFilters, email: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Search by email..." className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Name</label>
              <input type="text" value={searchFilters.name} onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Search by name..." className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">CRM Status</label>
              <select value={searchFilters.crm_status} onChange={(e) => setSearchFilters({ ...searchFilters, crm_status: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white">
                <option value="">All</option>
                <option value="0">Not in CRM</option>
                <option value="1">In CRM</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSearch} disabled={loading} className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">Apply Filters</button>
            <button onClick={handleClearSearch} className="px-5 py-2 rounded-full border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">Clear All</button>
          </div>
        </div>
      )}

      {/* ---- User Rows ---- */}
      <div className="relative">
        <style>{``}</style>

        {/* Frosted overlay while loading (previous data stays visible) */}
        {loading && displayUsers.length > 0 && (
          <div
            className="absolute inset-0 z-20 rounded-2xl flex items-center justify-center"
            style={{ animation: "overlayFadeIn 0.18s ease forwards" }}
          >
            <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[2px]" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Loading results…</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
        {Array.isArray(displayUsers) && displayUsers.length > 0 ? (
          displayUsers.map((user, idx) => {
            const initials = getInitials(user.name, user.email);
            const colorClass = pickColor(user.name || user.email || "U");
            return (
              <div
                key={user.id}
                className="user-card-enter bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow px-6 py-4 flex items-center gap-5 cursor-pointer"
                style={{ animationDelay: `${idx * 60}ms` }}
                onClick={() => router.push(`/admin/users/${user.id}`)}
              >
                {/* Avatar */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${colorClass}`}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>

                {/* Name + email */}
                <div className="min-w-[200px] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-slate-900">{user.name}</span>
                    {user.status && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        user.status.toLowerCase() === "active"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-red-50 text-red-500 border border-red-200"
                      }`}>
                        {user.status}
                      </span>
                    )}
                  </div>
                  {user.email && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <EnvelopeIcon className="w-3.5 h-3.5" />
                      {user.email}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div className="hidden lg:flex items-center gap-1.5 text-sm text-slate-500 min-w-[90px]">
                  <UserCircleIcon className="w-4 h-4 text-slate-400" />
                  {user.role}
                </div>

                {/* Created date */}
                <div className="hidden lg:flex items-center gap-1.5 text-sm text-slate-500 min-w-[130px]">
                  <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                  {formatJoinedDate(user.created_at)}
                </div>

                {/* CRM status */}
                <div className="hidden md:block min-w-[100px]">
                  {user.crm_status === "0" ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePushToCRM(user); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors"
                    >
                      <CloudArrowUpIcon className="w-3.5 h-3.5" />
                      Push to CRM
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-lg bg-emerald-400" />
                      In CRM
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : !loading ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg">No users found.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : null}
        </div>
      </div>

      {renderPagination()}
    </div>
  );
}

