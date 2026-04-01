"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { mockContacts } from "@/lib/mockData";
import { useParams } from "next/navigation";
import { ArrowLeftIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

export default function ContactEditPage() {
  const params = useParams();
  const [contact, setContact] = useState<typeof mockContacts[0] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setContact(mockContacts.find((c) => c.id === params.id));
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [params.id]);

  if (loading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <EnvelopeIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Contact Not Found</h2>
          <p className="text-sm text-slate-400 mb-4">The contact you are looking for does not exist.</p>
          <Link href="/admin/contact-us"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Contacts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Edit Contact</h1>
        <Link href="/admin/contact-us"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition">
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
              <Input id="name" defaultValue={contact.name}
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <Input id="email" type="email" defaultValue={contact.email}
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
              <Input id="date" type="date" defaultValue={contact.date}
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20" />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
            <textarea id="message" defaultValue={contact.message} rows={4}
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition resize-none" />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit"
              className="px-8 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm">
              Update Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}