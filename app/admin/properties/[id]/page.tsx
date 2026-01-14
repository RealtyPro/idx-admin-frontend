"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockProperties } from "@/lib/mockData";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function PropertyDetailsPage() {
  const [property, setProperty] = useState<
    (typeof mockProperties)[0] | undefined
  >(undefined);
  const params = useParams();
  useEffect(() => {
    setProperty(mockProperties.find((p) => p.id === params.id));
  }, [params.id]);

  if (!property) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
        <Card>
          <CardContent className="pt-4">
            <p className="text-muted-foreground">Property not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl">{property.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {property.address} • {property.price} • {property.status}
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/properties/${property.id}/edit`}>Edit</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/properties">Back</Link>
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
        <CardContent className="pt-4">
          <div className="prose max-w-none">{property.description}</div>
        </CardContent>
      </Card>
    </div>
  );
}
