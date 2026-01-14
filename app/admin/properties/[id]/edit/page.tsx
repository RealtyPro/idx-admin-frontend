"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { mockProperties } from "@/lib/mockData";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PropertyEditPage() {
  const [property, setProperty] = useState<
    (typeof mockProperties)[0] | undefined
  >(undefined);
  const params = useParams();
  useEffect(() => {
    setProperty(mockProperties.find((p) => p.id === params.id));
  }, [params.id]);

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Edit Property</CardTitle>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/admin/properties/${property.id}`}>Back</Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => alert("Deleted!")}
            >
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" defaultValue={property.title} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue={property.address} />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" defaultValue={property.price} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input id="status" defaultValue={property.status} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={property.description}
              />
            </div>
            <Button type="submit">Update</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
