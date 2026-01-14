"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { mockContacts } from '@/lib/mockData';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function ContactEditPage() {
  const [contact, setContact] = useState<typeof mockContacts[0] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    setContact(mockContacts.find((c) => c.id === params.id));
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl mt-4" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Contact Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">The contact you are looking for does not exist.</div>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin/contact-us">Back to Contacts</Link>
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
          <CardTitle>Edit Contact</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/contact-us/${contact.id}`}>Back</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={contact.name} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={contact.email} />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <textarea id="message" className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={contact.message} />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" defaultValue={contact.date} />
            </div>
            <Button type="submit">Update</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 