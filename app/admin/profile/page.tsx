"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

export default function ProfilePage() {
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    // const [city, setCity] = useState('');
    const [profilePhoto, setProfilePhoto] = useState<string>("");
    const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
    const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);
    const [profilePhotoError, setProfilePhotoError] = useState<string | null>(null);
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
    const [companyLogoUploading, setCompanyLogoUploading] = useState(false);
    const [companyLogoError, setCompanyLogoError] = useState<string | null>(null);
    const companyLogoInputRef = useRef<HTMLInputElement>(null);
    const [aboutShort, setAboutShort] = useState("");
    const [aboutLong, setAboutLong] = useState("");
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
    const [zip, setZip] = useState("");
    const [country, setCountry] = useState("");
    const [facebook, setFacebook] = useState("");
    const [linkedIn, setLinkedIn] = useState("");
    const [instagram, setInstagram] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Profile photo upload handler
    const handleProfilePhotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setProfilePhotoFile(file);
      setProfilePhotoError(null);
      setProfilePhotoUploading(true);
      try {
        const result = await uploadProfilePhoto(file);
        if (result?.path) {
          setProfilePhoto(result.path);
          // Call profile update API with new photo object
          const payload = {
            name,
            company_logo: companyLogoPreview,
            company: companyName,
            company_email: companyEmail,
            company_phone: companyPhone,
            short_description: aboutShort,
            long_description: aboutLong,
            photo: result,
          };
          updateProfileMutation.mutate(payload, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ["profile"] });
              toast.success("Profile updated successfully");
            },
            onError: (error: any) => {
              setProfilePhotoError(error?.response?.data?.message || error?.message || "Failed to update profile with photo.");
            },
          });
        }
      } catch (err: any) {
        setProfilePhotoError(err?.message || "Failed to upload photo");
      } finally {
        setProfilePhotoUploading(false);
      }
    }, [name, companyLogoPreview, companyName, companyEmail, companyPhone, aboutShort, aboutLong, updateProfileMutation, queryClient]);

  // Helper function to format phone number
  const formatPhone = (phoneData: any): string => {
    if (!phoneData) return "";

    // If it's already a properly formatted string (not JSON), return it
    if (typeof phoneData === "string") {
      // Check if it's a stringified JSON object
      if (phoneData.startsWith("{") && phoneData.includes('"code"')) {
        try {
          const parsed = JSON.parse(phoneData);
          if (parsed.code && parsed.number) {
            return `${parsed.code} ${parsed.number}`;
          }
        } catch (e) {
          console.error("Failed to parse phone JSON:", e);
          return phoneData; // Return as is if parsing fails
        }
      }
      return phoneData;
    }

    // If it's an object
    if (typeof phoneData === "object" && phoneData.code && phoneData.number) {
      return `${phoneData.code} ${phoneData.number}`;
    }

    return "";
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
  const states = statesData?.data || statesData || [];
  const counties = countiesData?.data || countiesData || [];
  const cities = citiesData?.data || citiesData || [];
  const companyCounties =
    companyCountiesData?.data || companyCountiesData || [];
  const companyCities = companyCitiesData?.data || companyCitiesData || [];
  // Update form fields when profile data loads
  useEffect(() => {
    if (profile) {
      if (profile.photo) {
        setProfilePhoto(profile.photo);
      }
      console.log(
        "Profile phone data:",
        profile.phone,
        "Type:",
        typeof profile.phone,
      );

      setName(profile.name || "");
      setEmail(profile.email || "");

      // Handle phone using helper function
      const formattedPhone = formatPhone(profile.phone);
      console.log("Formatted phone:", formattedPhone);
      setPhone(formattedPhone);

      setAddress(profile.address || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setZip(profile.zip || "");
      setCountry(profile.country || "");
      setCounty(profile.country || "");

      // Load social URLs
      if (profile.social_urls) {
        setFacebook(profile.social_urls.facebook || "");
        setLinkedIn(profile.social_urls.linked_in || "");
        setInstagram(profile.social_urls.instagram || "");
      }

      if (profile.company) {
        setCompanyName(profile.company.name || "");
        setCompanyAddress(profile.company.address || "");
        if (profile.company.location) {
          if (typeof profile.company.location === "object") {
            setCompanyState(profile.company.location.state || "");
            setCompanyCounty(profile.company.location.county || "");
            setCompanyCity(profile.company.location.city || "");
          } else if (typeof profile.company.location === "string") {
            setCompanyCity(profile.company.location);
          }
        }
        setCompanyEmail(profile.company.email || "");
        setCompanyPhone(profile.company.phone || "");
        setCompanyWebsite(profile.company.website || "");
        if (profile.company.logo) {
          if (typeof profile.company.logo === 'string') {
            setCompanyLogoPreview(profile.company.logo);
          } else if (typeof profile.company.logo === 'object') {
            if (profile.company.logo.path) {
              setCompanyLogoPreview(profile.company.logo.path);
            } else if (profile.company.logo.url) {
              setCompanyLogoPreview(profile.company.logo.url);
            }
          }
        }
      }

      if (profile.about) {
        setAboutShort(profile.about.short_description || "");
        setAboutLong(profile.about.long_description || "");
      }
    }
  }, [profile]);

  const handleCompanyLogoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompanyLogoUploading(true);
    setCompanyLogoError(null);
    try {
      const result = await uploadCompanyLogo(file);
      // Send the full object as company_logo in the payload
      if (result && result.path) {
        setCompanyLogoPreview(result.path);
        const payload = {
          name,
          company_logo: result,
          company: companyName,
          company_email: companyEmail,
          company_phone: companyPhone,
          short_description: aboutShort,
          long_description: aboutLong,
        };
        updateProfileMutation.mutate(payload, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
          },
          onError: (error: any) => {
            setCompanyLogoError(error?.response?.data?.message || error?.message || "Failed to update profile with company logo.");
          },
        });
      }
    } catch (err: any) {
      setCompanyLogoError(err?.message || "Failed to upload logo");
    } finally {
      setCompanyLogoUploading(false);
    }
  }, [name, companyName, companyEmail, companyPhone, aboutShort, aboutLong, updateProfileMutation, queryClient]);

  useEffect(() => {
    return () => {
      if (companyLogoPreview && companyLogoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(companyLogoPreview);
      }
    };
  }, [companyLogoPreview]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Only include company_logo if it was just uploaded (i.e., companyLogoPreview is a new upload result)
    const payload: any = {
      name,
      company: companyName,
      company_email: companyEmail,
      company_phone: companyPhone,
      short_description: aboutShort,
      long_description: aboutLong,
    };
    // If companyLogoPreview is an object (from upload), include it
    if (
      typeof companyLogoPreview === 'object' &&
      companyLogoPreview !== null &&
      'path' in (companyLogoPreview as any)
    ) {
      payload.company_logo = companyLogoPreview;
    }
    console.log(payload);
    updateProfileMutation.mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Profile updated successfully");
      },
      onError: (error: any) => {
        console.error("Error updating profile:", error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile. Please try again.";
        setError(errorMessage);
      },
    });
  };

  const handleUpdateClick = () => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">
              Failed to load profile data. Please try again later.
            </div>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      {/* Profile Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Upload your profile photo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <img
                src={profilePhoto ? profilePhoto : "/images/nopic.png"}
                alt="Profile"
                className="h-20 w-20 border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/nopic.png";
                }}
              />
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                ref={profilePhotoInputRef}
                style={{ display: "none" }}
                onChange={handleProfilePhotoChange}
              />
              <Button
                type="button"
                onClick={() => profilePhotoInputRef.current?.click()}
                disabled={profilePhotoUploading}
              >
                {profilePhotoUploading ? "Uploading..." : "Upload Photo"}
              </Button>
              {profilePhotoError && (
                <div className="text-red-500 text-xs mt-2">{profilePhotoError}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} readOnly />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formatPhone(phone)}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 1234567890"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setState(selectedId);
                    // Reset county and city when state changes
                    setCounty("");
                    setCity("");
                  }}
                  disabled={statesLoading}
                  className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
                  style={{ border: "1px solid #e5e5e5", minHeight: "37px" }}
                >
                  <option value="">
                    {statesLoading ? "Loading states..." : "Select state"}
                  </option>
                  {Array.isArray(states) &&
                    states.map((stateOption: any, index: number) => {
                      // Debug: log each state option structure
                      return (
                        <option
                          key={stateOption.id || index}
                          value={
                            stateOption.id || stateOption.value || stateOption
                          }
                        >
                          {stateOption.name ||
                            stateOption.title ||
                            stateOption.label ||
                            stateOption}
                        </option>
                      );
                    })}
                </select>
                {!statesLoading && (!states || states.length === 0) && (
                  <p className="text-xs text-red-500 mt-1">
                    No states available. Check console for API response.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="county">County</Label>
                <select
                  id="county"
                  value={county}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setCounty(selectedId);
                    setCountry(selectedId);
                    // Reset city when county changes
                    setCity("");
                  }}
                  disabled={!state || countiesLoading}
                  className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
                  style={{ border: "1px solid #e5e5e5", minHeight: "37px" }}
                >
                  <option value="">
                    {countiesLoading ? "Loading counties..." : "Select county"}
                  </option>
                  {Array.isArray(counties) &&
                    counties.map((countyOption: any, index: number) => {
                      return (
                        <option
                          key={countyOption.id || index}
                          value={
                            countyOption.id ||
                            countyOption.value ||
                            countyOption
                          }
                        >
                          {countyOption.name ||
                            countyOption.title ||
                            countyOption.label ||
                            countyOption}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setCity(selectedId);
                  }}
                  disabled={!county || citiesLoading}
                  className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
                  style={{ border: "1px solid #e5e5e5", minHeight: "37px" }}
                >
                  <option value="">
                    {citiesLoading ? "Loading cities..." : "Select city"}
                  </option>
                  {Array.isArray(cities) &&
                    cities.map((cityOption: any, index: number) => {
                      return (
                        <option
                          key={cityOption.id || index}
                          value={
                            cityOption.id || cityOption.value || cityOption
                          }
                        >
                          {cityOption.name ||
                            cityOption.title ||
                            cityOption.label ||
                            cityOption}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>

            {/* <div>
              <Label htmlFor="zip">Zip Code</Label>
              <Input
                id="zip"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </div> */}

            {/* Social Media URLs */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Social Media Links</h3>

              <div>
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://www.facebook.com/yourpage"
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  placeholder="https://www.linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://www.instagram.com/yourprofile"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending
                    ? "Updating..."
                    : "Update Profile"}
                </Button>
                <Button asChild variant="secondary" type="button">
                  <Link href="/admin">Cancel</Link>
                </Button>
              </div>
              <Button
                asChild
                variant="outline"
                type="button"
                className="sm:ml-auto"
              >
                <Link
                  href={
                    email
                      ? `/admin/reset-password?email=${encodeURIComponent(email)}`
                      : "/admin/reset-password"
                  }
                >
                  Reset password
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company</CardTitle>
          <CardDescription>Company details and branding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="company_logo">Company Logo </Label>
              <input
                id="company_logo"
                type="file"
                accept="image/*"
                ref={companyLogoInputRef}
                style={{ display: "none" }}
                onChange={handleCompanyLogoChange}
              />
              <Button
                type="button"
                onClick={() => companyLogoInputRef.current?.click()}
                disabled={companyLogoUploading}
              >
                {companyLogoUploading ? "Uploading..." : "Upload Logo"}
              </Button>
              {companyLogoError && (
                <div className="text-red-500 text-xs mt-2">{companyLogoError}</div>
              )}
              <div className="mt-3">
                <img
                  src={(() => {
                    const val = typeof profile?.company_logo === 'string' ? profile.company_logo : companyLogoPreview;
                    if (!val) return "/images/nopic.png";
                    if (val.startsWith("http://") || val.startsWith("https://")) return val;
                    // Prepend base URL for relative path
                    return `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/image/local/md/${val}`;
                  })()}
                  alt="Company logo preview"
                  className="h-20 w-20 border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/nopic.png";
                  }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company name"
              />
            </div>

            <div>
              <Label htmlFor="company_address">Address</Label>
              <Input
                id="company_address"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Company address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="company_state">State</Label>
                <select
                  id="company_state"
                  value={companyState}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setCompanyState(selectedId);
                    setCompanyCounty("");
                    setCompanyCity("");
                  }}
                  disabled={statesLoading}
                  className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
                  style={{ border: "1px solid #e5e5e5", minHeight: "37px" }}
                >
                  <option value="">
                    {statesLoading ? "Loading states..." : "Select state"}
                  </option>
                  {Array.isArray(states) &&
                    states.map((stateOption: any, index: number) => (
                      <option
                        key={stateOption.id || index}
                        value={
                          stateOption.id || stateOption.value || stateOption
                        }
                      >
                        {stateOption.name ||
                          stateOption.title ||
                          stateOption.label ||
                          stateOption}
                      </option>
                    ))}
                </select>
                {!statesLoading && (!states || states.length === 0) && (
                  <p className="text-xs text-red-500 mt-1">
                    No states available. Check console for API response.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="company_county">County</Label>
                <select
                  id="company_county"
                  value={companyCounty}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setCompanyCounty(selectedId);
                    setCompanyCity("");
                  }}
                  disabled={!companyState || companyCountiesLoading}
                  className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
                  style={{ border: "1px solid #e5e5e5", minHeight: "37px" }}
                >
                  <option value="">
                    {companyCountiesLoading
                      ? "Loading counties..."
                      : "Select county"}
                  </option>
                  {Array.isArray(companyCounties) &&
                    companyCounties.map((countyOption: any, index: number) => (
                      <option
                        key={countyOption.id || index}
                        value={
                          countyOption.id || countyOption.value || countyOption
                        }
                      >
                        {countyOption.name ||
                          countyOption.title ||
                          countyOption.label ||
                          countyOption}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <Label htmlFor="company_city">City</Label>
                <select
                  id="company_city"
                  value={companyCity}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setCompanyCity(selectedId);
                  }}
                  disabled={!companyCounty || companyCitiesLoading}
                  className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
                  style={{ border: "1px solid #e5e5e5", minHeight: "37px" }}
                >
                  <option value="">
                    {companyCitiesLoading ? "Loading cities..." : "Select city"}
                  </option>
                  {Array.isArray(companyCities) &&
                    companyCities.map((cityOption: any, index: number) => (
                      <option
                        key={cityOption.id || index}
                        value={cityOption.id || cityOption.value || cityOption}
                      >
                        {cityOption.name ||
                          cityOption.title ||
                          cityOption.label ||
                          cityOption}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="company_email">Company Email</Label>
                <Input
                  id="company_email"
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="company@email.com"
                />
              </div>
              <div>
                <Label htmlFor="company_phone">Company Phone</Label>
                <Input
                  id="company_phone"
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="+971 1234567890"
                />
              </div>
              <div>
                <Label htmlFor="company_website">Website</Label>
                <Input
                  id="company_website"
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://company.com"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center pt-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleUpdateClick}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Updating..." : "Update"}
                </Button>
                <Button asChild variant="secondary" type="button">
                  <Link href="/admin">Cancel</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Describe your company and services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="about_short">Short Description</Label>
              <textarea
                id="about_short"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={aboutShort}
                onChange={(e) => setAboutShort(e.target.value)}
                placeholder="Short summary"
              />
            </div>
            <div>
              <Label htmlFor="about_long">Long Description</Label>
              <textarea
                id="about_long"
                className="w-full min-h-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={aboutLong}
                onChange={(e) => setAboutLong(e.target.value)}
                placeholder="Detailed description"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center pt-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleUpdateClick}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Updating..." : "Update"}
                </Button>
                <Button asChild variant="secondary" type="button">
                  <Link href="/admin">Cancel</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
