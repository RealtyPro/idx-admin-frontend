"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";
import { useMutation } from "@tanstack/react-query";
import { postNewBlog } from "@/services/blog/BlogServices";
interface BlogResponse {
  title: string;
  subtitle: string;
  author: string;
  category: string;
  publishDate: Date | string; // Use string if data comes as ISO string from backend
  image: string | null;
  content: string;
  isFeatured: boolean;
}

export default function BlogCreatePage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [isFeatured, setIsFeatured] = useState(false); // State for "Is Featured"
  const fileInputRef = useRef<HTMLInputElement>(null);

  const postBlogMutation = useMutation({
    mutationFn: (newBlog:BlogResponse) => postNewBlog(newBlog),

    onSuccess: (data) => {
      console.log("blog posted successfully:", data);
      window.location.href="/admin/blog";

    },
    onError: (error) => {
      console.error("Error  while loggin:", error);
    },
  });
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Collect form data
    const formData = {
      title,
      subtitle,
      author,
      category,
      publishDate,
      image,
      content,
      isFeatured,
      status:true
    };
    postBlogMutation.mutate(formData);
    // Example: Log the form data (replace this with an API call)
    console.log("Form Data Submitted:", formData);

    // Reset form fields (optional)
    setTitle("");
    setSubtitle("");
    setAuthor("");
    setCategory("");
    setPublishDate("");
    setImage(null);
    setContent("");
    setIsFeatured(false);

    alert("Blog post submitted successfully!");
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Add Blog Post</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/blog">Back</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full text-sm border-gray-300 rounded-md"
                required
              >
                <option value="">Select a category</option>
                <option value="blog">Blog</option>
                <option value="news">News</option>
                <option value="articles">Articles</option>
              </select>
            </div>
            <div>
              <Label htmlFor="publishDate">Publish Date</Label>
              <Input
                id="publishDate"
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="image">Image</Label>
              <input
                id="image"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                onChange={handleImageChange}
                ref={fileInputRef}
              />
              {image && (
                <div className="mt-2">
                  <img src={image} alt="Preview" className="max-h-40 rounded" />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                className="bg-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="isFeatured"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <Label htmlFor="isFeatured">Is Featured</Label>
            </div>
            <Button type="submit">Add Blog Post</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}