"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockPages } from '@/lib/mockData';
import { useState, useEffect } from "react";
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export default function PagesListPage() {
  const [pages, setPages] = useState<typeof mockPages>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPages(mockPages);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-32 rounded" />
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pages</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin">Back</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/pages/create">Add Page</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {pages.map((p) => (
          <Card key={p.id}>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-lg">
                  <Link href={`/admin/pages/${p.id}`}>{p.title}</Link>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {p.slug} • {p.date}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/pages/${p.id}/edit`}>Edit</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => alert('Deleted!')}>Delete</Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
} 