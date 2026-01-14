"use client";

import React, { useState } from "react"; 
import { useRouter } from "next/navigation";
import { createTestimonial } from '@/services/testimonial/TestimonialServices';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Simple toast utility (replace with your own or a library if available)
function showToast(message: string) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.top = '32px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = '#323232';
  toast.style.color = '#fff';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '8px';
  toast.style.zIndex = '9999';
  toast.style.fontSize = '1rem';
  toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.5s';
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 500);
  }, 2000);
}


export default function TestimonialCreatePage() {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      ListAgentMlsId: "NWM1307294",
      name,
      position: null,
      rating: null,
      details,
      image: {
        folder: "testimonial/testimonial/2025/04/02/014016299/photo",
        file: "ZgDoy6JcSNC9M7xKREL5hrTDgTLbCP4Lg22FINFw.jpg",
        path: "testimonial/testimonial/2025/04/02/014016299/photo/ZgDoy6JcSNC9M7xKREL5hrTDgTLbCP4Lg22FINFw.jpg",
        disk: "local",
        original: "Screenshot_20250116_115317_Google.jpg",
        title: "Screenshot 20250116 115317 google",
        caption: "Screenshot 20250116 115317 google",
        time: "2025-04-02 01:41:08"
      },
      status: "active",
      user_id: "104",
      upload_folder: "testimonial/testimonial"
    };
    try {
      await createTestimonial(payload);
      setLoading(false);
      showToast("Testimonial added successfully");
      setTimeout(() => {
        router.push("/admin/testimonials");
      }, 1200);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Failed to add testimonial");
    }
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Add Testimonial</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/testimonials">Back</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="details">Details</Label>
              <textarea id="details" className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={details} onChange={e => setDetails(e.target.value)} required />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Testimonial"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}