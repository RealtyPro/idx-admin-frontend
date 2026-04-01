"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { mockContacts } from "@/lib/mockData";
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

export default function ContactUsListPage() {
  const [contacts, setContacts] = useState<typeof mockContacts>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setContacts(mockContacts);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const avatarColors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const getAcronym = (name: string) =>
    name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

  if (loading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[100px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Contact Submissions</h1>
        <Link
          href="/admin/contact-us/create"
          className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
        >
          <PlusCircleIcon className="w-4 h-4" />
          Add Contact
        </Link>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <EnvelopeIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg">No contact submissions found.</p>
          </div>
        ) : (
          contacts.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex overflow-hidden cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-[100px] min-h-[100px] flex-shrink-0 flex items-center justify-center hidden sm:flex">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${getAvatarColor(c.name)}`}>
                  {getAcronym(c.name)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[15px] font-semibold text-slate-900 truncate">{c.name}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <EnvelopeIcon className="w-3.5 h-3.5 text-slate-400" />
                    {c.email}
                  </span>
                  {c.date && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
                      {c.date}
                    </span>
                  )}
                </div>
                {c.message && (
                  <p className="text-sm text-slate-400 italic mt-2 line-clamp-1">
                    {c.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pr-5 flex-shrink-0">
                <Link
                  href={`/admin/contact-us/${c.id}/edit`}
                  className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4" />
                </Link>
                <button
                  className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}