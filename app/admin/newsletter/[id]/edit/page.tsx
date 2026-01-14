"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/services/Api';

function useSingleNewsletterSubscriber(id: string) {
  return useQuery({
    queryKey: ['newsletter-subscriber', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`v1/admin/newsletter/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export default function NewsletterSubscriberEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const { data, isLoading, isError } = useSingleNewsletterSubscriber(id);
  const subscriber = data?.data || data;
  const [name, setName] = useState(subscriber?.name || '');
  const [email, setEmail] = useState(subscriber?.email || '');
  const [contactNo, setContactNo] = useState(subscriber?.contact_no || '');
  const [description, setDescription] = useState(subscriber?.description || '');
  const [status, setStatus] = useState(subscriber?.status || 'active');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (subscriber) {
      setName(subscriber.name || '');
      setEmail(subscriber.email || '');
      setContactNo(subscriber.contact_no || '');
      setDescription(subscriber.description || '');
      setStatus(subscriber.status || 'active');
    }
  }, [subscriber]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await axiosInstance.put(`v1/admin/newsletter/${id}`, {
        name,
        email,
        contact_no: contactNo,
        description,
        status,
      });
      setLoading(false);
      showToast('Subscriber updated successfully');
      setTimeout(() => router.push(`/admin/newsletter/${id}`), 1200);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to update subscriber');
    }
  }

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl mt-4" />
      </div>
    );
  }

  if (isError || !subscriber) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">The subscriber you are looking for does not exist.</div>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin/newsletter">Back to Newsletter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Edit Newsletter Subscriber</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/newsletter/${subscriber.id}`}>Back</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="contact_no">Contact No</Label>
              <Input id="contact_no" value={contactNo} onChange={e => setContactNo(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea id="description" className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input id="status" value={status} onChange={e => setStatus(e.target.value)} />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
