"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useProfile,
  useUpdateProfile,
} from "@/services/profile/ProfileQueries";
import { uploadProfilePhoto } from "@/services/profile/ProfilePhotoUpload";
import { uploadCompanyLogo } from "@/services/profile/CompanyLogoUpload";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCitiesByCounty,
  useCountiesByState,
  useStates,
} from "@/services/location/LocationQueries";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  UserCircleIcon,
  BuildingOffice2Icon,
  InformationCircleIcon,
  PhotoIcon,
  ArrowPathIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  type PhoneValue = { code: string; number: string };

  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);
  const [profilePhotoError, setProfilePhotoError] = useState<string | null>(
    null,
  );
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const [county, setCounty] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyState, setCompanyState] = useState("");
  const [companyCounty, setCompanyCounty] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string>("");
  const companyLogoResultRef = useRef<any>(null); // holds the full ImageObject after upload
  const [companyLogoUploading, setCompanyLogoUploading] = useState(false);
  const [companyLogoError, setCompanyLogoError] = useState<string | null>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);
  const [aboutShort, setAboutShort] = useState("");
  const [aboutLong, setAboutLong] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [countyName, setCountyName] = useState("");
  const [cityName, setCityName] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [instagram, setInstagram] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const snapshotRef = useRef<any>(null);

  const profile = data?.data || data;

  const { data: statesData, isLoading: statesLoading } = useStates();
  const { data: countiesData, isLoading: countiesLoading } =
    useCountiesByState(state);
  const { data: citiesData, isLoading: citiesLoading } =
    useCitiesByCounty(county);
  const { data: companyCountiesData, isLoading: companyCountiesLoading } =
    useCountiesByState(companyState);
  const { data: companyCitiesData, isLoading: companyCitiesLoading } =
    useCitiesByCounty(companyCounty);

  const states = statesData?.data || statesData || [];
  const counties = countiesData?.data || countiesData || [];
  const cities = citiesData?.data || citiesData || [];
  const companyCounties =
    companyCountiesData?.data || companyCountiesData || [];
  const companyCities = companyCitiesData?.data || companyCitiesData || [];

  const getOptionLabel = (opts: any[], val: any) => {
    if (!Array.isArray(opts)) return val;
    const found = opts.find((o: any) => (o.id || o.value || o) == val);
    if (!found) return val;
    return found.name || found.title || found.label || found;
  };

  const formatPhone = (phoneData: any): string => {
    if (!phoneData) return "";
    if (typeof phoneData === "string") {
      if (phoneData.startsWith("{") && phoneData.includes('"code"')) {
        try {
          const p = JSON.parse(phoneData);
          if (p.code && p.number) return `${p.code} ${p.number}`;
        } catch (e) {
          return phoneData;
        }
      }
      return phoneData;
    }
    if (typeof phoneData === "object" && phoneData.code && phoneData.number)
      return `${phoneData.code} ${phoneData.number}`;
    return "";
  };

  const parsePhoneToObject = (phoneData: any): PhoneValue => {
    if (!phoneData) return { code: "", number: "" };

    if (typeof phoneData === "object") {
      return {
        code: String(phoneData.code || "").trim(),
        number: String(phoneData.number || "").trim(),
      };
    }

    if (typeof phoneData === "string") {
      const raw = phoneData.trim();
      if (!raw) return { code: "", number: "" };

      if (raw.startsWith("{") && raw.includes('"code"')) {
        try {
          const parsed = JSON.parse(raw);
          return {
            code: String(parsed?.code || "").trim(),
            number: String(parsed?.number || "").trim(),
          };
        } catch {
          return { code: "", number: raw };
        }
      }

      const m = raw.match(/^(\+\d[\d\s()-]*)\s+(.+)$/);
      if (m) {
        return { code: m[1].trim(), number: m[2].trim() };
      }

      return { code: "", number: raw };
    }

    return { code: "", number: "" };
  };

  const toPhoneInputValue = (phoneData: any): string => formatPhone(phoneData);

  const formatUSPhone = (value: string): string => {
    // Strip all non-digit characters
    let digits = value.replace(/\D/g, "");
    // Strip leading country code "1" if 11 digits
    if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
    digits = digits.slice(0, 10);
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  useEffect(() => {
    if (statesData) {
    }
  }, [statesData]);
  useEffect(() => {
    if (countiesData) {
    }
  }, [countiesData]);
  useEffect(() => {
    if (citiesData) {
    }
  }, [citiesData]);

  useEffect(() => {
    if (profile) {
      if (profile.photo) setProfilePhoto(profile.photo);
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(formatUSPhone(toPhoneInputValue(profile.mobile)));
      setCity(profile.city || "");
      setState(profile.state || "");
      setZip(profile.zip || "");
      setCountry(profile.country || "");
      setCounty(profile.country || "");

      // Address may be an object or a string
      if (profile.address && typeof profile.address === "object") {
        const addr = profile.address;
        const a1 = addr.address_1 || "";
        const a2 = addr.address_2 || "";
        setAddress1(a1);
        setAddress2(a2);
        setAddress(a2 ? `${a1}\n${a2}` : a1);

        setStateName(addr.state || profile.state || "");
        setCountyName(addr.county || profile.county || "");
        setCityName(addr.city || profile.city || "");
      } else {
        // legacy string address
        const addrStr = profile.address || "";
        setAddress(addrStr);
        const parts = addrStr
          .split(/\r?\n/)
          .map((s: string) => s.trim())
          .filter(Boolean);
        if (parts.length === 0) {
          setAddress1("");
          setAddress2("");
        } else if (parts.length === 1) {
          const commaParts = parts[0]
            .split(/,\s*/)
            .map((s: string) => s.trim())
            .filter(Boolean);
          setAddress1(commaParts[0] || "");
          setAddress2(commaParts[1] || "");
        } else {
          setAddress1(parts[0] || "");
          setAddress2(parts.slice(1).join(", ") || "");
        }
      }
      if (profile.social_urls) {
        setFacebook(profile.social_urls.facebook || "");
        setLinkedIn(profile.social_urls.linked_in || "");
        setInstagram(profile.social_urls.instagram || "");
      }

      // Company fields — API returns them flat at root level
      // Also support legacy nested profile.company object
      const comp = profile.company;
      setCompanyName(profile.company_name || comp?.name || "");
      setCompanyAddress(profile.company_address || comp?.address || "");
      setCompanyEmail(profile.company_email || comp?.email || "");
      setCompanyPhone(formatUSPhone(toPhoneInputValue(profile.company_phone || comp?.phone || "")));
      setCompanyWebsite(
        profile.company_website || profile.web || comp?.website || "",
      );
      if (comp?.location) {
        if (typeof comp.location === "object") {
          setCompanyState(comp.location.state || "");
          setCompanyCounty(comp.location.county || "");
          setCompanyCity(comp.location.city || "");
        } else if (typeof comp.location === "string") {
          setCompanyCity(comp.location);
        }
      }
      const logo = profile.company_logo || comp?.logo;
      if (logo) {
        if (typeof logo === "string") {
          setCompanyLogoPreview(logo);
          companyLogoResultRef.current = logo;
        } else if (typeof logo === "object") {
          const logoPath = logo.path || logo.url || "";
          setCompanyLogoPreview(logoPath);
          companyLogoResultRef.current = logo;
        }
      }

      // About fields — flat at root level
      setAboutShort(
        profile.short_description || profile.about?.short_description || "",
      );
      setAboutLong(
        profile.long_description ||
          profile.description ||
          profile.about?.long_description ||
          "",
      );
    }
  }, [profile]);

  const handleProfilePhotoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isEditing) return;
      const file = e.target.files?.[0];
      if (!file) return;
      setProfilePhotoFile(file);
      setProfilePhotoError(null);
      setProfilePhotoUploading(true);
      try {
        const result = await uploadProfilePhoto(file);
        if (result?.path) {
          setProfilePhoto(result.path);
            const payload = { ...buildPayload(), photo: Array.isArray(result) ? result : [result] };
          updateProfileMutation.mutate(payload, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ["profile"] });
              toast.success("Profile updated successfully");
            },
            onError: (error: any) => {
              setProfilePhotoError(
                error?.response?.data?.message ||
                  error?.message ||
                  "Failed to update profile with photo.",
              );
            },
          });
        }
      } catch (err: any) {
        setProfilePhotoError(err?.message || "Failed to upload photo");
      } finally {
        setProfilePhotoUploading(false);
      }
    },
    [
      name,
      phone,
      address,
      address1,
      address2,
      state,
      stateName,
      city,
      cityName,
      county,
      countyName,
      zip,
      country,
      facebook,
      linkedIn,
      instagram,
      companyLogoPreview,
      companyName,
      companyAddress,
      companyState,
      companyCounty,
      companyCity,
      companyEmail,
      companyPhone,
      companyWebsite,
      aboutShort,
      aboutLong,
      updateProfileMutation,
      queryClient,
      isEditing,
    ],
  );

  const handleCompanyLogoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isEditing) return;
      const file = e.target.files?.[0];
      if (!file) return;
      setCompanyLogoUploading(true);
      setCompanyLogoError(null);
      try {
        const result = await uploadCompanyLogo(file);
        if (!result?.path)
          throw new Error("Upload failed: no path returned from server");
        companyLogoResultRef.current = result;
        setCompanyLogoPreview(result.path);
        const payload = { ...buildPayload(), company_logo: result };
        updateProfileMutation.mutate(payload, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            toast.success("Company logo updated successfully");
          },
          onError: (error: any) => {
            const msg =
              error?.response?.data?.message ||
              error?.message ||
              "Failed to update profile with company logo.";
            setCompanyLogoError(msg);
            toast.error(msg);
          },
        });
      } catch (err: any) {
        const msg = err?.message || "Failed to upload logo";
        setCompanyLogoError(msg);
        toast.error(msg);
      } finally {
        setCompanyLogoUploading(false);
      }
    },
    [
      name,
      phone,
      address,
      address1,
      address2,
      state,
      stateName,
      city,
      cityName,
      county,
      countyName,
      zip,
      country,
      facebook,
      linkedIn,
      instagram,
      companyName,
      companyAddress,
      companyState,
      companyCounty,
      companyCity,
      companyEmail,
      companyPhone,
      companyWebsite,
      aboutShort,
      aboutLong,
      updateProfileMutation,
      queryClient,
      isEditing,
    ],
  );

  useEffect(() => {
    return () => {
      if (companyLogoPreview && companyLogoPreview.startsWith("blob:"))
        URL.revokeObjectURL(companyLogoPreview);
    };
  }, [companyLogoPreview]);

  const submitProfileUpdate = (onSuccess?: () => void) => {
    setError(null);
    const payload = buildPayload();
    updateProfileMutation.mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Profile updated successfully");
        onSuccess?.();
      },
      onError: (error: any) => {
        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to update profile.",
        );
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    submitProfileUpdate(() => setIsEditing(false));
  };

  const buildPayload = () => {
    const payload: any = {
      name,
      mobile: phone,
      address,
      state: state,
      city: city,
      county: county,
      zip,
      country,
      social_urls: {
        facebook,
        linked_in: linkedIn,
        instagram,
      },
      company: companyName,
      company_address: companyAddress,
      company_state: companyState,
      company_county: companyCounty,
      company_city: companyCity,
      company_email: companyEmail,
      company_phone: companyPhone,
      company_website: companyWebsite,
      short_description: aboutShort,
      long_description: aboutLong,
    };
    // include an address object that APIs may expect
    payload.address = {
      address_1: address1 || address,
      address_2: address2 || "",
      city: cityName || city,
      state: stateName || state,
      zipcode: zip,
      country: country || null,
      county: countyName || county,
    };
    if (companyLogoResultRef.current)
      payload.company_logo = companyLogoResultRef.current;
    return payload;
  };

  const startEdit = () => {
    snapshotRef.current = {
      name, phone, address, state, county, city,
      stateName, countyName, cityName, facebook, linkedIn, instagram,
      companyName, companyAddress, companyState, companyCounty, companyCity,
      companyEmail, companyPhone, companyWebsite,
      companyLogoPreview, companyLogoResult: companyLogoResultRef.current,
      aboutShort, aboutLong,
      profilePhoto,
    };
    setIsEditing(true);
  };

  const cancelEdit = () => {
    const s = snapshotRef.current;
    if (s) {
      setName(s.name || "");
      setPhone(s.phone || "");
      setAddress(s.address || "");
      setState(s.state || "");
      setCounty(s.county || "");
      setCity(s.city || "");
      setStateName(s.stateName || "");
      setCountyName(s.countyName || "");
      setCityName(s.cityName || "");
      setFacebook(s.facebook || "");
      setLinkedIn(s.linkedIn || "");
      setInstagram(s.instagram || "");
      setCompanyName(s.companyName || "");
      setCompanyAddress(s.companyAddress || "");
      setCompanyState(s.companyState || "");
      setCompanyCounty(s.companyCounty || "");
      setCompanyCity(s.companyCity || "");
      setCompanyEmail(s.companyEmail || "");
      setCompanyPhone(s.companyPhone || "");
      setCompanyWebsite(s.companyWebsite || "");
      setCompanyLogoPreview(s.companyLogoPreview || "");
      companyLogoResultRef.current = s.companyLogoResult || null;
      setAboutShort(s.aboutShort || "");
      setAboutLong(s.aboutLong || "");
      setProfilePhoto(s.profilePhoto || "");
      setProfilePhotoFile(null);
    }
    setIsEditing(false);
  };

  const labelCls = "block text-xs font-medium text-slate-700 mb-1.5";
  const inputCls =
    "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition placeholder:text-slate-400";
  const selectCls =
    "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition disabled:opacity-50";
  const renderSelect = (opts: any[], loading: boolean, placeholder: string) => {
    return (
      <>
        <option value="">{loading ? `Loading...` : placeholder}</option>
        {Array.isArray(opts) &&
          opts.map((o: any, i: number) => (
            <option key={o.id || i} value={o.id || o.value || o}>
              {o.name || o.title || o.label || o}
            </option>
          ))}
      </>
    );
  };

  const handleAddressChange = (val: string) => {
    setAddress(val);
    // split by newline first, then by comma if needed
    const parts = val
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) {
      setAddress1("");
      setAddress2("");
    } else if (parts.length === 1) {
      // further try comma split
      const commaParts = parts[0]
        .split(/,\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
      setAddress1(commaParts[0] || "");
      setAddress2(commaParts[1] || "");
    } else {
      setAddress1(parts[0] || "");
      setAddress2(parts.slice(1).join(", ") || "");
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-[200px] w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <p className="text-slate-500 mb-4">
            Failed to load profile data. Please try again later.
          </p>
          <Link
            href="/admin"
            className="text-emerald-600 hover:underline text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900">Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your personal and company information
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => submitProfileUpdate(() => setIsEditing(false))}
                disabled={updateProfileMutation.isPending}
                className="px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEdit}
              className="px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 mb-6">
        <div className="flex items-center mb-5">
          <div className="flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">
              Profile Photo
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={profilePhoto || "/images/nopic.jpg"}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-100"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.src.endsWith("/images/nopic.jpg"))
                  img.src = "/images/nopic.jpg";
              }}
            />
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              ref={profilePhotoInputRef}
              className="hidden"
              disabled={!isEditing}
              onChange={handleProfilePhotoChange}
            />
            <button
              type="button"
              onClick={() => profilePhotoInputRef.current?.click()}
              disabled={!isEditing || profilePhotoUploading}
              className="px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {profilePhotoUploading ? "Uploading..." : "Upload Photo"}
            </button>
            {profilePhotoError && (
              <p className="text-red-500 text-xs mt-2">{profilePhotoError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Settings Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 mb-6">
        <div className="flex items-center mb-5">
          <div className="flex items-center gap-2">
            <UserCircleIcon className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">
              Profile Settings
            </h3>
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className={labelCls}>Name</label>
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!isEditing}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                className={`${inputCls} bg-slate-50`}
                type="email"
                value={email}
                readOnly
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Mobile</label>
            <input
              className={inputCls}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatUSPhone(e.target.value))}
              readOnly={!isEditing}
              placeholder="(212) 555-0199"
            />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input
              className={inputCls}
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              readOnly={!isEditing}
              placeholder="Address line 1 (enter second line on new line)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
            <div>
              <label className={labelCls}>State</label>
              <select
                className={selectCls}
                value={state}
                onChange={(e) => {
                  const v = e.target.value;
                  setState(v);
                  setStateName(getOptionLabel(states, v));
                  setCounty("");
                  setCountyName("");
                  setCity("");
                  setCityName("");
                }}
                disabled={!isEditing || statesLoading}
              >
                {renderSelect(states, statesLoading, "Select state")}
              </select>
              {!statesLoading && (!states || states.length === 0) && (
                <p className="text-xs text-red-500 mt-1">
                  No states available.
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>County</label>
              <select
                className={selectCls}
                value={county}
                onChange={(e) => {
                  const v = e.target.value;
                  setCounty(v);
                  setCountyName(getOptionLabel(counties, v));
                  setCountry(v);
                  setCity("");
                  setCityName("");
                }}
                disabled={!isEditing || !state || countiesLoading}
              >
                {renderSelect(counties, countiesLoading, "Select county")}
              </select>
            </div>
            <div>
              <label className={labelCls}>City</label>
              <select
                className={selectCls}
                value={city}
                onChange={(e) => {
                  const v = e.target.value;
                  setCity(v);
                  setCityName(getOptionLabel(cities, v));
                }}
                disabled={!isEditing || !county || citiesLoading}
              >
                {renderSelect(cities, citiesLoading, "Select city")}
              </select>
            </div>
          </div>

          {/* Social Media */}
          <div className="pt-5 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-900 mb-4">
              Social Media Links
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              <div>
                <label className={labelCls}>Facebook URL</label>
                <input
                  className={inputCls}
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  readOnly={!isEditing}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <label className={labelCls}>LinkedIn URL</label>
                <input
                  className={inputCls}
                  type="url"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  readOnly={!isEditing}
                  placeholder="https://linkedin.com/in/profile"
                />
              </div>
              <div>
                <label className={labelCls}>Instagram URL</label>
                <input
                  className={inputCls}
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  readOnly={!isEditing}
                  placeholder="https://instagram.com/profile"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Link
              href={
                email
                  ? `/admin/reset-password?email=${encodeURIComponent(email)}`
                  : "/admin/reset-password"
              }
              className="ml-auto flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <KeyIcon className="w-4 h-4" /> Reset Password
            </Link>
          </div>
        </form>
      </div>

      {/* Company Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8 mb-6">
        <div className="flex items-center mb-5">
          <div className="flex items-center gap-2">
            <BuildingOffice2Icon className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Company Logo</label>
            <div className="flex items-center gap-4">
              <img
                src={(() => {
                  const val =
                    typeof profile?.company_photo === "string"
                      ? profile.company_photo
                      : companyLogoPreview;
                  if (!val) return "/images/nopic.jpg";
                  if (val.startsWith("http://") || val.startsWith("https://"))
                    return val;
                  return `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/image/local/md/${val}`;
                })()}
                alt="Company logo"
                className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.src.endsWith("/images/nopic.jpg"))
                    img.src = "/images/nopic.jpg";
                }}
              />
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={companyLogoInputRef}
                  className="hidden"
                  disabled={!isEditing}
                  onChange={handleCompanyLogoChange}
                />
                <button
                  type="button"
                  onClick={() => companyLogoInputRef.current?.click()}
                  disabled={!isEditing || companyLogoUploading}
                  className="px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  {companyLogoUploading ? "Uploading..." : "Upload Logo"}
                </button>
                {companyLogoError && (
                  <p className="text-red-500 text-xs mt-2">
                    {companyLogoError}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className={labelCls}>Company Name</label>
              <input
                className={inputCls}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                readOnly={!isEditing}
                placeholder="Company name"
              />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input
                className={inputCls}
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                readOnly={!isEditing}
                placeholder="Company address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
            <div>
              <label className={labelCls}>State</label>
              <select
                className={selectCls}
                value={companyState}
                onChange={(e) => {
                  setCompanyState(e.target.value);
                  setCompanyCounty("");
                  setCompanyCity("");
                }}
                disabled={!isEditing || statesLoading}
              >
                {renderSelect(states, statesLoading, "Select state")}
              </select>
              {!statesLoading && (!states || states.length === 0) && (
                <p className="text-xs text-red-500 mt-1">
                  No states available.
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>County</label>
              <select
                className={selectCls}
                value={companyCounty}
                onChange={(e) => {
                  setCompanyCounty(e.target.value);
                  setCompanyCity("");
                }}
                disabled={!isEditing || !companyState || companyCountiesLoading}
              >
                {renderSelect(
                  companyCounties,
                  companyCountiesLoading,
                  "Select county",
                )}
              </select>
            </div>
            <div>
              <label className={labelCls}>City</label>
              <select
                className={selectCls}
                value={companyCity}
                onChange={(e) => setCompanyCity(e.target.value)}
                disabled={!isEditing || !companyCounty || companyCitiesLoading}
              >
                {renderSelect(
                  companyCities,
                  companyCitiesLoading,
                  "Select city",
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
            <div>
              <label className={labelCls}>Company Email</label>
              <input
                className={inputCls}
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                readOnly={!isEditing}
                placeholder="company@email.com"
              />
            </div>
            <div>
              <label className={labelCls}>Company Phone</label>
              <input
                className={inputCls}
                type="tel"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(formatUSPhone(e.target.value))}
                readOnly={!isEditing}
                placeholder="(212) 555-0199"
              />
            </div>
            <div>
              <label className={labelCls}>Website</label>
              <input
                className={inputCls}
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                readOnly={!isEditing}
                placeholder="https://company.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
        <div className="flex items-center mb-5">
          <div className="flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">About</h3>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Short Description</label>
            <textarea
              className={`${inputCls} min-h-[80px]`}
              value={aboutShort}
              onChange={(e) => setAboutShort(e.target.value)}
              readOnly={!isEditing}
              placeholder="Short summary"
            />
          </div>
          <div>
            <label className={labelCls}>Long Description</label>
            <textarea
              className={`${inputCls} min-h-[140px]`}
              value={aboutLong}
              onChange={(e) => setAboutLong(e.target.value)}
              readOnly={!isEditing}
              placeholder="Detailed description"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
