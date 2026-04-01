"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNeighbourhood } from "@/services/neighbourhood/NeighbourhoodServices";
import { uploadNeighbourhoodImage, ImageObject } from "@/services/neighbourhood/NeighbourhoodUpload";
import { useStates, useCountiesByState, useCitiesByCounty } from "@/services/location/LocationQueries";
import { ArrowLeftIcon, MapPinIcon, PhotoIcon } from "@heroicons/react/24/outline";

export default function NeighbourhoodCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [state, setState] = useState("");
  const [county, setCounty] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageObject, setImageObject] = useState<ImageObject | null>(null);
  const [status, setStatus] = useState("active");
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: statesData, isLoading: statesLoading } = useStates();
  const { data: countiesData, isLoading: countiesLoading } = useCountiesByState(state);
  const { data: citiesData, isLoading: citiesLoading } = useCitiesByCounty(county);

  const states = statesData?.data || statesData || [];
  const counties = countiesData?.data || countiesData || [];
  const cities = citiesData?.data || citiesData || [];

  useEffect(() => { setCounty(""); setCity(""); }, [state]);
  useEffect(() => { setCity(""); }, [county]);

  const createNeighbourhoodMutation = useMutation({
    mutationFn: (data: object) => createNeighbourhood(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["neighbourhoods"] });
      router.push("/admin/neighbourhoods");
    },
    onError: (error: any) => {
      const errorData = error?.response?.data;
      let msg = errorData?.message || error?.message || "Failed to create neighbourhood.";
      if (errorData?.errors) {
        const vErrors = Object.entries(errorData.errors).map(([f, m]: [string, any]) => `${f}: ${Array.isArray(m) ? m.join(", ") : m}`).join("\n");
        msg += "\n\nValidation Errors:\n" + vErrors;
      }
      alert(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state) { alert("Please select a state"); return; }
    if (!county) { alert("Please select a county"); return; }
    if (!city) { alert("Please select a city"); return; }
    if (!imageObject) { alert("Please upload an image"); return; }

    const payload: any = { region_id: state, county_id: county, city_id: city, description, status };
    if (imageObject) payload.images = imageObject;
    createNeighbourhoodMutation.mutate(payload);
  };

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/neighbourhoods" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition">
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
        <h1 className="text-[22px] font-semibold text-slate-900">Add Neighbourhood</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center"><MapPinIcon className="w-5 h-5 text-emerald-600" /></div>
          <div><h2 className="text-base font-semibold text-slate-900">Neighbourhood Details</h2><p className="text-xs text-slate-500">Add a new neighbourhood with location and image</p></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">State <span className="text-red-400">*</span></label>
            <select value={state} onChange={e => setState(e.target.value)} disabled={statesLoading}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition disabled:opacity-50">
              <option value="">{statesLoading ? "Loading states..." : "Select state"}</option>
              {Array.isArray(states) && states.map((o: any, i: number) => (
                <option key={o.id || i} value={o.id || o.value || o}>{o.name || o.title || o.label || o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">County <span className="text-red-400">*</span></label>
            <select value={county} onChange={e => setCounty(e.target.value)} disabled={!state || countiesLoading}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition disabled:opacity-50">
              <option value="">{countiesLoading ? "Loading counties..." : "Select county"}</option>
              {Array.isArray(counties) && counties.map((o: any, i: number) => (
                <option key={o.id || i} value={o.id || o.value || o}>{o.name || o.title || o.label || o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">City <span className="text-red-400">*</span></label>
            <select value={city} onChange={e => setCity(e.target.value)} disabled={!county || citiesLoading}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition disabled:opacity-50">
              <option value="">{citiesLoading ? "Loading cities..." : "Select city"}</option>
              {Array.isArray(cities) && cities.map((o: any, i: number) => (
                <option key={o.id || i} value={o.id || o.value || o}>{o.name || o.title || o.label || o}</option>
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
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Image <span className="text-red-400">*</span></label>
          {image && (
            <div className="mb-3 relative inline-block">
              <img src={image} alt="Preview" className="max-h-48 rounded-xl border border-slate-200 object-cover" />
            </div>
          )}
          <label className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition cursor-pointer ${uploadingImage ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30"}`}>
            <PhotoIcon className="w-8 h-8 text-slate-400 mb-1" />
            <span className="text-sm text-slate-500">{uploadingImage ? "Uploading..." : "Click to upload image"}</span>
            <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
              onChange={async (e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  setImageFile(file);
                  setUploadingImage(true);
                  const reader = new FileReader();
                  reader.onloadend = () => setImage(reader.result as string);
                  reader.readAsDataURL(file);
                  try {
                    const obj = await uploadNeighbourhoodImage(file);
                    setImageObject(obj);
                    const url = obj.path.startsWith("http") ? obj.path : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/image/local/original/${obj.path}`;
                    setImage(url);
                  } catch (err: any) {
                    alert(err?.response?.data?.message || err?.message || "Failed to upload image.");
                    setImage(""); setImageFile(null); setImageObject(null);
                    if (e.target) e.target.value = "";
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
          <button type="submit" disabled={createNeighbourhoodMutation.isPending}
            className="px-6 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors">
            {createNeighbourhoodMutation.isPending ? "Creating..." : "Create Neighbourhood"}
          </button>
          <Link href="/admin/neighbourhoods" className="px-6 py-2.5 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}