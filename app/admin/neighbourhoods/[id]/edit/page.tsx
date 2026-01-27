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
  
  const { data, isLoading, isError } = useSingleNeighbourhood(id);
  const neighbourhood = data?.data || data;
  
  const updateNeighbourhoodMutation = useUpdateNeighbourhood();

  const [state, setState] = useState("");
  const [county, setCounty] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageObject, setImageObject] = useState<ImageObject | null>(null);
  const [originalImageObject, setOriginalImageObject] = useState<ImageObject | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [status, setStatus] = useState("active");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch location options dynamically
  const { data: statesData, isLoading: statesLoading } = useStates();
  const { data: countiesData, isLoading: countiesLoading } = useCountiesByState(state);
  const { data: citiesData, isLoading: citiesLoading } = useCitiesByCounty(county);

  const states = statesData?.data || statesData || [];
  const counties = countiesData?.data || countiesData || [];
  const cities = citiesData?.data || citiesData || [];

  // Update form fields when neighbourhood data loads
  useEffect(() => {
    if (neighbourhood) {
      console.log('Loading neighbourhood data:', neighbourhood);
      
      // Extract state/region ID - try multiple possible field names
      const stateId = neighbourhood.region_id || neighbourhood.state_id || neighbourhood.state || '';
      const countyId = neighbourhood.county_id || neighbourhood.county || '';
      const cityId = neighbourhood.city_id || neighbourhood.city || '';
      
      console.log('Extracted IDs:', { stateId, countyId, cityId });
      
      setState(String(stateId));
      setCounty(String(countyId));
      setCity(String(cityId));
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
      
      // Mark initial load as complete
      setIsInitialLoad(false);
    }
  }, [neighbourhood]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      region_id: state,      // Send state ID as region_id
      county_id: county,     // Send county ID as county_id
      city_id: city,         // Send city ID as city_id
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
              >
                <option value="">{statesLoading ? 'Loading states...' : 'Select state'}</option>
                {Array.isArray(states) && states.map((stateOption: any, index: number) => (
                  <option key={stateOption.id || index} value={stateOption.id}>
                    {stateOption.name || stateOption.title || stateOption.label || 'Unknown'}
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
              >
                <option value="">{countiesLoading ? 'Loading counties...' : 'Select county'}</option>
                {Array.isArray(counties) && counties.map((countyOption: any, index: number) => (
                  <option key={countyOption.id || index} value={countyOption.id}>
                    {countyOption.name || countyOption.title || countyOption.label || 'Unknown'}
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
              >
                <option value="">{citiesLoading ? 'Loading cities...' : 'Select city'}</option>
                {Array.isArray(cities) && cities.map((cityOption: any, index: number) => (
                  <option key={cityOption.id || index} value={cityOption.id}>
                    {cityOption.name || cityOption.title || cityOption.label || 'Unknown'}
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
                    
                    // Show preview immediately
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setImage(ev.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                    
                    try {
                      // Upload the image and get the image object
                      const uploadedImageObj = await uploadNeighbourhoodImage(file);
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
                }}
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
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm"
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
