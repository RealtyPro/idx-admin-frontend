'use client';

import React from 'react';
import {
  HomeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  UsersIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { recentActivity } from '@/lib/mockData';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/services/Api';

const iconMap: Record<string, any> = {
  HomeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  UsersIcon,
  EnvelopeIcon,
};

type Stat = {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: 'HomeIcon' | 'DocumentTextIcon' | 'CreditCardIcon' | 'UsersIcon' | 'EnvelopeIcon';
};

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<Stat[]>([]);
  const [activity, setActivity] = useState<typeof recentActivity>([]);
  const [loading, setLoading] = useState(true);

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
      setActivity(recentActivity);

      // Fetch each count individually so one failure doesn't block others
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
          change: '',
          changeType: 'positive',
          icon: 'HomeIcon',
        },
        {
          name: 'Total Enquiries',
          value: String(enquiriesCount),
          change: '',
          changeType: 'positive',
          icon: 'EnvelopeIcon',
        },
        {
          name: 'Total Blogs',
          value: String(blogsCount),
          change: '',
          changeType: 'positive',
          icon: 'DocumentTextIcon',
        },
        {
          name: 'Total Testimonials',
          value: String(testimonialsCount),
          change: '',
          changeType: 'positive',
          icon: 'UsersIcon',
        },
      ]);

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-serif text-dark">Dashboard Overview</h1>
          <div className="hidden md:block">
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat) => {
            const Icon = iconMap[stat.icon];
            return (
              <div
                key={stat.name}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {Icon && <Icon className="w-6 h-6 text-primary" />}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-dark-secondary mb-1">{stat.name}</p>
                <p className="text-2xl font-semibold text-dark">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-dark">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {activity.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-primary/10`}>
                      {activity.type === 'listing' && <HomeIcon className="w-5 h-5 text-primary" />}
                      {activity.type === 'sale' && <CreditCardIcon className="w-5 h-5 text-green-600" />}
                      {activity.type === 'inquiry' && <EnvelopeIcon className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark">{activity.description}</p>
                      <p className="text-xs text-dark-secondary">
                        {activity.time} • Agent: {activity.agent}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-dark-secondary">{activity.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 