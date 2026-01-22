"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useSingleBlog } from '@/services/blog/BlogQueris';
import { useMutation } from "@tanstack/react-query";
import { updateBlog } from "@/services/blog/BlogServices";
import { uploadBlogImage, ImageObject } from "@/services/blog/BlogUpload";

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

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

export default function BlogEditPage() {
  const params = useParams();
  const { data: singleBlog, isLoading, error } = useSingleBlog({ id: params.id as string });
  
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageObject, setImageObject] = useState<ImageObject | null>(null);
  const [originalImageObject, setOriginalImageObject] = useState<ImageObject | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState('published');
  const [content, setContent] = useState<string>("");
  const [listAgentMlsId, setListAgentMlsId] = useState("NWM1307294");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  // Populate form when blog data is loaded
  useEffect(() => {
    if (singleBlog?.data) {
      const blog = singleBlog.data;
      setTitle(blog.title || '');
      setSubtitle(blog.subtitle || '');
      setAuthor(blog.author || '');
      setCategory(blog.category || '');
      setContent(blog.content || '');
      setStatus(blog.status || 'published');
      setIsFeatured(blog.is_featured === "1" || blog.is_featured === 1 || blog.is_featured === true);
      setListAgentMlsId(blog.ListAgentMlsId || "NWM1307294");
      
      // Set existing image if available
      if (blog.image) {
        // Handle image - could be a path string or image object
        if (typeof blog.image === 'string') {
          setImage(blog.image);
          setOriginalImage(blog.image);
        } else if (blog.image && typeof blog.image === 'object') {
          // Store the image object
          setImageObject(blog.image as ImageObject);
          setOriginalImageObject(blog.image as ImageObject);
          
          // Set preview URL
          const imageUrl = blog.image.path?.startsWith('http') 
            ? blog.image.path 
            : `https://demorealestate2.webnapps.net/storage/${blog.image.path}`;
          setImage(imageUrl);
          setOriginalImage(imageUrl);
        }
      }
    }
  }, [singleBlog]);

  const updateBlogMutation = useMutation({
    mutationFn: (updatedBlog: BlogResponse & { imageFile?: File | null }) => 
      updateBlog(params.id as string, updatedBlog),
    onSuccess: (data) => {
      console.log("blog updated successfully:", data);
      window.location.href = "/admin/blog";
    },
    onError: (error: any) => {
      console.error("Error while updating blog:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update blog post. Please try again.";
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
        
        // Set preview image URL
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
        setImage(originalImage);
        setImageObject(originalImageObject);
        setImageFile(null);
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

    // Base form data without image
    const formData: Omit<BlogResponse, 'image'> & { image?: ImageObject | null } = {
      ListAgentMlsId: listAgentMlsId,
      title,
      subtitle,
      category,
      is_featured: isFeatured ? "1" : "0",
      status,
      content,
      author,
    };

    // Only attach image field if a NEW image was uploaded
    // (i.e. imageObject exists and is different from the original image object)
    if (imageObject && imageObject !== originalImageObject) {
      formData.image = imageObject;
    }

    updateBlogMutation.mutate(formData as BlogResponse);
  };

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

  if (error || !singleBlog?.data) {
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

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Edit Blog Post</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/blog/${params.id}`}>Back</Link>
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
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
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
            <Button type="submit" disabled={updateBlogMutation.isPending}>
              {updateBlogMutation.isPending ? "Updating..." : "Update Blog"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
