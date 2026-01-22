"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from '@/components/ui/skeleton';
import { useSingleProperty } from '@/services/property/PropertyQueries';

export default function PropertyEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const { data, isLoading, isError } = useSingleProperty(id);
  const property = data?.data || data;

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");

  // Update form fields when property data loads
  useEffect(() => {
    if (property) {
      setTitle(property.title || property.name || '');
      setAddress(property.address || '');
      setPrice(property.price || '');
      setStatus(property.status || '');
      setDescription(property.description || property.content || '');
    }
  }, [property]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl mt-4" />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Property Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">The property you are looking for does not exist.</div>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin/properties">Back to Properties</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Edit Property</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/properties/${id}`}>Back</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            // TODO: Implement update functionality when API is ready
            alert("Update functionality will be implemented when the update API endpoint is available");
          }}>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
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
            <div>
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input 
                id="status" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button type="submit">Update</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
