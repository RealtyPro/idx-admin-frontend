"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ContactCreatePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Contact added: ${name}`);
  };

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Add Contact</h1>
        <Link
          href="/admin/contact-us"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20" placeholder="Full name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20" placeholder="email@example.com" />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20" />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
            <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={4}
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
              placeholder="Enter message..." />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit"
              className="px-8 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm">
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}