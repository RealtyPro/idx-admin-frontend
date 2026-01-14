'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { invoices } from '@/lib/mockData';
import { useState, useEffect } from 'react';

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

export default function InvoiceDetailsPage() {
  const [invoice, setInvoice] = useState<typeof invoices[0] | undefined>(undefined);
  const params = useParams();
  useEffect(() => {
    setInvoice(invoices.find((inv) => inv.id === params.id));
  }, [params.id]);

  if (!invoice) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-serif text-dark">Invoice Not Found</h1>
        <p className="text-dark-secondary">The invoice you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Invoice {invoice.id}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4">
              <span>Date: {invoice.date}</span>
              <span>Status: {statusBadge(invoice.status)}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Invoice Items</h2>
            <table className="w-full mb-4">
              <thead>
                <tr>
                  <th className="text-left text-sm text-dark-secondary py-2">Description</th>
                  <th className="text-right text-sm text-dark-secondary py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 text-dark">{item.description}</td>
                    <td className="py-2 text-right text-dark">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end items-center gap-4">
              <span className="font-semibold text-dark">Total:</span>
              <span className="text-xl font-bold text-dark">${invoice.amount.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button asChild variant="outline">
              <a href={invoice.url} download>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Download PDF
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 