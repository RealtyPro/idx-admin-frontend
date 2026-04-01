"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { invoices } from "@/lib/mockData";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const statusCls = (s: string) => {
  switch (s) {
    case "Paid": return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    case "Pending": return "bg-amber-50 text-amber-600 border border-amber-200";
    case "Overdue": return "bg-red-50 text-red-600 border border-red-200";
    default: return "bg-slate-50 text-slate-600 border border-slate-200";
  }
};

export default function InvoiceDetailsPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<typeof invoices[0] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInvoice(invoices.find((inv) => inv.id === params.id));
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [params.id]);

  if (loading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-6"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-7 w-52" /></div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <p className="text-slate-500 mb-4">Invoice not found.</p>
          <Link href="/admin/invoices" className="text-emerald-600 hover:underline text-sm">Back to Invoices</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/invoices" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition"><ArrowLeftIcon className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-[22px] font-semibold text-slate-900">Invoice {invoice.id}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-slate-500">{invoice.date}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusCls(invoice.status)}`}>{invoice.status}</span>
            </div>
          </div>
        </div>
        <a href={invoice.url} download className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"><ArrowDownTrayIcon className="w-4 h-4" /> Download PDF</a>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
        <h3 className="text-sm font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100">Invoice Items</h3>
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider pb-3">Description</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider pb-3">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3.5 text-sm text-slate-700">{item.description}</td>
                <td className="py-3.5 text-sm text-slate-900 font-medium text-right">${item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
          <span className="text-sm font-medium text-slate-500">Total</span>
          <span className="text-xl font-bold text-slate-900">${invoice.amount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}