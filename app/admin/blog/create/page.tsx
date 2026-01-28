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
  uuid?: string; // UUID not needed in payload
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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
      setUploadSuccess(false);
      
      // Hide preview during upload
      setImage(null);
      
      try {
        // Upload the image and get the image object
        const uploadedImageObj = await uploadBlogImage(file);
        console.log("Uploaded image object:", uploadedImageObj);
        setImageObject(uploadedImageObj);
        
        // Set preview image URL - construct from path or use existing image
        const previewUrl = uploadedImageObj.path.startsWith('http') 
          ? uploadedImageObj.path 
          : `https://demorealestate2.webnapps.net/image/local/xs/${uploadedImageObj.path}`;
        
        console.log("Setting preview URL:", previewUrl);
        setImage(previewUrl);
        setUploadSuccess(true);
        
        // Remove alert to prevent state issues
        setTimeout(() => setUploadSuccess(false), 3000);
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
    const formData: Omit<BlogResponse, 'uuid'> = {
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
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
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
                style={{ border: '1px solid #e5e5e5', minHeight: '37px' }}
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
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600 flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading image...
                  </p>
                </div>
              )}
              {uploadSuccess && !uploadingImage && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Image uploaded successfully!
                  </p>
                </div>
              )}
              {image && !uploadingImage && (
                <div className="mt-4 relative inline-block">
                  <img 
                    src={image} 
                    alt="Blog post preview" 
                    className="max-h-64 max-w-full rounded-lg shadow-md object-cover border border-gray-200" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImageFile(null);
                      setImageObject(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                    title="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
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