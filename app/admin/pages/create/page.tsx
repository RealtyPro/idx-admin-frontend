"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPage } from '@/services/page/PageServices';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function PageCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [ListAgentMlsId] = useState("NWM1307294");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [heading, setHeading] = useState("");
  const [sub_heading, setSubHeading] = useState("");
  const [abstract, setAbstract] = useState("");
  const [content, setContent] = useState("");
  const [meta_title, setMetaTitle] = useState("");
  const [meta_keyword, setMetaKeyword] = useState("");
  const [meta_description, setMetaDescription] = useState("");
  const [banner, setBanner] = useState("");
  const [images, setImages] = useState("active");
  const [compile, setCompile] = useState("active");
  const [view, setView] = useState("");
  const [category, setCategory] = useState("");
  const [order, setOrder] = useState("1");
  const [user_id] = useState("104");
  const [status, setStatus] = useState("show");
  const [marking, setMarking] = useState("");

  const createPageMutation = useMutation({
    mutationFn: (pageData: object) => createPage(pageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      alert("Page created successfully");
      router.push("/admin/pages");
    },
    onError: (error: any) => {
      console.error("Error creating page:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create page. Please try again.";
      alert(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ListAgentMlsId,
      name,
      title,
      heading,
      sub_heading,
      abstract,
      content,
      meta_title,
      meta_keyword,
      meta_description,
      banner,
      images,
      compile,
      view,
      category,
      order,
      user_id,
      status,
      marking
    };

    createPageMutation.mutate(payload);
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Add Page</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/pages">Back</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="heading">Heading</Label>
                <Input id="heading" value={heading} onChange={e => setHeading(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sub_heading">Sub Heading</Label>
                <Input id="sub_heading" value={sub_heading} onChange={e => setSubHeading(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="abstract">Abstract</Label>
              <textarea 
                id="abstract" 
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" 
                value={abstract} 
                onChange={e => setAbstract(e.target.value)} 
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <ReactQuill theme="snow" value={content} onChange={setContent} className="bg-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input id="meta_title" value={meta_title} onChange={e => setMetaTitle(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="meta_keyword">Meta Keyword</Label>
                <Input id="meta_keyword" value={meta_keyword} onChange={e => setMetaKeyword(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <textarea 
                id="meta_description" 
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" 
                value={meta_description} 
                onChange={e => setMetaDescription(e.target.value)} 
              />
            </div>

            <div>
              <Label htmlFor="banner">Banner</Label>
              <textarea 
                id="banner" 
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" 
                value={banner} 
                onChange={e => setBanner(e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="view">View</Label>
                <Input id="view" value={view} onChange={e => setView(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={category} onChange={e => setCategory(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Order</Label>
                <Input id="order" type="number" value={order} onChange={e => setOrder(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="show">Show</option>
                  <option value="hide">Hide</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="images">Images</Label>
                <select
                  id="images"
                  value={images}
                  onChange={e => setImages(e.target.value)}
                  className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <Label htmlFor="compile">Compile</Label>
                <select
                  id="compile"
                  value={compile}
                  onChange={e => setCompile(e.target.value)}
                  className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="marking">Marking</Label>
              <Input id="marking" value={marking} onChange={e => setMarking(e.target.value)} />
            </div>

            <Button type="submit" disabled={createPageMutation.isPending}>
              {createPageMutation.isPending ? "Creating..." : "Create Page"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
