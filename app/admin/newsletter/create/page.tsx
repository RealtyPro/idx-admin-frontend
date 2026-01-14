"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/services/Api';

export default function NewsletterCreatePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await axiosInstance.post('v1/admin/newsletter', {
        ListAgentMlsId: 'NWM1307294',
        name,
        email,
        contact_no: contactNo,
        description,
        status,
      });
      setLoading(false);
      showToast('Subscriber added successfully');
      setTimeout(() => router.push('/admin/newsletter'), 1200);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to add subscriber');
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

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Add Newsletter Subscriber</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/newsletter">Back</Link>
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
              <select
                id="status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Subscriber'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
