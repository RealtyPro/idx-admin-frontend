"use client";
import React from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { mockBlogs } from '@/lib/mockData';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
import { useSingleBlog } from '@/services/blog/BlogQueris';

export default function BlogEditPage() {

  const [blog, setBlog] = useState<typeof mockBlogs[0] | undefined>(undefined);
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState('Draft');
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const params = useParams();
  // const { data: singleBlog, isLoading, error} = useSingleBlog({ id: params.id as string });
  // const fileInputRef = useRef<HTMLInputElement>(null);
const invokeSingleBlogFetch=()=>{
  const { data: singleBlog, isLoading, error} = useSingleBlog({ id: params.id as string });

}
  useEffect(() => {
    invokeSingleBlogFetch();
    const found = mockBlogs.find((b) => b.id === params.id);
    setBlog(found);
    if (found) {
      setTitle(found.title);
      setSubtitle(found.subtitle || '');
      setCategory(found.category || '');
      setDate(found.date || '');
      setIsFeatured(!!found.isFeatured);
      setStatus(found.status || 'Draft');
      setContent(found.content);
    }
    setLoading(false);
  }, [params.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

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

  if (!blog) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Blog Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">The blog post you are looking for does not exist.</div>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin/blog">Back to Blog List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to update the blog
    
    alert(`Blog updated: ${title}`);
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Edit Blog Post</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/blog/${blog.id}`}>Back</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={e => setCategory(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input id="isFeatured" type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
              <Label htmlFor="isFeatured">Featured</Label>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value)} className="px-4 py-2 rounded-lg border border-input bg-background text-sm">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <ReactQuill theme="snow" value={content} onChange={setContent} className="bg-white" />
            </div>
            <Button type="submit">Update Blog</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 