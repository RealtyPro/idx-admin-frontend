"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useSinglePage, useUpdatePage } from "@/services/page/PageQueries";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, DocumentTextIcon, PhotoIcon } from "@heroicons/react/24/outline";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function PageEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const { data, isLoading, isError } = useSinglePage(id);
  const page = data?.data || data;
  const updatePageMutation = useUpdatePage();

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

  useEffect(() => {
    if (page) {
      setName(page.name || ""); setTitle(page.title || ""); setHeading(page.heading || "");
      setSubHeading(page.sub_heading || ""); setAbstract(page.abstract || ""); setContent(page.content || "");
      setMetaTitle(page.meta_title || ""); setMetaKeyword(page.meta_keyword || ""); setMetaDescription(page.meta_description || "");
      setBanner(page.banner || ""); setImages(page.images || "active"); setCompile(page.compile || "active");
      setView(page.view || ""); setCategory(page.category || ""); setOrder(page.order ? String(page.order) : "1");
      setStatus(page.status || "show"); setMarking(page.marking || "");
    }
  }, [page]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePageMutation.mutate(
      { id, data: { uuid: page?.uuid, name, title, heading, sub_heading, abstract, content, meta_title, meta_keyword, meta_description, banner, bannerFile, images, compile, view, category, order, user_id: page?.user_id || user_id, status, marking } },
      {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pages"] }); queryClient.invalidateQueries({ queryKey: ["page", id] }); router.push("/admin/pages"); },
        onError: (error: any) => { alert(error?.response?.data?.message || error?.message || "Failed to update page."); },
      }
    );
  };

  const inputCls = "w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition";
  const selectCls = "w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition";
  const textareaCls = "w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition resize-none";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

  if (isLoading) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4"><div className="flex items-center gap-3 mb-6"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-7 w-48" /></div><Skeleton className="h-[600px] w-full rounded-2xl" /></div>);
  }

  if (isError || !page) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto"><div className="bg-white rounded-2xl border border-slate-100 p-8 text-center"><p className="text-slate-500 mb-4">Page not found.</p><Link href="/admin/pages" className="text-emerald-600 hover:underline text-sm">Back to Pages</Link></div></div>);
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/pages/${id}`} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition"><ArrowLeftIcon className="w-4 h-4" /></Link>
        <h1 className="text-[22px] font-semibold text-slate-900">Edit Page</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center"><DocumentTextIcon className="w-5 h-5 text-emerald-600" /></div>
          <div><h2 className="text-base font-semibold text-slate-900">Page Details</h2><p className="text-xs text-slate-500">Update page information</p></div>
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
              <PhotoIcon className="w-7 h-7 text-slate-400 mb-1" /><span className="text-xs text-slate-500">Click to change banner</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => { setBannerFile(e.target.files?.[0] || null); }} />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
            <div><label className={labelCls}>Order</label><input type="number" value={order} onChange={e => setOrder(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Status</label><select value={status} onChange={e => setStatus(e.target.value)} className={selectCls}><option value="show">Show</option><option value="hide">Hide</option></select></div>
            <div><label className={labelCls}>Images</label><select value={images} onChange={e => setImages(e.target.value)} className={selectCls}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          </div>
          <div className="mt-4"><label className={labelCls}>Marking</label><input value={marking} onChange={e => setMarking(e.target.value)} placeholder="Marking" className={inputCls} /></div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={updatePageMutation.isPending} className="px-6 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors">{updatePageMutation.isPending ? "Updating..." : "Update Page"}</button>
          <Link href={`/admin/pages/${id}`} className="px-6 py-2.5 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}