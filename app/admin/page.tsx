'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  HandThumbUpIcon,
  PlusCircleIcon,
  HeartIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/services/Api';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Stat = {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  href: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<Stat[]>([]);
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridView, setGridView] = useState(true);
  const [featuredPage, setFeaturedPage] = useState(1);
  const [userName, setUserName] = useState('');
  const FEATURED_PER_PAGE = 4;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserName(sessionStorage.getItem('user_name') || 'Admin');
    }
  }, []);

  useEffect(() => {
    const extractCount = (res: any): number => {
      if (!res) return 0;
      const data = res.data;
      if (typeof data === 'number') return data;
      if (typeof data === 'string') return parseInt(data, 10) || 0;
      if (typeof data === 'object' && data !== null) {
        if (typeof data.count === 'number') return data.count;
        if (typeof data.total === 'number') return data.total;
        if (typeof data.data === 'number') return data.data;
        if (typeof data.data === 'object' && data.data !== null) {
          if (typeof data.data.count === 'number') return data.data.count;
          if (typeof data.data.total === 'number') return data.data.total;
        }
      }
      return 0;
    };

    const fetchDashboardData = async () => {
      const fetchCount = async (url: string, name: string): Promise<number> => {
        try {
          const res = await api.get(url);
          return extractCount(res);
        } catch (error: any) {
          console.error(`Failed to load ${name} count from ${url}:`, error.message);
          return 0;
        }
      };

      const [listingsCount, enquiriesCount, blogsCount, testimonialsCount] =
        await Promise.all([
          fetchCount('v1/admin/count/product/property/all', 'Listings'),
          fetchCount('v1/admin/count/enquiry/enquiry/all', 'Enquiries'),
          fetchCount('v1/admin/count/blog/blog/all', 'Blogs'),
          fetchCount('v1/admin/count/testimonial/testimonial/all', 'Testimonials'),
        ]);

      try {
        const featuredRes = await api.get('v1/admin/property?search[is_featured]=1');
        const featuredData = featuredRes?.data?.data || featuredRes?.data || [];
        setFeaturedListings(Array.isArray(featuredData) ? featuredData : []);
      } catch (err) {
        console.error('Failed to fetch featured listings:', err);
        setFeaturedListings([]);
      }

      try {
        const recentRes = await api.get('v1/admin/enquiry?page=1');
        const recentData = recentRes?.data?.data || recentRes?.data || [];
        setRecentEnquiries(Array.isArray(recentData) ? recentData.slice(0, 6) : []);
      } catch (err) {
        console.error('Failed to fetch recent enquiries:', err);
        setRecentEnquiries([]);
      }

      setStatsData([
        {
          name: 'Total Listings',
          value: String(listingsCount),
          change: '',
          changeType: 'neutral',
          icon: HomeIcon,
          gradient: 'from-blue-500 to-cyan-500',
          iconColor: 'text-white',
          href: '/admin/listings',
        },
        {
          name: 'Total Enquiries',
          value: String(enquiriesCount),
          change: '',
          changeType: 'neutral',
          icon: EnvelopeIcon,
          gradient: 'from-emerald-500 to-teal-500',
          iconColor: 'text-white',
          href: '/admin/inquiries',
        },
        {
          name: 'Total Blogs',
          value: String(blogsCount),
          change: '',
          changeType: 'neutral',
          icon: DocumentTextIcon,
          gradient: 'from-violet-500 to-purple-500',
          iconColor: 'text-white',
          href: '/admin/blog',
        },
        {
          name: 'Testimonials',
          value: String(testimonialsCount),
          change: '',
          changeType: 'neutral',
          icon: HandThumbUpIcon,
          gradient: 'from-amber-500 to-orange-500',
          iconColor: 'text-white',
          href: '/admin/testimonials',
        },
      ]);

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="px-6 lg:px-8 pb-10">
        <div className="max-w-[1280px] mx-auto">
          <Skeleton className="h-32 w-full rounded-2xl mb-7" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[110px] w-full rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-3 gap-5">
            <Skeleton className="col-span-2 h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  /* ── colour palette for enquiry avatars ── */
  const avatarColors = [
    'bg-emerald-100 text-emerald-700',
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
  ];

  return (
    <>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .animate-fiu { animation: fade-in-up 0.5s ease forwards; }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 40px -8px rgba(0,0,0,0.12); }
        .stat-shimmer::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
          border-radius: inherit;
          pointer-events: none;
        }
      `}</style>

      <div className="px-3 lg:px-4 pb-4">
        <div className="max-w-[1280px] mx-auto space-y-3">

          {/* ── Welcome Banner ────────────────────────────────────────── */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #5e9045 0%, #4a7535 40%, #3d6229 75%, #2e4d20 100%)',
              boxShadow: '0 12px 40px rgba(61,98,41,0.45), 0 3px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.10)',
              animationDelay: '0s',
            }}
          >
            {/* Large blurred circle — top right */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 65%)' }} />
            {/* Medium ring — bottom left */}
            <div className="absolute -bottom-14 -left-14 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.20) 0%, transparent 65%)' }} />
            {/* Small accent dot — mid right */}
            <div className="absolute top-1/2 right-56 -translate-y-1/2 w-5 h-5 rounded-full pointer-events-none opacity-30"
              style={{ background: '#c8e6b0', boxShadow: '0 0 18px 6px rgba(141,197,114,0.55)' }} />
            {/* Horizontal stripe shimmer */}
            <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{ background: 'rgba(255,255,255,0.18)' }} />

            {/* Dot-grid pattern — right side */}
            <div className="absolute inset-y-0 right-0 w-72 pointer-events-none overflow-hidden opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.65) 1px, transparent 1px)',
                backgroundSize: '18px 18px',
                maskImage: 'linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 100%)',
              }}
            />

            {/* Diagonal slash lines — subtle texture */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 28px)',
              }}
            />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon className="w-4 h-4" style={{ color: '#c8e6b0' }} />
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#c8e6b0' }}>
                    {getGreeting()}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-0.5 drop-shadow-sm">
                  {userName} 👋
                </h1>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Here&apos;s what&apos;s happening with your portfolio today.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 self-start sm:self-auto"
                style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <CalendarDaysIcon className="w-4 h-4 shrink-0" style={{ color: '#c8e6b0' }} />
                <span className="text-[13px] whitespace-nowrap text-white/85">{formatDate()}</span>
              </div>
            </div>
          </div>

          {/* ── Stat Cards ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
            {statsData.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.name}
                  href={stat.href}
                  className="relative bg-white rounded-2xl p-4 border border-slate-100 overflow-hidden block"
                  style={{ animationDelay: `${0.08 + i * 0.07}s`, boxShadow: '0 4px 20px rgba(141,197,114,0.13), 0 1px 4px rgba(0,0,0,0.06)' }}
                  style={{ animationDelay: `${0.08 + i * 0.07}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${stat.gradient} shadow-sm`}>
                      <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                    </div>
                    <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 mb-0.5 uppercase tracking-wide">{stat.name}</p>
                  <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{stat.value}</p>
                  {/* bottom accent bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-60`} />
                </Link>
              );
            })}
          </div>

          {/* ── Featured Listings + Right Column ──────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3">

            {/* Featured Listings */}
            <div className="bg-white border border-slate-100 flex flex-col" style={{ boxShadow: '0 4px 20px rgba(141,197,114,0.13), 0 1px 4px rgba(0,0,0,0.06)' }}>
              {/* header */}
              <div className="flex items-center justify-between p-5 pb-3 shrink-0">
                <div>
                  <h2 className="text-[17px] font-semibold text-slate-900">Featured Listings</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{featuredListings.length} properties featured</p>
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() => setGridView(true)}
                    className={`p-1.5 rounded-md transition ${gridView ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGridView(false)}
                    className={`p-1.5 rounded-md transition ${!gridView ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {featuredListings.length > 0 ? (
                <>
                  {/* scrollable listings area */}
                  <div className="flex-1 overflow-y-auto px-5 pb-2" style={{ minHeight: 0 }}>
                    <div className={`grid gap-4 ${gridView ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                      {featuredListings
                        .slice((featuredPage - 1) * FEATURED_PER_PAGE, featuredPage * FEATURED_PER_PAGE)
                        .map((listing: any) => {
                          const image = (() => {
                            const imgs = listing?.images ?? listing?.image ?? listing?.photos;
                            if (typeof imgs === 'string') {
                              if (imgs.trim().startsWith('[')) {
                                try { const p = JSON.parse(imgs); if (Array.isArray(p) && p.length) return p[0]; } catch {}
                              }
                              return imgs;
                            }
                            if (Array.isArray(imgs) && imgs.length) return imgs[0];
                            return '/images/hero-image.png';
                          })();
                          const price = listing?.price
                            ? typeof listing.price === 'number'
                              ? `$${listing.price.toLocaleString('en-US')}`
                              : listing.price.toString().startsWith('$') ? listing.price : `$${listing.price}`
                            : '';
                          const sqft = listing?.sqft ?? listing?.square_feet ?? listing?.squareFeet ?? listing?.bua ?? listing?.area;
                          const statusLabel = listing?.status?.toUpperCase() || 'ACTIVE';
                          const statusStyle =
                            listing?.status?.toLowerCase() === 'sold'
                              ? 'bg-red-500'
                              : listing?.status?.toLowerCase() === 'pending'
                              ? 'bg-orange-500'
                              : 'bg-emerald-500';

                          return (
                            <Link
                              key={listing.id}
                              href={`/admin/listings/${listing.id}`}
                            className="bg-white border border-slate-100 overflow-hidden group block"
                              style={{ boxShadow: '0 4px 20px rgba(141,197,114,0.13), 0 1px 4px rgba(0,0,0,0.06)' }}
                            >
                              <div className="relative h-[200px] overflow-hidden">
                                <img
                                  src={image}
                                  alt={listing.title || listing.name || `Listing ${listing.id}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-md ${statusStyle}`}>
                                  {statusLabel}
                                </span>
                                <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition">
                                  <HeartIcon className="w-4 h-4 text-slate-500" />
                                </button>
                                {price && (
                                  <div className="absolute bottom-3 left-3">
                                    <span className="text-white text-lg font-bold drop-shadow-lg">{price}</span>
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <h3 className="font-semibold text-slate-900 text-[15px] mb-1 truncate group-hover:text-emerald-600 transition-colors">
                                  {listing.title || listing.name || listing.address || `Listing ${listing.id}`}
                                </h3>
                                {listing.address && (
                                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                                    <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {listing.address}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                  {listing.beds !== undefined && listing.beds !== null && (
                                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1">
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                                      {listing.beds} bd
                                    </span>
                                  )}
                                  {listing.baths !== undefined && listing.baths !== null && (
                                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1">
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                      {listing.baths} ba
                                    </span>
                                  )}
                                  {sqft && (
                                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1">
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                                      {sqft}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                    </div>
                  </div>

                  {/* Pagination — pinned to bottom of card */}
                  {featuredListings.length > FEATURED_PER_PAGE && (
                    <div className="shrink-0 px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => setFeaturedPage((p) => Math.max(1, p - 1))}
                        disabled={featuredPage === 1}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed"
                        style={{
                          background: featuredPage === 1 ? '#f8faf6' : 'linear-gradient(135deg,#8dc572,#6aad52)',
                          color: featuredPage === 1 ? '#94a3b8' : '#fff',
                          border: '1.5px solid',
                          borderColor: featuredPage === 1 ? '#e2e8f0' : 'transparent',
                          boxShadow: featuredPage === 1 ? 'none' : '0 2px 8px rgba(141,197,114,0.40)',
                        }}
                      >
                        <ChevronLeftIcon className="w-3.5 h-3.5" />
                        Prev
                      </button>

                      {/* Page dots */}
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: Math.ceil(featuredListings.length / FEATURED_PER_PAGE) }, (_, i) => i + 1).map((pg) => (
                          <button
                            key={pg}
                            onClick={() => setFeaturedPage(pg)}
                            className="w-7 h-7 text-xs font-bold transition-all duration-200"
                            style={{
                              background: pg === featuredPage ? 'linear-gradient(135deg,#8dc572,#6aad52)' : 'transparent',
                              color: pg === featuredPage ? '#fff' : '#94a3b8',
                              border: pg === featuredPage ? '1.5px solid transparent' : '1.5px solid #e2e8f0',
                              boxShadow: pg === featuredPage ? '0 2px 8px rgba(141,197,114,0.45)' : 'none',
                            }}
                          >
                            {pg}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setFeaturedPage((p) => Math.min(Math.ceil(featuredListings.length / FEATURED_PER_PAGE), p + 1))}
                        disabled={featuredPage >= Math.ceil(featuredListings.length / FEATURED_PER_PAGE)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed"
                        style={{
                          background: featuredPage >= Math.ceil(featuredListings.length / FEATURED_PER_PAGE) ? '#f8faf6' : 'linear-gradient(135deg,#8dc572,#6aad52)',
                          color: featuredPage >= Math.ceil(featuredListings.length / FEATURED_PER_PAGE) ? '#94a3b8' : '#fff',
                          border: '1.5px solid',
                          borderColor: featuredPage >= Math.ceil(featuredListings.length / FEATURED_PER_PAGE) ? '#e2e8f0' : 'transparent',
                          boxShadow: featuredPage >= Math.ceil(featuredListings.length / FEATURED_PER_PAGE) ? 'none' : '0 2px 8px rgba(141,197,114,0.40)',
                        }}
                      >
                        Next
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-12 h-12 bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <HomeIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm mb-2">No featured listings found.</p>
                  <Link href="/admin/listings" className="text-emerald-600 text-sm font-medium hover:text-emerald-700">
                    Go to Listings →
                  </Link>
                </div>
              )}
            </div>

            {/* Right column: Quick Actions + Recent Enquiries */}
            <div className="flex flex-col gap-3">

            {/* Quick Actions — vertical */}
            <div
              className="bg-white border border-slate-100 p-4"
              style={{ animationDelay: '0.35s', boxShadow: '0 4px 20px rgba(141,197,114,0.13), 0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <SparklesIcon className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { href: '/admin/blog/create',           icon: DocumentTextIcon, label: 'New Blog Post',       gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 hover:bg-violet-100 border-violet-100' },
                  { href: '/admin/neighbourhoods/create', icon: MapPinIcon,        label: 'Add Neighbourhood',   gradient: 'from-blue-500 to-cyan-500',     bg: 'bg-blue-50 hover:bg-blue-100 border-blue-100' },
                  { href: '/admin/listings',              icon: HomeIcon,          label: 'All Listings',        gradient: 'from-emerald-500 to-teal-500',  bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100' },
                  { href: '/admin/inquiries',             icon: EnvelopeIcon,      label: 'View Enquiries',      gradient: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50 hover:bg-amber-100 border-amber-100' },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`flex items-center gap-3 px-3 py-2.5 border transition-all duration-200 group card-hover ${action.bg}`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recent Enquiries */}
            <div
              className="bg-white border border-slate-100 p-5"
              style={{ animationDelay: '0.48s', boxShadow: '0 4px 20px rgba(141,197,114,0.13), 0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900">Recent Enquiries</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{recentEnquiries.length} latest</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {recentEnquiries.length > 0 ? (
                <div className="space-y-1">
                  {recentEnquiries.map((enquiry: any, i: number) => {
                    const name = enquiry?.name || enquiry?.full_name
                      || (enquiry?.first_name ? `${enquiry.first_name} ${enquiry.last_name || ''}`.trim() : '')
                      || enquiry?.email || 'Unknown';
                    const initials = name
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((w: string) => w[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'U';
                    const date = enquiry?.created_at
                      ? new Date(enquiry.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                      : '';
                    const colorClass = avatarColors[i % avatarColors.length];

                    return (
                      <Link
                        key={enquiry.id}
                        href={`/admin/inquiries/${enquiry.id}`}
                        className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition-colors group"
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${colorClass}`}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                            {name}
                          </p>
                          {enquiry?.message ? (
                            <p className="text-xs text-slate-400 truncate">{enquiry.message}</p>
                          ) : enquiry?.email && enquiry.email !== name ? (
                            <p className="text-xs text-slate-400 truncate">{enquiry.email}</p>
                          ) : null}
                        </div>
                        {date && (
                          <span className="text-[10px] text-slate-400 shrink-0">{date}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                    <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-sm">No recent enquiries.</p>
                </div>
              )}

              <Link
                href="/admin/inquiries"
                className="flex items-center justify-center gap-1.5 mt-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                View All Enquiries
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
            </div>

            </div>{/* end right column */}

          </div>
        </div>
      </div>
    </>
  );
}

