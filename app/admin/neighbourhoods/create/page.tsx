"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNeighbourhood } from '@/services/neighbourhood/NeighbourhoodServices';
import { uploadNeighbourhoodImage } from '@/services/neighbourhood/NeighbourhoodUpload';

export default function NeighbourhoodCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState("active");
  const [uploadingImage, setUploadingImage] = useState(false);

  const createNeighbourhoodMutation = useMutation({
    mutationFn: (neighbourhoodData: object) => createNeighbourhood(neighbourhoodData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighbourhoods'] });
      alert("Neighbourhood created successfully");
      router.push("/admin/neighbourhoods");
    },
    onError: (error: any) => {
      console.error("Error creating neighbourhood:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create neighbourhood. Please try again.";
      alert(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      description,
      location,
      image,
      imageFile,
      status
    };

    createNeighbourhoodMutation.mutate(payload);
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
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
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={e => setLocation(e.target.value)} />
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
                      // Upload the image
                      const uploadedImageUrl = await uploadNeighbourhoodImage(file);
                      setImage(uploadedImageUrl);
                      alert("Image uploaded successfully");
                    } catch (error: any) {
                      console.error("Error uploading image:", error);
                      const errorMessage = error?.response?.data?.message || error?.message || "Failed to upload image. Please try again.";
                      alert(errorMessage);
                      // Reset preview if upload fails
                      setImage("");
                      setImageFile(null);
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

