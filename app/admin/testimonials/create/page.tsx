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
  const [position, setPosition] = useState("");
  const [rating, setRating] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Create payload without user_id - explicitly exclude it
    const payload: {
      name: string;
      position: string;
      rating: string;
      details: string;
      status: string;
      upload_folder: string;
    } = {
      name,
      position: position || "",
      rating: rating || "",
      details,
      status: "active",
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
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
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
              <Label htmlFor="position">Position</Label>
              <Input id="position" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g., CEO, TechCorp Solutions" />
            </div>
            <div>
              <Label htmlFor="rating">Rating</Label>
              <select
                id="rating"
                value={rating}
                onChange={e => setRating(e.target.value)}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">Select rating</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
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