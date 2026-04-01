"use client";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { StarIcon } from "@heroicons/react/24/solid";
import {
  HomeModernIcon,
  EnvelopeIcon,
  CreditCardIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { metrics, listingViews, topAgents } from "@/lib/mockData";

const metricIcons: Record<string, any> = { HomeIcon: HomeModernIcon, EnvelopeIcon, CreditCardIcon, UsersIcon: UserGroupIcon };
const avatarColors = ["bg-emerald-100 text-emerald-700","bg-blue-100 text-blue-700","bg-violet-100 text-violet-700","bg-amber-100 text-amber-700"];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("week");
  const [metricsData, setMetricsData] = useState<typeof metrics>([]);
  const [distribution, setDistribution] = useState<typeof listingViews>([]);
  const [agents, setAgents] = useState<typeof topAgents>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", calls: "", rating: "", satisfaction: "" });

  useEffect(() => {
    setMetricsData(metrics);
    setDistribution(listingViews);
    setAgents(topAgents);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const handleAgentClick = (agent: typeof topAgents[0]) => {
    setEditForm({ name: agent.name, calls: agent.calls.toString(), rating: agent.rating.toString(), satisfaction: agent.satisfaction.toString() });
    setEditDialogOpen(true);
  };

  const handleSave = () => { console.log("Updated agent:", editForm); setEditDialogOpen(false); };
  const selectCls = "px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition";
  const inputCls = "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition placeholder:text-slate-400";

  if (loading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-6">
        <Skeleton className="h-7 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}</div>
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const maxViews = Math.max(...distribution.map(d => d.views), 1);

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Monitor listings and agent performance</p>
        </div>
        <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className={selectCls}>
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricsData.map((m) => {
          const Icon = metricIcons[m.icon];
          return (
            <div key={m.name} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">{Icon && <Icon className="w-5 h-5 text-emerald-600" />}</div>
                <span className={`text-xs font-medium ${m.changeType === "positive" ? "text-emerald-600" : "text-red-500"}`}>{m.change}</span>
              </div>
              <p className="text-xs text-slate-500 mb-0.5">{m.name}</p>
              <p className="text-xl font-bold text-slate-900">{m.value}</p>
            </div>
          );
        })}
      </div>

      {/* Listing Views Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5"><ChartBarIcon className="w-5 h-5 text-slate-400" /><h3 className="text-sm font-semibold text-slate-900">Listing Views</h3></div>
        <div className="flex items-end gap-3 h-48">
          {distribution.map((d) => {
            const pct = (d.views / maxViews) * 100;
            return (
              <div key={d.title} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-slate-700">{d.views}</span>
                <div className="w-full rounded-t-lg bg-emerald-100 transition-all" style={{ height: `${pct}%` }}><div className="w-full h-full rounded-t-lg bg-emerald-400/60" /></div>
                <span className="text-[11px] text-slate-500 text-center leading-tight">{d.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Agents Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900">Top Performing Agents</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Agent</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Listings</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Sales</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Inquiries</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {agents.map((agent, idx) => {
                const initials = agent.name.split(" ").map(n => n[0]).join("");
                return (
                  <tr key={agent.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${avatarColors[idx % avatarColors.length]}`}>{initials}</div>
                        <span className="text-sm font-medium text-slate-900">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{agent.listings}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{agent.sales}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{agent.inquiries}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleAgentClick(agent)} className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Edit Agent</DialogTitle></DialogHeader>
          <form className="space-y-4 pt-2" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Name</label>
              <input className={inputCls} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Total Calls</label>
              <input className={inputCls} type="number" value={editForm.calls} onChange={e => setEditForm(f => ({ ...f, calls: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Rating</label>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(star => (
                  <button type="button" key={star} onClick={() => setEditForm(f => ({ ...f, rating: star.toString() }))} aria-label={`Set rating to ${star}`}>
                    <StarIcon className={`w-6 h-6 ${star <= Math.round(Number(editForm.rating)) ? "text-amber-400" : "text-slate-200"}`} />
                  </button>
                ))}
                <span className="ml-2 text-xs text-slate-500">{editForm.rating} / 5</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Customer Satisfaction (%)</label>
              <div className="flex items-center gap-4">
                <Slider min={0} max={100} step={1} value={[Number(editForm.satisfaction)]} onValueChange={([val]: number[]) => setEditForm(f => ({ ...f, satisfaction: val.toString() }))} className="flex-1" />
                <span className="w-10 text-right text-sm font-medium text-slate-700">{editForm.satisfaction}%</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}