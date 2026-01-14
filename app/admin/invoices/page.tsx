'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { invoices } from '@/lib/mockData';
import { Skeleton } from '@/components/ui/skeleton';

function statusBadge(status: string) {
  switch (status) {
    case 'Paid':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>;
    case 'Pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    case 'Overdue':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>;
    default:
      return null;
  }
}

export default function InvoicesPage() {
  const [invoicesData, setInvoicesData] = useState<typeof invoices>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInvoicesData(invoices);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
        <Skeleton className="h-20 w-full rounded-xl mb-4" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif text-dark">Invoices</h1>
          <p className="text-dark-secondary">View and download your billing invoices</p>
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-secondary">Invoice #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-secondary">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-secondary">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-secondary">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-dark-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoicesData.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-dark">{invoice.id}</td>
                    <td className="px-4 py-3 text-sm">{invoice.date}</td>
                    <td className="px-4 py-3 text-sm">${invoice.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">{statusBadge(invoice.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                          <Link href={`/admin/invoices/${invoice.id}`} title="View Invoice">
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                          <a href={invoice.url} download title="Download Invoice">
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 