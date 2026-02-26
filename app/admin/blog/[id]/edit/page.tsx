"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useSingleBlog } from "@/services/blog/BlogQueris";
import { useMutation } from "@tanstack/react-query";
import { updateBlog } from "@/services/blog/BlogServices";
import { uploadBlogImage, ImageObject } from "@/services/blog/BlogUpload";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface BlogResponse {
  uuid?: string;
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
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState("published");
  const [content, setContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  useEffect(() => {
    if (singleBlog?.data) {
      const blog = singleBlog.data;
      setTitle(blog.title || "");
      setSubtitle(blog.subtitle || "");
      setAuthor(blog.author || "");
      setCategory(blog.category || "");
      setContent(blog.content || "");
      setStatus(blog.status || "published");
      setIsFeatured(blog.is_featured === "1" || blog.is_featured === 1 || blog.is_featured === true);

      if (blog.image) {
        if (typeof blog.image === "string") {
          setImage(blog.image);
          setOriginalImage(blog.image);
        } else if (typeof blog.image === "object") {
          setImageObject(blog.image as ImageObject);
          setOriginalImageObject(blog.image as ImageObject);
          const imageUrl = blog.image.path?.startsWith("http")
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
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update blog post.";
      alert(errorMessage);
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setUploadingImage(true);

      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);

      try {
        const uploadedImageObj = await uploadBlogImage(file);
        setImageObject(uploadedImageObj);
        const previewUrl = uploadedImageObj.path.startsWith("http")
          ? uploadedImageObj.path
          : `https://demorealestate2.webnapps.net/storage/${uploadedImageObj.path}`;
        setImage(previewUrl);
      } catch (error: any) {
        console.error("Error uploading image:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload image.";
        alert(errorMessage);
        setImage(originalImage);
        setImageObject(originalImageObject);
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData: Omit<BlogResponse, "image" | "uuid"> & { image?: ImageObject | null } = {
      title,
      subtitle,
      category,
      is_featured: isFeatured ? "1" : "0",
      status,
      content,
      author,
    };
    if (imageObject && imageObject !== originalImageObject) {
      formData.image = imageObject;
    }
    updateBlogMutation.mutate(formData as BlogResponse);
  };

  /* ---------- loading ---------- */
  if (isLoading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  /* ---------- error ---------- */
  if (error || !singleBlog?.data) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Blog Not Found</h2>
          <p className="text-sm text-slate-400 mb-4">The blog post you are looking for does not exist.</p>
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Blog List
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Edit Blog Post</h1>
        <Link
          href={`/admin/blog/${params.id}`}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* ---- Form Card ---- */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-slate-700 mb-1.5">Subtitle</label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
              />
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-slate-700 mb-1.5">Author</label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="rounded-xl border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/20"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
              >
                <option value="">Select a category</option>
                <option value="blog">Blog</option>
                <option value="news">News</option>
                <option value="articles">Articles</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Featured toggle */}
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  id="isFeatured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500/20"
                />
                <span className="text-sm font-medium text-slate-700">Mark as Featured</span>
              </label>
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Image</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-300 transition">
              {!image && !uploadingImage && (
                <div className="flex flex-col items-center gap-2">
                  <PhotoIcon className="w-10 h-10 text-slate-300" />
                  <p className="text-sm text-slate-400">Click to upload or drag & drop</p>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100 disabled:opacity-50 cursor-pointer"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                  />
                </div>
              )}
              {uploadingImage && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <svg className="animate-spin h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm text-emerald-600">Uploading image...</span>
                </div>
              )}
              {image && !uploadingImage && (
                <div className="relative inline-block">
                  <img src={image} alt="Preview" className="max-h-48 rounded-xl object-cover border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImageFile(null);
                      setImageObject(originalImageObject);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    title="Remove image"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content editor */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1.5">Content</label>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                className="bg-white"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updateBlogMutation.isPending}
              className="px-8 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updateBlogMutation.isPending ? "Updating..." : "Update Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
