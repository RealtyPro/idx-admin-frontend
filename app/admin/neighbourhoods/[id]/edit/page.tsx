"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useSingleNeighbourhood, useUpdateNeighbourhood } from '@/services/neighbourhood/NeighbourhoodQueries';
import { useQueryClient } from '@tanstack/react-query';
import { uploadNeighbourhoodImage, ImageObject } from '@/services/neighbourhood/NeighbourhoodUpload';
import { useStates, useCountiesByState, useCitiesByCounty } from '@/services/location/LocationQueries';

export default function NeighbourhoodEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  // Check for authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [router]);
  
  const { data, isLoading, isError } = useSingleNeighbourhood(id);
  const neighbourhood = data?.data || data;
  
  const updateNeighbourhoodMutation = useUpdateNeighbourhood();

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch location options dynamically
  const { data: statesData, isLoading: statesLoading } = useStates();
  const { data: countiesData, isLoading: countiesLoading } = useCountiesByState(state ? String(state) : "");
  const { data: citiesData, isLoading: citiesLoading } = useCitiesByCounty(county ? String(county) : "");

  const states = statesData?.data || statesData || [];
  const counties = countiesData?.data || countiesData || [];
  const cities = citiesData?.data || citiesData || [];

  // Debug: Log available options
  useEffect(() => {
    console.log('States available:', states.length, states.slice(0, 3));
    if (states.length > 0) {
      console.log('Sample state IDs:', states.slice(0, 5).map((s: any) => ({ id: s.key, name: s.name })));
    }
    console.log('Counties available:', counties.length, counties.slice(0, 3));
    if (counties.length > 0) {
      console.log('Sample county IDs:', counties.slice(0, 5).map((c: any) => ({ id: c.key, name: c.name })));
    }
    console.log('Cities available:', cities.length, cities.slice(0, 3));
    if (cities.length > 0) {
      console.log('Sample city IDs:', cities.slice(0, 5).map((c: any) => ({ id: c.key, name: c.name })));
    }
  }, [states, counties, cities]);

  // Update form fields when neighbourhood data loads
  useEffect(() => {
    if (neighbourhood) {
      console.log('Loading neighbourhood data:', neighbourhood);
      
      // Extract state/region ID - try multiple possible field names
      const stateId = neighbourhood.state_id;
      const countyId = neighbourhood.county_id;
      const cityId = neighbourhood.city_id;
      
      console.log('Extracted IDs from API:', { stateId, countyId, cityId });
      
      // Convert to strings to match select option values
      setState(stateId ? String(stateId) : "");
      setCounty(countyId ? String(countyId) : "");
      setCity(cityId ? String(cityId) : "");
      setDescription(neighbourhood.description || '');
      setStatus(neighbourhood.status || 'active');
      
      // Handle image - could be a path string or image object
      // API uses 'images' field, but check 'image' for backwards compatibility
      const imageData = neighbourhood.images || neighbourhood.image;
      
      if (imageData) {
        console.log('Loading image:', imageData);
        if (typeof imageData === 'string') {
          // Check if it's a default placeholder image
          const isDefaultImage = imageData.includes('/img/default/') || imageData.includes('default');
          
          const imageUrl = imageData.startsWith('http')
            ? imageData
            : `https://demorealestate2.webnapps.net/storage/${imageData}`;
          setImage(imageUrl);
          
          // Only set originalImage if it's not a default image
          // This allows proper replacement when uploading a new image
          if (!isDefaultImage) {
            setOriginalImage(imageUrl);
          }
        } else if (imageData && typeof imageData === 'object') {
          // Store the image object
          setImageObject(imageData as ImageObject);
          setOriginalImageObject(imageData as ImageObject);
          
          // Set preview URL
          const imageUrl = imageData.path?.startsWith('http') 
            ? imageData.path 
            : `https://demorealestate2.webnapps.net/storage/${imageData.path}`;
          setImage(imageUrl);
          setOriginalImage(imageUrl);
        }
      }
      
      // Mark initial load as complete after a short delay to allow cascading loads
      setTimeout(() => setIsInitialLoad(false), 500);
    }
  }, [neighbourhood]);

  // Debug: Log state values when they change
  useEffect(() => {
    console.log('Current form values:', { state, county, city });
    console.log('State type:', typeof state, 'County type:', typeof county, 'City type:', typeof city);
    
    // Check if current values exist in options
    if (state && states.length > 0) {
      const stateExists = states.find((s: any) => String(s.id) === String(state));
      console.log('State value exists in options?', !!stateExists, 'Looking for:', state);
    }
    if (county && counties.length > 0) {
      const countyExists = counties.find((c: any) => String(c.id) === String(county));
      console.log('County value exists in options?', !!countyExists, 'Looking for:', county);
    }
    if (city && cities.length > 0) {
      const cityExists = cities.find((c: any) => String(c.id) === String(city));
      console.log('City value exists in options?', !!cityExists, 'Looking for:', city);
    }
  }, [state, county, city, states, counties, cities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      state_id: state ? Number(state) : null,      // Send state ID as region_id
      county_id: county ? Number(county) : null,     // Send county ID as county_id
      city_id: city ? Number(city) : null,         // Send city ID as city_id
      description,
      status
    };

    // Include image if:
    // 1. A new image was uploaded (imageObject exists and is different from original)
    // 2. Original had no image object (was a string/default) and now we have one
    if (imageObject) {
      if (!originalImageObject || imageObject !== originalImageObject) {
        payload.images = imageObject;  // API expects 'images' not 'image'
        console.log('Including updated image in payload:', imageObject);
      }
    }

    console.log('Updating neighbourhood payload:', payload);

    updateNeighbourhoodMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['neighbourhoods'] });
          queryClient.invalidateQueries({ queryKey: ['neighbourhood', id] });
          alert("Neighbourhood updated successfully");
          router.push("/admin/neighbourhoods");
        },
        onError: (error: any) => {
          console.error("Error updating neighbourhood:", error);
          console.error("Error response data:", error?.response?.data);
          console.error("Validation errors:", error?.response?.data?.errors);
          
          // Show detailed error message
          const errorData = error?.response?.data;
          let errorMessage = errorData?.message || error?.message || "Failed to update neighbourhood.";
          
          // If there are validation errors, show them
          if (errorData?.errors) {
            const validationErrors = Object.entries(errorData.errors)
              .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('\n');
            errorMessage += '\n\nValidation Errors:\n' + validationErrors;
          }
          
          alert(errorMessage);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl mt-4" />
      </div>
    );
  }

  if (isError || !neighbourhood) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Neighbourhood Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">The neighbourhood you are looking for does not exist.</div>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin/neighbourhoods">Back to Neighbourhoods</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Edit Neighbourhood</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/neighbourhoods/${id}`}>Back</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="state">State</Label>
              <select
                id="state"
                value={state}
                onChange={e => {
                  setState(e.target.value);
                  // Only reset county and city if not during initial load
                  if (!isInitialLoad) {
                    setCounty("");
                    setCity("");
                  }
                }}
                disabled={statesLoading}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
                style={{ border: '1px solid #e5e5e5', minHeight: '37px' }}
              >
                <option value="">{statesLoading ? 'Loading states...' : 'Select state'}</option>
                {Array.isArray(states) && states.map((stateOption: any, index: number) => (
                  <option 
                    key={stateOption.key || stateOption.value || stateOption.id || index} 
                    value={String(stateOption.value || stateOption.key || stateOption.id)}
                  >
                    {stateOption.text || stateOption.name || stateOption.title || stateOption.label || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="county">County</Label>
              <select
                id="county"
                value={county}
                onChange={e => {
                  setCounty(e.target.value);
                  // Only reset city if not during initial load
                  if (!isInitialLoad) {
                    setCity("");
                  }
                }}
                disabled={!state || countiesLoading}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
                style={{ border: '1px solid #e5e5e5', minHeight: '37px' }}
              >
                <option value="">{countiesLoading ? 'Loading counties...' : 'Select county'}</option>
                {Array.isArray(counties) && counties.map((countyOption: any, index: number) => (
                  <option 
                    key={countyOption.key || countyOption.value || countyOption.id || index} 
                    value={String(countyOption.value || countyOption.key || countyOption.id)}
                  >
                    {countyOption.text || countyOption.name || countyOption.title || countyOption.label || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <select
                id="city"
                value={city}
                onChange={e => setCity(e.target.value)}
                disabled={!county || citiesLoading}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
                style={{ border: '1px solid #e5e5e5', minHeight: '37px' }}
              >
                <option value="">{citiesLoading ? 'Loading cities...' : 'Select city'}</option>
                {Array.isArray(cities) && cities.map((cityOption: any, index: number) => (
                  <option 
                    key={cityOption.key || cityOption.value || cityOption.id || index} 
                    value={String(cityOption.value || cityOption.key || cityOption.id)}
                  >
                    {cityOption.text || cityOption.name || cityOption.title || cityOption.label || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description" 
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
            </div>

            <div>
              <Label htmlFor="image">Image</Label>
              <input
                id="image"
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    setImageFile(file);
                    setUploadingImage(true);
                    setUploadSuccess(false);
                    
                    // Hide preview during upload
                    const tempImage = image;
                    setImage(null);
                    
                    try {
                      // Upload the image and get the image object
                      const uploadedImageObj = await uploadNeighbourhoodImage(file);
                      console.log("Uploaded image object:", uploadedImageObj);
                      setImageObject(uploadedImageObj);
                      
                      // Set preview image URL
                      const previewUrl = uploadedImageObj.path.startsWith('http') 
                        ? uploadedImageObj.path 
                        : `https://demorealestate2.webnapps.net/image/local/xs/${uploadedImageObj.path}`;
                      
                      console.log("Setting preview URL:", previewUrl);
                      setImage(previewUrl);
                      setUploadSuccess(true);
                      
                      // Remove success message after 3 seconds
                      setTimeout(() => setUploadSuccess(false), 3000);
                    } catch (error: any) {
                      console.error("Error uploading image:", error);
                      const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload image. Please try again.";
                      alert(errorMessage);
                      // Reset preview if upload fails
                      setImage(tempImage);
                      setImageObject(originalImageObject);
                      setImageFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    } finally {
                      setUploadingImage(false);
                    }
                  }
                }}
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
                    alt="Neighbourhood preview" 
                    className="max-h-64 max-w-full rounded-lg shadow-md object-cover border border-gray-200" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(originalImage);
                      setImageObject(originalImageObject);
                      setImageFile(null);
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
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
                style={{ border: '1px solid #e5e5e5', minHeight: '37px' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <Button type="submit" disabled={updateNeighbourhoodMutation.isPending}>
              {updateNeighbourhoodMutation.isPending ? "Updating..." : "Update Neighbourhood"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
