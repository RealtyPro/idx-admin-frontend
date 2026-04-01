"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";
import { useMutation } from "@tanstack/react-query";
import { postNewBlog } from "@/services/blog/BlogServices";
import { uploadBlogImage, ImageObject } from "@/services/blog/BlogUpload";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

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
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      setImage(null);

      try {
        const uploadedImageObj = await uploadBlogImage(file);
        console.log("Uploaded image object:", uploadedImageObj);
        setImageObject(uploadedImageObj);
        const previewUrl = uploadedImageObj.path.startsWith("http")
          ? uploadedImageObj.path
          : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/image/local/xs/${uploadedImageObj.path}`;
        console.log("Setting preview URL:", previewUrl);
        setImage(previewUrl);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (error: any) {
        console.error("Error uploading image:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload image. Please try again.";
        alert(errorMessage);
        setImage(null);
        setImageFile(null);
        setImageObject(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData: Omit<BlogResponse, "uuid"> = {
      title,
      subtitle,
      category,
      is_featured: isFeatured ? "1" : "0",
      image: imageObject,
      status,
      content,
      author,
    };
    if (imageObject) {
      postBlogMutation.mutate(formData);
    } else {
      postBlogMutation.mutate({ ...formData, imageFile });
    }
  };

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Add Blog Post</h1>
        <Link
          href="/admin/blog"
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-white transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* ---- Form Card ---- */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Two-column grid for short fields */}
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
                placeholder="Enter blog title"
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
                placeholder="Enter subtitle"
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
                placeholder="Author name"
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
              {uploadSuccess && !uploadingImage && (
                <p className="text-sm text-emerald-600 mb-2">Image uploaded successfully!</p>
              )}
              {image && !uploadingImage && (
                <div className="relative inline-block">
                  <img src={image} alt="Blog post preview" className="max-h-48 rounded-xl object-cover border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImageFile(null);
                      setImageObject(null);
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
              disabled={postBlogMutation.isPending}
              className="px-8 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {postBlogMutation.isPending ? "Creating..." : "Add Blog Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}