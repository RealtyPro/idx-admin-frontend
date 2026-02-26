"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNeighbourhood } from '@/services/neighbourhood/NeighbourhoodServices';
import { uploadNeighbourhoodImage, ImageObject } from '@/services/neighbourhood/NeighbourhoodUpload';
import { useStates, useCountiesByState, useCitiesByCounty } from '@/services/location/LocationQueries';

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

  // Fetch location options dynamically
  const { data: statesData, isLoading: statesLoading } = useStates();
  const { data: countiesData, isLoading: countiesLoading } = useCountiesByState(state);
  const { data: citiesData, isLoading: citiesLoading } = useCitiesByCounty(county);

  // Debug: Log the API responses
  useEffect(() => {
    if (statesData) {
      console.log('States API Response:', statesData);
    }
  }, [statesData]);

  useEffect(() => {
    if (countiesData) {
      console.log('Counties API Response:', countiesData);
    }
  }, [countiesData]);

  useEffect(() => {
    if (citiesData) {
      console.log('Cities API Response:', citiesData);
    }
  }, [citiesData]);

  // Handle different possible response structures
  const states = statesData?.data || statesData || [];
  const counties = countiesData?.data || countiesData || [];
  const cities = citiesData?.data || citiesData || [];

  // Reset county when state changes
  useEffect(() => {
    setCounty("");
    setCity("");
  }, [state]);

  // Reset city when county changes
  useEffect(() => {
    setCity("");
  }, [county]);

  const createNeighbourhoodMutation = useMutation({
    mutationFn: (neighbourhoodData: object) => createNeighbourhood(neighbourhoodData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighbourhoods'] });
      alert("Neighbourhood created successfully");
      router.push("/admin/neighbourhoods");
    },
    onError: (error: any) => {
      console.error("Error creating neighbourhood:", error);
      console.error("Error response data:", error?.response?.data);
      console.error("Validation errors:", error?.response?.data?.errors);
      
      // Show detailed error message
      const errorData = error?.response?.data;
      let errorMessage = errorData?.message || error?.message || "Failed to create neighbourhood.";
      
      // If there are validation errors, show them
      if (errorData?.errors) {
        const validationErrors = Object.entries(errorData.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        errorMessage += '\n\nValidation Errors:\n' + validationErrors;
      }
      
      alert(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!state) {
      alert('Please select a state');
      return;
    }
    if (!county) {
      alert('Please select a county');
      return;
    }
    if (!city) {
      alert('Please select a city');
      return;
    }
    if (!imageObject) {
      alert('Please upload an image');
      return;
    }

    // Build payload - only include image if it exists
    const payload: any = {
      region_id: state,    
      county_id: county,     
      city_id: city,        
      description,
      status
    };

    // Add the uploaded image object
    if (imageObject) {
      payload.images = imageObject;  // API expects 'images' not 'image'
      console.log('Submitting neighbourhood with image object:', imageObject);
    }

    console.log('Full neighbourhood payload:', payload);
    createNeighbourhoodMutation.mutate(payload);
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Add Neighbourhood</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/neighbourhoods">Back</Link>
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
                  const selectedId = e.target.value;
                  console.log('Selected state ID:', selectedId);
                  setState(selectedId);
                }}
                disabled={statesLoading}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
              >
                <option value="">{statesLoading ? 'Loading states...' : 'Select state'}</option>
                {Array.isArray(states) && states.map((stateOption: any, index: number) => {
                  // Debug: log each state option structure
                  if (index === 0) console.log('Sample state option:', stateOption);
                  return (
                    <option key={stateOption.id || index} value={stateOption.id || stateOption.value || stateOption}>
                      {stateOption.name || stateOption.title || stateOption.label || stateOption}
                    </option>
                  );
                })}
              </select>
              {!statesLoading && (!states || states.length === 0) && (
                <p className="text-xs text-red-500 mt-1">No states available. Check console for API response.</p>
              )}
            </div>

            <div>
              <Label htmlFor="county">County</Label>
              <select
                id="county"
                value={county}
                onChange={e => {
                  const selectedId = e.target.value;
                  console.log('Selected county ID:', selectedId);
                  setCounty(selectedId);
                }}
                disabled={!state || countiesLoading}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
              >
                <option value="">{countiesLoading ? 'Loading counties...' : 'Select county'}</option>
                {Array.isArray(counties) && counties.map((countyOption: any, index: number) => {
                  if (index === 0) console.log('Sample county option:', countyOption);
                  return (
                    <option key={countyOption.id || index} value={countyOption.id || countyOption.value || countyOption}>
                      {countyOption.name || countyOption.title || countyOption.label || countyOption}
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
                onChange={e => {
                  const selectedId = e.target.value;
                  console.log('Selected city ID:', selectedId);
                  setCity(selectedId);
                }}
                disabled={!county || citiesLoading}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
              >
                <option value="">{citiesLoading ? 'Loading cities...' : 'Select city'}</option>
                {Array.isArray(cities) && cities.map((cityOption: any, index: number) => {
                  if (index === 0) console.log('Sample city option:', cityOption);
                  return (
                    <option key={cityOption.id || index} value={cityOption.id || cityOption.value || cityOption}>
                      {cityOption.name || cityOption.title || cityOption.label || cityOption}
                    </option>
                  );
                })}
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

            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              {image && (
                <img
                  src={image}
                  alt="Current image"
                  className="w-full max-h-40 object-cover rounded-md border border-input"
                />
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    setImageFile(file);
                    setUploadingImage(true);
                    
                    // Show preview immediately
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                    
                    try {
                      // Upload the image and get the image object
                      const uploadedImageObj = await uploadNeighbourhoodImage(file);
                      setImageObject(uploadedImageObj);
                      
                      // Set preview image URL
                      const previewUrl = uploadedImageObj.path.startsWith('http') 
                        ? uploadedImageObj.path 
                        : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/storage/${uploadedImageObj.path}`;
                      setImage(previewUrl);
                      
                      alert("Image uploaded successfully");
                    } catch (error: any) {
                      console.error("Error uploading image:", error);
                      const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload image. Please try again.";
                      alert(errorMessage);
                      // Reset preview if upload fails
                      setImage("");
                      setImageFile(null);
                      setImageObject(null);
                      if (e.target) {
                        e.target.value = "";
                      }
                    } finally {
                      setUploadingImage(false);
                    }
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                {uploadingImage ? "Uploading image..." : "Upload an image for this neighbourhood."}
              </p>
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

            <Button type="submit" disabled={createNeighbourhoodMutation.isPending}>
              {createNeighbourhoodMutation.isPending ? "Creating..." : "Create Neighbourhood"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
