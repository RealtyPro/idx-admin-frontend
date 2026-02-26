'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  HandThumbUpIcon,
  MagnifyingGlassIcon,
  BellIcon,
  MoonIcon,
  PlusCircleIcon,
  UserPlusIcon,
  PaperAirplaneIcon,
  HeartIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
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
  iconBg: string;
  iconColor: string;
};

type FeaturedListing = {
  id: string;
  image: string;
  badge: string;
  badgeColor: string;
  price: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  sqft: string;
};

type RecentEnquiry = {
  id: string;
  name: string;
  time: string;
  message: string;
  tag: string;
  tagColor: string;
  isNew?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Mock data for featured listings & enquiries                        */
/* ------------------------------------------------------------------ */
const featuredListings: FeaturedListing[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
    badge: 'FOR SALE',
    badgeColor: 'bg-emerald-500',
    price: '$1,250,000',
    title: 'Luxury Modern Villa in Beverly...',
    location: '90210 Beverly Hills, Los Angeles',
    beds: 4,
    baths: 3,
    sqft: '3,200',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    badge: 'UNDER OFFER',
    badgeColor: 'bg-orange-500',
    price: '$850,000',
    title: 'Downtown Waterfront Penthouse',
    location: 'Brickell, Miami FL',
    beds: 2,
    baths: 2,
    sqft: '1,850',
  },
];

const recentEnquiries: RecentEnquiry[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    time: '2 mins ago',
    message: 'Interested in the Luxury Moder...',
    tag: 'Listing #442',
    tagColor: 'text-blue-600 bg-blue-50',
    isNew: true,
  },
  {
    id: '2',
    name: 'Robert Fox',
    time: '45 mins ago',
    message: 'Can we schedule a viewing for...',
    tag: 'Listing #128',
    tagColor: 'text-blue-600 bg-blue-50',
  },
  {
    id: '3',
    name: 'Jenny Wilson',
    time: '3 hours ago',
    message: 'Looking for similar properties in...',
    tag: 'General Enquiry',
    tagColor: 'text-slate-600 bg-slate-100',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridView, setGridView] = useState(true);

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

      setStatsData([
        {
          name: 'Total Listings',
          value: String(listingsCount),
          change: '+12%',
          changeType: 'positive',
          icon: HomeIcon,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-500',
        },
        {
          name: 'Total Enquiries',
          value: String(enquiriesCount),
          change: '+5%',
          changeType: 'positive',
          icon: EnvelopeIcon,
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-500',
        },
        {
          name: 'Total Blogs',
          value: String(blogsCount),
          change: '— 0%',
          changeType: 'neutral',
          icon: DocumentTextIcon,
          iconBg: 'bg-purple-50',
          iconColor: 'text-purple-500',
        },
        {
          name: 'Testimonials',
          value: String(testimonialsCount),
          change: '-2%',
          changeType: 'negative',
          icon: HandThumbUpIcon,
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-500',
        },
      ]);

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="px-6">
        <div className="max-w-[1280px] mx-auto">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-5">
            <Skeleton className="col-span-2 h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8">
      <div className="max-w-[1280px] mx-auto">
        {/* ---- Top Header Bar ---- */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[22px] font-semibold text-slate-900">Dashboard Overview</h1>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search listings, leads..."
                className="w-[240px] pl-9 pr-4 py-2 text-sm rounded-full border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
              />
            </div>
            {/* Notification */}
            <button className="relative p-2 rounded-full hover:bg-white transition">
              <BellIcon className="w-5 h-5 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {/* Dark mode toggle */}
            <button className="p-2 rounded-full hover:bg-white transition">
              <MoonIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* ---- Stats + Quick Actions ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-5 mb-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {statsData.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                      <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <span
                      className={`text-xs font-medium flex items-center gap-0.5 ${
                        stat.changeType === 'positive'
                          ? 'text-emerald-600'
                          : stat.changeType === 'negative'
                          ? 'text-red-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {stat.changeType === 'positive' && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12"><path d="M6 9V3m0 0L3 6m3-3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                      {stat.changeType === 'negative' && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12"><path d="M6 3v6m0 0l3-3m-3 3L3 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      )}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-0.5">{stat.name}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              <Link
                href="/admin/listings/create"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group"
              >
                <PlusCircleIcon className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Add New Listing</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <UserPlusIcon className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Create New Lead</span>
              </Link>
              <Link
                href="/admin/newsletter/create"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <PaperAirplaneIcon className="w-5 h-5 text-violet-500" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Send Newsletter</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ---- Featured Listings + Recent Enquiries ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Featured Listings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-semibold text-slate-900">Featured Listings</h2>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => setGridView(true)}
                  className={`p-1.5 rounded-md transition ${gridView ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridView(false)}
                  className={`p-1.5 rounded-md transition ${!gridView ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={`grid gap-5 ${gridView ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {featuredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative h-[200px] overflow-hidden">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Badge */}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-md ${listing.badgeColor}`}>
                      {listing.badge}
                    </span>
                    {/* Favorite */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition">
                      <HeartIcon className="w-4 h-4 text-slate-500" />
                    </button>
                    {/* Price */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white text-lg font-bold drop-shadow-lg">{listing.price}</span>
                    </div>
                  </div>
                  {/* Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 text-[15px] mb-1 truncate">{listing.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                      {listing.location}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
                        {listing.beds}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                        {listing.baths}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>
                        {listing.sqft}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Enquiries */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 h-fit">
            <h3 className="text-[15px] font-semibold text-slate-900 mb-4">Recent Enquiries</h3>
            <div className="space-y-4">
              {recentEnquiries.map((enquiry) => (
                <div key={enquiry.id} className="flex gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-slate-900">{enquiry.name}</span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{enquiry.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1.5 truncate">{enquiry.message}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${enquiry.tagColor}`}>
                        {enquiry.tag}
                      </span>
                      {enquiry.isNew && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-50">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/admin/inquiries"
              className="block text-center text-sm font-medium text-emerald-600 hover:text-emerald-700 mt-5 transition-colors"
            >
              View All Leads
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 