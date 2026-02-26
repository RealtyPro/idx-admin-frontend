"use client";
import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPage } from "@/services/page/PageServices";
import { ArrowLeftIcon, DocumentTextIcon, PhotoIcon } from "@heroicons/react/24/outline";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function PageCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

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
  const [bannerFile, setBannerFile] = useState<File | null>(null);
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pages"] }); router.push("/admin/pages"); },
    onError: (error: any) => { alert(error?.response?.data?.message || error?.message || "Failed to create page."); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPageMutation.mutate({ name, title, heading, sub_heading, abstract, content, meta_title, meta_keyword, meta_description, banner, bannerFile, images, compile, view, category, order, user_id, status, marking });
  };

  const inputCls = "w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition";
  const selectCls = "w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition";
  const textareaCls = "w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition resize-none";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/pages" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition"><ArrowLeftIcon className="w-4 h-4" /></Link>
        <h1 className="text-[22px] font-semibold text-slate-900">Add Page</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center"><DocumentTextIcon className="w-5 h-5 text-emerald-600" /></div>
          <div><h2 className="text-base font-semibold text-slate-900">Page Details</h2><p className="text-xs text-slate-500">Create a new page</p></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className={labelCls}>Name <span className="text-red-400">*</span></label><input value={name} onChange={e => setName(e.target.value)} required placeholder="Page name" className={inputCls} /></div>
          <div><label className={labelCls}>Title <span className="text-red-400">*</span></label><input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Page title" className={inputCls} /></div>
          <div><label className={labelCls}>Heading</label><input value={heading} onChange={e => setHeading(e.target.value)} placeholder="Heading" className={inputCls} /></div>
          <div><label className={labelCls}>Sub Heading</label><input value={sub_heading} onChange={e => setSubHeading(e.target.value)} placeholder="Sub heading" className={inputCls} /></div>
        </div>

        <div><label className={labelCls}>Abstract</label><textarea value={abstract} onChange={e => setAbstract(e.target.value)} rows={3} placeholder="Brief abstract..." className={textareaCls} /></div>

        <div>
          <label className={labelCls}>Content</label>
          <div className="rounded-xl overflow-hidden border border-slate-200"><ReactQuill theme="snow" value={content} onChange={setContent} className="bg-white" /></div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">SEO Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div><label className={labelCls}>Meta Title</label><input value={meta_title} onChange={e => setMetaTitle(e.target.value)} placeholder="Meta title" className={inputCls} /></div>
            <div><label className={labelCls}>Meta Keyword</label><input value={meta_keyword} onChange={e => setMetaKeyword(e.target.value)} placeholder="Meta keywords" className={inputCls} /></div>
          </div>
          <div className="mt-4"><label className={labelCls}>Meta Description</label><textarea value={meta_description} onChange={e => setMetaDescription(e.target.value)} rows={3} placeholder="Meta description..." className={textareaCls} /></div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Media & Settings</h3>
          <div>
            <label className={labelCls}>Banner Image</label>
            {banner && <img src={banner} alt="Banner" className="max-h-40 rounded-xl border border-slate-200 object-cover mb-3" />}
            <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition cursor-pointer">
              <PhotoIcon className="w-7 h-7 text-slate-400 mb-1" /><span className="text-xs text-slate-500">Click to upload banner</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0] || null; setBannerFile(f); }} />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
            <div><label className={labelCls}>Order</label><input type="number" value={order} onChange={e => setOrder(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Status</label><select value={status} onChange={e => setStatus(e.target.value)} className={selectCls}><option value="show">Show</option><option value="hide">Hide</option></select></div>
            <div><label className={labelCls}>Images</label><select value={images} onChange={e => setImages(e.target.value)} className={selectCls}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={createPageMutation.isPending} className="px-6 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors">{createPageMutation.isPending ? "Creating..." : "Create Page"}</button>
          <Link href="/admin/pages" className="px-6 py-2.5 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}