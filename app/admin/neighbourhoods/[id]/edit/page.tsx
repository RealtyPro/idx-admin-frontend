"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useSingleNeighbourhood, useUpdateNeighbourhood } from "@/services/neighbourhood/NeighbourhoodQueries";
import { useQueryClient } from "@tanstack/react-query";
import { uploadNeighbourhoodImage, ImageObject } from "@/services/neighbourhood/NeighbourhoodUpload";
import { useStates, useCountiesByState, useCitiesByCounty } from "@/services/location/LocationQueries";
import { ArrowLeftIcon, MapPinIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function NeighbourhoodEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (typeof window !== "undefined" && !sessionStorage.getItem("access_token")) router.push("/login"); }, [router]);

  const { data, isLoading, isError } = useSingleNeighbourhood(id);
  const neighbourhood = data?.data || data;
  const updateMutation = useUpdateNeighbourhood();

  const [state, setState] = useState<string | number>("");
  const [county, setCounty] = useState<string | number>("");
  const [city, setCity] = useState<string | number>("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageObject, setImageObject] = useState<ImageObject | null>(null);
  const [originalImageObject, setOriginalImageObject] = useState<ImageObject | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [status, setStatus] = useState("active");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { data: statesData, isLoading: statesLoading } = useStates();
  const { data: countiesData, isLoading: countiesLoading } = useCountiesByState(state ? String(state) : "");
  const { data: citiesData, isLoading: citiesLoading } = useCitiesByCounty(county ? String(county) : "");
  const statesList = statesData?.data || statesData || [];
  const countiesList = countiesData?.data || countiesData || [];
  const citiesList = citiesData?.data || citiesData || [];

  useEffect(() => {
    if (neighbourhood) {
      setState(neighbourhood.state_id ? String(neighbourhood.state_id) : "");
      setCounty(neighbourhood.county_id ? String(neighbourhood.county_id) : "");
      setCity(neighbourhood.city_id ? String(neighbourhood.city_id) : "");
      setDescription(neighbourhood.description || "");
      setStatus(neighbourhood.status || "active");
      const imgData = neighbourhood.images || neighbourhood.image;
      if (imgData) {
        if (typeof imgData === "string") {
          const isDefault = imgData.includes("/img/default/") || imgData.includes("default");
          const url = imgData.startsWith("http") ? imgData : `https://demorealestate2.webnapps.net/storage/${imgData}`;
          setImage(url);
          if (!isDefault) setOriginalImage(url);
        } else if (typeof imgData === "object") {
          setImageObject(imgData as ImageObject);
          setOriginalImageObject(imgData as ImageObject);
          const url = imgData.path?.startsWith("http") ? imgData.path : `https://demorealestate2.webnapps.net/storage/${imgData.path}`;
          setImage(url); setOriginalImage(url);
        }
      }
      setTimeout(() => setIsInitialLoad(false), 500);
    }
  }, [neighbourhood]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { state_id: state ? Number(state) : null, county_id: county ? Number(county) : null, city_id: city ? Number(city) : null, description, status };
    if (imageObject && (!originalImageObject || imageObject !== originalImageObject)) payload.images = imageObject;
    updateMutation.mutate({ id, data: payload }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["neighbourhoods"] });
        queryClient.invalidateQueries({ queryKey: ["neighbourhood", id] });
        router.push("/admin/neighbourhoods");
      },
      onError: (error: any) => {
        const d = error?.response?.data;
        let msg = d?.message || error?.message || "Failed to update.";
        if (d?.errors) { msg += "\n\nValidation Errors:\n" + Object.entries(d.errors).map(([f, m]: [string, any]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`).join("\n"); }
        alert(msg);
      },
    });
  };

  if (isLoading) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4"><div className="flex items-center gap-3 mb-6"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-7 w-48" /></div><Skeleton className="h-[500px] w-full rounded-2xl" /></div>);
  }

  if (isError || !neighbourhood) {
    return (<div className="px-6 lg:px-8 max-w-[1280px] mx-auto"><div className="bg-white rounded-2xl border border-slate-100 p-8 text-center"><p className="text-slate-500 mb-4">Neighbourhood not found.</p><Link href="/admin/neighbourhoods" className="text-emerald-600 hover:underline text-sm">Back to Neighbourhoods</Link></div></div>);
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/neighbourhoods/${id}`} className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition"><ArrowLeftIcon className="w-4 h-4" /></Link>
        <h1 className="text-[22px] font-semibold text-slate-900">Edit Neighbourhood</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center"><MapPinIcon className="w-5 h-5 text-emerald-600" /></div>
          <div><h2 className="text-base font-semibold text-slate-900">Neighbourhood Details</h2><p className="text-xs text-slate-500">Update neighbourhood information</p></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">State <span className="text-red-400">*</span></label>
            <select value={state} onChange={e => { setState(e.target.value); if (!isInitialLoad) { setCounty(""); setCity(""); } }} disabled={statesLoading}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition disabled:opacity-50">
              <option value="">{statesLoading ? "Loading..." : "Select state"}</option>
              {Array.isArray(statesList) && statesList.map((o: any, i: number) => (
                <option key={o.key || o.value || o.id || i} value={String(o.value || o.key || o.id)}>{o.text || o.name || o.title || o.label || "Unknown"}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">County <span className="text-red-400">*</span></label>
            <select value={county} onChange={e => { setCounty(e.target.value); if (!isInitialLoad) setCity(""); }} disabled={!state || countiesLoading}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition disabled:opacity-50">
              <option value="">{countiesLoading ? "Loading..." : "Select county"}</option>
              {Array.isArray(countiesList) && countiesList.map((o: any, i: number) => (
                <option key={o.key || o.value || o.id || i} value={String(o.value || o.key || o.id)}>{o.text || o.name || o.title || o.label || "Unknown"}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">City <span className="text-red-400">*</span></label>
            <select value={city} onChange={e => setCity(e.target.value)} disabled={!county || citiesLoading}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition disabled:opacity-50">
              <option value="">{citiesLoading ? "Loading..." : "Select city"}</option>
              {Array.isArray(citiesList) && citiesList.map((o: any, i: number) => (
                <option key={o.key || o.value || o.id || i} value={String(o.value || o.key || o.id)}>{o.text || o.name || o.title || o.label || "Unknown"}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe this neighbourhood..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Image</label>
          {image && !uploadingImage && (
            <div className="mb-3 relative inline-block">
              <img src={image} alt="Preview" className="max-h-48 rounded-xl border border-slate-200 object-cover" />
              <button type="button" onClick={() => { setImage(originalImage); setImageObject(originalImageObject); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-lg"><XMarkIcon className="w-4 h-4" /></button>
            </div>
          )}
          {uploadingImage && <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-600">Uploading image...</div>}
          {uploadSuccess && !uploadingImage && <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600">Image uploaded successfully!</div>}
          <label className={`flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed transition cursor-pointer ${uploadingImage ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30"}`}>
            <PhotoIcon className="w-7 h-7 text-slate-400 mb-1" />
            <span className="text-xs text-slate-500">{uploadingImage ? "Uploading..." : "Click to change image"}</span>
            <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} ref={fileInputRef}
              onChange={async (e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  setImageFile(file); setUploadingImage(true); setUploadSuccess(false);
                  const tmp = image; setImage(null);
                  try {
                    const obj = await uploadNeighbourhoodImage(file);
                    setImageObject(obj);
                    const url = obj.path.startsWith("http") ? obj.path : `https://demorealestate2.webnapps.net/image/local/xs/${obj.path}`;
                    setImage(url); setUploadSuccess(true); setTimeout(() => setUploadSuccess(false), 3000);
                  } catch (err: any) {
                    alert(err?.response?.data?.message || err?.message || "Failed to upload."); setImage(tmp); setImageObject(originalImageObject); setImageFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  } finally { setUploadingImage(false); }
                }
              }} />
          </label>
        </div>

        <div className="max-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={updateMutation.isPending}
            className="px-6 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors">
            {updateMutation.isPending ? "Updating..." : "Update Neighbourhood"}
          </button>
          <Link href={`/admin/neighbourhoods/${id}`} className="px-6 py-2.5 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}