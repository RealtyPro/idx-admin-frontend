"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { mockAgents } from "@/lib/mockData";
import {
  UserGroupIcon,
  EnvelopeIcon,
  EyeIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const avatarColors = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<typeof mockAgents>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAgents(mockAgents);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <Skeleton className="h-7 w-32" />
        <div className="grid gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900">Agents</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your team of agents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent, idx) => {
          const initials = agent.name.split(" ").map((n) => n[0]).join("");
          const colorCls = avatarColors[idx % avatarColors.length];
          return (
            <div key={agent.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${colorCls}`}>{initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{agent.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${agent.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>{agent.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{agent.email}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-900">{agent.listings}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Listings</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-900">{agent.sales}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Sales</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-center">
                      <p className="text-xs text-slate-500">{agent.role}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Role</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-center">
                      <p className="text-xs text-slate-500">{agent.lastActive}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Last Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}