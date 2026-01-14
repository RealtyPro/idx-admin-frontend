"use client";
import React from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { mockPages } from '@/lib/mockData';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function PageEditPage() {
  const [page, setPage] = useState<typeof mockPages[0] | undefined>(undefined);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const found = mockPages.find((p) => p.id === params.id);
    setPage(found);
    if (found) setContent(found.content || "");
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

  if (!page) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Page Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">The page you are looking for does not exist.</div>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin/pages">Back to Pages</Link>
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
          <CardTitle>Edit Page</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/pages/${page.id}`}>Back</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" defaultValue={page.title} />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" defaultValue={page.slug} />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" defaultValue={page.date} />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <ReactQuill theme="snow" value={content} onChange={setContent} className="bg-white" />
            </div>
            <Button type="submit">Update</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 