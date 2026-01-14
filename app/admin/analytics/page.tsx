'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  PhoneIcon,
  HomeIcon,
  EnvelopeIcon,
  CreditCardIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { StarIcon } from '@heroicons/react/24/solid';
import { metrics, listingViews, topAgents } from '@/lib/mockData';
import { Skeleton } from '@/components/ui/skeleton';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedAgent, setSelectedAgent] = useState<typeof topAgents[0] | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', calls: '', rating: '', satisfaction: '' });
  const [metricsData, setMetricsData] = useState<typeof metrics>([]);
  const [distribution, setDistribution] = useState<typeof listingViews>([]);
  const [agents, setAgents] = useState<typeof topAgents>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMetricsData(metrics);
    setDistribution(listingViews);
    setAgents(topAgents);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleAgentClick = (agent: typeof topAgents[0]) => {
    setSelectedAgent(agent);
    setEditForm({
      name: agent.name,
      calls: agent.calls.toString(),
      rating: agent.rating.toString(),
      satisfaction: agent.satisfaction.toString(),
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // For now, just log the updated agent data
    console.log('Updated agent:', editForm);
    setEditDialogOpen(false);
    setSelectedAgent(null);
  };

  if (loading) {
    return (
      <div className="px-2 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl mb-8" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif text-dark">IDX Analytics</h1>
            <p className="text-dark-secondary">Monitor and analyze your listings and agent performance</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-dark focus:outline-none focus:border-primary w-full sm:w-auto"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricsData.map((metric) => {
            const Icon = { HomeIcon, EnvelopeIcon, CreditCardIcon, UsersIcon }[metric.icon];
            return (
              <div
                key={metric.name}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {Icon && <Icon className="w-6 h-6 text-primary" />}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {metric.change}
                  </span>
                </div>
                <p className="text-sm text-dark-secondary mb-1">{metric.name}</p>
                <p className="text-2xl font-semibold text-dark">{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* Listing Views Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
          <h2 className="text-lg font-medium text-dark mb-4">Listing Views</h2>
          <div className="h-64">
            <div className="flex h-full items-end gap-2">
              {distribution.map((listing) => {
                const height = (listing.views / 210) * 100;
                return (
                  <div
                    key={listing.title}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-primary/20 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-dark-secondary">{listing.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Performing Agents */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-dark">Top Performing Agents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-secondary uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-secondary uppercase tracking-wider">
                    Listings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-secondary uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-secondary uppercase tracking-wider">
                    Inquiries
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr
                    key={agent.name}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-dark">{agent.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                      {agent.listings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                      {agent.sales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">
                      {agent.inquiries}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agent Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Agent</DialogTitle>
            </DialogHeader>
            <form className="grid gap-4 py-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={editForm.name} onChange={handleEditFormChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="calls">Total Calls</Label>
                <Input id="calls" name="calls" type="number" value={editForm.calls} onChange={handleEditFormChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rating">Rating</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setEditForm((prev) => ({ ...prev, rating: star.toString() }))}
                      aria-label={`Set rating to ${star}`}
                    >
                      <StarIcon
                        className={`w-6 h-6 ${star <= Math.round(Number(editForm.rating)) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill={star <= Math.round(Number(editForm.rating)) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-dark-secondary">{editForm.rating} / 5</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="satisfaction">Customer Satisfaction (%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="satisfaction"
                    name="satisfaction"
                    min={0}
                    max={100}
                    step={1}
                    value={[Number(editForm.satisfaction)]}
                    onValueChange={([val]: number[]) => setEditForm((prev) => ({ ...prev, satisfaction: val.toString() }))}
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm">{editForm.satisfaction}%</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 