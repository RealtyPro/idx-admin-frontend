"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockProperties } from '@/lib/mockData';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PropertiesListPage() {
  const [properties, setProperties] = useState<typeof mockProperties>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProperties(mockProperties);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-40 rounded" />
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Properties</h1>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin">Back</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/properties/create">New Property</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {properties.map((property) => (
          <Card key={property.id}>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-lg">
                  <Link href={`/admin/properties/${property.id}`}>{property.title}</Link>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {property.address} • {property.price} • {property.status}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/properties/${property.id}/edit`}>Edit</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => alert('Deleted!')}>Delete</Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
} 