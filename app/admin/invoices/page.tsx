"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { invoices } from "@/lib/mockData";
import {
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const statusCls = (s: string) => {
  switch (s) {
    case "Paid": return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    case "Pending": return "bg-amber-50 text-amber-600 border border-amber-200";
    case "Overdue": return "bg-red-50 text-red-600 border border-red-200";
    default: return "bg-slate-50 text-slate-600 border border-slate-200";
  }
};

export default function InvoicesPage() {
  const [data, setData] = useState<typeof invoices>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData(invoices);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500 mt-0.5">View and download your billing invoices</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Invoice #</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                        <DocumentTextIcon className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-900">{inv.id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{inv.date}</td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-slate-900">${inv.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusCls(inv.status)}`}>{inv.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/admin/invoices/${inv.id}`} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition" title="View"><EyeIcon className="w-4 h-4" /></Link>
                      <a href={inv.url} download className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition" title="Download"><ArrowDownTrayIcon className="w-4 h-4" /></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}