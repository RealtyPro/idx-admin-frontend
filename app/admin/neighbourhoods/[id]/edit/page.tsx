"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useSingleNeighbourhood, useUpdateNeighbourhood } from '@/services/neighbourhood/NeighbourhoodQueries';
import { useQueryClient } from '@tanstack/react-query';
import { uploadNeighbourhoodImage } from '@/services/neighbourhood/NeighbourhoodUpload';

export default function NeighbourhoodEditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const { data, isLoading, isError } = useSingleNeighbourhood(id);
  const neighbourhood = data?.data || data;
  
  const updateNeighbourhoodMutation = useUpdateNeighbourhood();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState("active");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Update form fields when neighbourhood data loads
  useEffect(() => {
    if (neighbourhood) {
      setName(neighbourhood.name || neighbourhood.title || '');
      setDescription(neighbourhood.description || '');
      setLocation(neighbourhood.location || '');
      setImage(neighbourhood.image || '');
      setStatus(neighbourhood.status || 'active');
    }
  }, [neighbourhood]);

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
          const errorMessage = error?.response?.data?.message || error?.message || "Failed to update neighbourhood. Please try again.";
          alert(errorMessage);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl mt-4" />
      </div>
    );
  }

  if (isError || !neighbourhood) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
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
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
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
                      setImage(neighbourhood?.image || "");
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
                {uploadingImage ? "Uploading image..." : "Upload a new image to replace the existing one."}
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

            <Button type="submit" disabled={updateNeighbourhoodMutation.isPending}>
              {updateNeighbourhoodMutation.isPending ? "Updating..." : "Update Neighbourhood"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

