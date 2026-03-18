"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/services/Api";
import {
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  MessageSquare,
  FileText,
  Home,
  Ruler,
  Bath,
  BedDouble,
  Tag,
} from "lucide-react";

const SOURCE_LABELS: Record<string, { label: string; className: string }> = {
  sell: { label: "Sell", className: "bg-orange-100 text-orange-700" },
  connect: { label: "General", className: "bg-blue-100 text-blue-700" },
  listing_tour: {
    label: "Schedule Tour",
    className: "bg-violet-100 text-violet-700",
  },
  listing_enquire: {
    label: "Listing Inquire",
    className: "bg-cyan-100 text-cyan-700",
  },
  signup: { label: "Sign Up", className: "bg-emerald-100 text-emerald-700" },
  openhouse: { label: "Open House", className: "bg-amber-100 text-amber-700" },
  "idx-admin": { label: "IDX Admin", className: "bg-slate-100 text-slate-600" },
};

function useEnquiryDetail(id: string) {
  return useQuery({
    queryKey: ["enquiry", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`v1/admin/enquiry/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export default function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Unwrap params using React.use() for Next.js compatibility
  const { id } = React.use(params);
  const { data, isLoading, isError, error } = useEnquiryDetail(id);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`v1/admin/enquiry/${id}`);
    },
    onSuccess: () => {
      alert("Enquiry deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      router.push("/admin/inquiries");
    },
    onError: (error: any) => {
      console.error("Error deleting enquiry:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete enquiry.";
      alert(errorMessage);
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enquiry Not Found</CardTitle>
            <CardDescription>
              The enquiry you are looking for does not exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/admin/inquiries">Back to Enquiries</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enquiry = data?.data || data || {};
  const listing =
    enquiry?.listings || enquiry?.listing || enquiry?.listing_details || null;
  const sourceMeta = enquiry.type ? SOURCE_LABELS[String(enquiry.type)] : null;

  const formatDateTime = (value?: string) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const getImageUrl = (listing: any) => {
    const img = listing?.images || listing?.image || listing?.photos || listing?.photo || listing?.cover_photo || null;
    if (!img) return null;

    if (typeof img === "string") {
      return img.startsWith("http")
        ? img
        : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${img}`;
    }

    if (Array.isArray(img) && img.length > 0) {
      const first = img[0];
      if (typeof first === "string") {
        return first.startsWith("http")
          ? first
          : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${first}`;
      }
      if (first && typeof first === "object" && "path" in first) {
        const path = String((first as { path?: string }).path || "");
        if (!path) return null;
        return path.startsWith("http")
          ? path
          : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${path}`;
      }
    }

    if (img && typeof img === "object" && "path" in img) {
      const path = String((img as { path?: string }).path || "");
      if (!path) return null;
      return path.startsWith("http")
        ? path
        : `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/storage/${path}`;
    }

    return null;
  };

  const formatPrice = (price: any) => {
    if (price === null || price === undefined || price === "") return "N/A";
    const num =
      typeof price === "number"
        ? price
        : Number(String(price).replace(/[^0-9.-]/g, ""));
    if (Number.isNaN(num)) return String(price);
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {enquiry.name || enquiry.full_name || "Enquiry Details"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            {enquiry.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{enquiry.email}</span>
              </div>
            )}
            {enquiry.contact_no && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{enquiry.contact_no}</span>
              </div>
            )}
            {(enquiry.created_at || enquiry.date) && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(
                    enquiry.created_at || enquiry.date,
                  ).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/inquiries">Back</Link>
          </Button>{" "}
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/inquiries/${id}/edit`}>Edit</Link>
          </Button>{" "}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* User Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                <CardTitle>User Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Full Name
                  </h3>
                  <p className="text-sm">
                    {enquiry.name || enquiry.full_name || "N/A"}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </h3>
                  <p className="text-sm break-all">{enquiry.email || "N/A"}</p>
                </div>

                {/* Contact Number */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Contact Number
                  </h3>
                  <p className="text-sm">{enquiry.contact_no || "N/A"}</p>
                </div>

                {/* Property Type */}
                {enquiry.property_type && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Property Type
                    </h3>
                    <p className="text-sm">{enquiry.property_type}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enquiry Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <CardTitle>Enquiry Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Message / Description
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {enquiry.message ||
                    enquiry.description ||
                    "No message provided."}
                </p>
              </div>
              {/* <div className="rounded-lg border p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {enquiry.subject || enquiry.title || "Enquiry"}
                  </p>
                  {enquiry.status && (
                    <Badge
                      variant={
                        String(enquiry.status || "").toLowerCase() ===
                          "active" ||
                        String(enquiry.status || "").toLowerCase() === "new"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        String(enquiry.status || "").toLowerCase() ===
                          "active" ||
                        String(enquiry.status || "").toLowerCase() === "new"
                          ? "bg-green-500"
                          : ""
                      }
                    >
                      {enquiry.status || "N/A"}
                    </Badge>
                  )}
                </div>

               
                {(enquiry.listing_id || enquiry.listingId) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Listing ID
                      </p>
                      <p className="font-mono">
                        {enquiry.listing_id || enquiry.listingId}
                      </p>
                    </div>
                  </div>
                )}

                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Message / Description
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {enquiry.message ||
                      enquiry.description ||
                      "No message provided."}
                  </p>
                </div>
              </div> */}
            </CardContent>
          </Card>
          {/* Listing Details Card */}
          {listing && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                <CardTitle>Listing Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {listing ? (
                (() => {
                  const title =
                    listing.title ||
                    listing.name ||
                    listing.address ||
                    `Property ${listing.id || ""}`;
                  const image = getImageUrl(listing);
                  const price = formatPrice(
                    listing.price || listing.list_price,
                  );
                  const beds = listing.bed ?? listing.beds ?? "-";
                  const baths = listing.bath ?? listing.baths ?? "-";
                  const sqft =
                    listing.sqft ?? listing.square_feet ?? listing.area ?? listing?.bua ?? "-";
                  const location =
                    listing.address ||
                    listing.location ||
                    listing?.UnparsedAddress ||
                    "N/A";
                  const PropertySubType = listing.PropertySubType || "";
                  return (
                    <div className="rounded-lg border p-4">
                      <div className="flex gap-4">
                        <div className="w-28 h-20 rounded-md bg-muted overflow-hidden flex-shrink-0">
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="font-semibold truncate">{title}</p>
                            {PropertySubType && (
                              <Badge
                                variant="secondary"
                                className="text-xs whitespace-nowrap"
                              >
                                {PropertySubType}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {location}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            <span className="inline-flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5" />
                              {price}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <BedDouble className="w-3.5 h-3.5" />
                              {beds} {beds === 1 ? "Bedroom" : "Bedrooms"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Bath className="w-3.5 h-3.5" />
                              {baths} {baths === 1 ? "Bathroom" : "Bathrooms"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Ruler className="w-3.5 h-3.5" />
                              {sqft} Sqft
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-sm text-muted-foreground">
                  No listing details available for this user.
                </p>
              )}
            </CardContent>
          </Card>
          )}
        </div>

        {/* Details Sidebar */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <CardTitle>Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            {enquiry.status && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Status
                </h3>
                <Badge
                  variant={
                    String(enquiry.status || "").toLowerCase() === "active" ||
                    String(enquiry.status || "").toLowerCase() === "new"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    String(enquiry.status || "").toLowerCase() === "active" ||
                    String(enquiry.status || "").toLowerCase() === "new"
                      ? "bg-green-500"
                      : ""
                  }
                >
                  {enquiry.status || "N/A"}
                </Badge>
              </div>
            )}

            {sourceMeta && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Source
                </h3>
                <Badge variant="secondary" className={sourceMeta.className}>
                  {sourceMeta.label}
                </Badge>
              </div>
            )}

            {/* Enquiry ID */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Enquiry ID
              </h3>
              <p className="text-sm font-mono">{enquiry.id || "N/A"}</p>
            </div>
            {/* Property Type */}
            {enquiry.property_type && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Property Type
                </h3>
                <p className="text-sm">{enquiry.property_type}</p>
              </div>
            )}
            {/* Created At */}
            {enquiry.created_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Created At
                </h3>
                <p className="text-sm">{formatDateTime(enquiry.created_at)}</p>
              </div>
            )}

            {/* Updated At */}
            {enquiry.updated_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Updated At
                </h3>
                <p className="text-sm">{formatDateTime(enquiry.updated_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
