'use client';

import React from 'react';
import {
  HomeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  UsersIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { stats, recentActivity } from '@/lib/mockData';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, any> = {
  HomeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  UsersIcon,
  EnvelopeIcon,
};

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<typeof stats>([]);
  const [activity, setActivity] = useState<typeof recentActivity>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStatsData(stats);
    setActivity(recentActivity);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
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
        <div className="mb-8">
          <h1 className="text-2xl font-serif text-dark">IDX Dashboard Overview</h1>
          <p className="text-dark-secondary">Welcome back! Here's your IDX real estate summary.</p>
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