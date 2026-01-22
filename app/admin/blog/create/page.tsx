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
import { uploadBlogImage, ImageObject } from "@/services/blog/BlogUpload";

interface BlogResponse {
  ListAgentMlsId: string;
  title: string;
  subtitle: string;
  category: string;
  is_featured: string;
  image: ImageObject | null;
  status: string;
  content: string;
  author: string;
}

export default function BlogCreatePage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageObject, setImageObject] = useState<ImageObject | null>(null);
  const [content, setContent] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState("published");
  const listAgentMlsId = "NWM1307294";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const postBlogMutation = useMutation({
    mutationFn: (newBlog: BlogResponse & { imageFile?: File | null }) => postNewBlog(newBlog),

    onSuccess: (data) => {
      console.log("blog posted successfully:", data);
      // Reset form fields after successful submission
      setTitle("");
      setSubtitle("");
      setAuthor("");
      setCategory("");
      setImage(null);
      setImageFile(null);
      setImageObject(null);
      setContent("");
      setIsFeatured(false);
      setStatus("published");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Redirect to blog list page
      window.location.href = "/admin/blog";
    },
    onError: (error: any) => {
      console.error("Error while creating blog:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create blog post. Please try again.";
      alert(errorMessage);
    },
  });
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setUploadingImage(true);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      try {
        // Upload the image and get the image object
        const uploadedImageObj = await uploadBlogImage(file);
        setImageObject(uploadedImageObj);
        
        // Set preview image URL - construct from path or use existing image
        const previewUrl = uploadedImageObj.path.startsWith('http') 
          ? uploadedImageObj.path 
          : `https://demorealestate2.webnapps.net/storage/${uploadedImageObj.path}`;
        setImage(previewUrl);
        
        alert("Image uploaded successfully");
      } catch (error: any) {
        console.error("Error uploading image:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload image. Please try again.";
        alert(errorMessage);
        // Reset preview if upload fails
        setImage(null);
        setImageFile(null);
        setImageObject(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Collect form data matching the API structure
    const formData: BlogResponse = {
      ListAgentMlsId: listAgentMlsId,
      title,
      subtitle,
      category,
      is_featured: isFeatured ? "1" : "0",
      image: imageObject, // Use the uploaded image object instead of null
      status,
      content,
      author
    };
    
    // If we have an image object, send it; otherwise send imageFile for backward compatibility
    if (imageObject) {
      postBlogMutation.mutate(formData);
    } else {
      postBlogMutation.mutate({ ...formData, imageFile });
    }
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
              <Label htmlFor="image">Image</Label>
              <input
                id="image"
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
                onChange={handleImageChange}
                ref={fileInputRef}
              />
              {uploadingImage && (
                <p className="text-xs text-muted-foreground mt-1">Uploading image...</p>
              )}
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
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
                required
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
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
            <Button type="submit" disabled={postBlogMutation.isPending}>
              {postBlogMutation.isPending ? "Creating..." : "Add Blog Post"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}