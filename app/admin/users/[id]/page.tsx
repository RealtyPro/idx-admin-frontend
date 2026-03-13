"use client";
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
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/services/Api";
import {
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  FileText,
  Tag,
  Shield,
  Home,
  BedDouble,
  Bath,
  Ruler,
  Clock,
  MessageSquare,
  CircleDot,
} from "lucide-react";

function useUserDetail(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`v1/user/customer/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const { data, isLoading, isError, error } = useUserDetail(id);
  const user = data?.data || data;

  const enquiry = user?.enquiry || null;
  const listing = user?.listings || user?.listing || null;

  const formatDateTime = (value?: string) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const formatPrice = (price: any) => {
    if (price === null || price === undefined || price === "") return "N/A";
    const num = typeof price === "number" ? price : Number(String(price).replace(/[^0-9.-]/g, ""));
    if (Number.isNaN(num)) return String(price);
    return `$${num.toLocaleString()}`;
  };

  const getImageUrl = (listing: any) => {
    const img = listing?.images || listing?.image || listing?.photos;
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`v1/user/customer/${id}`);
    },
    onSuccess: () => {
      alert("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.push("/admin/users");
    },
    onError: (error: any) => {
      console.error("Error deleting user:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete user.";
      alert(errorMessage);
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
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

  if (isError || !user) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>
              The user you are looking for does not exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/admin/users">Back to Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {user.name || user.full_name || user.username || "User Details"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
            {user.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            )}
            {user.contact_no && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{user.contact_no}</span>
              </div>
            )}
            {(user.created_at || user.date) && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Joined{" "}
                  {new Date(user.created_at || user.date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
                return;
              }
              router.push("/admin/users");
            }}
          >
            Back
          </Button>
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
                  {user.name || user.full_name || "N/A"}
                </p>
              </div>

              {/* Email */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Email
                </h3>
                <p className="text-sm break-all">{user.email || "N/A"}</p>
              </div>

              {/* Phone */}
              {/* {user.contact_no && ( */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Phone
                </h3>
                <p className="text-sm">{user.contact_no || "N/A"}</p>
              </div>
              {/* )} */}

              {/* Username */}
              {user.username && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Username
                  </h3>
                  <p className="text-sm">{user.username}</p>
                </div>
              )}

              {/* Address */}
              {user.address && (
                <div className="sm:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Address
                  </h3>
                  <p className="text-sm">{user.address}</p>
                </div>
              )}

              {/* Bio/Description */}
              {user.bio && (
                <div className="sm:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Bio
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {user.bio}
                  </p>
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
            <CardContent>
              {enquiry ? (
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {enquiry.subject || enquiry.title || "Enquiry"}
                    </p>
                    <Badge
                      variant={String(enquiry.status || "").toLowerCase() === "active" || String(enquiry.status || "").toLowerCase() === "new" ? "default" : "secondary"}
                      className={String(enquiry.status || "").toLowerCase() === "active" || String(enquiry.status || "").toLowerCase() === "new" ? "bg-green-500" : ""}
                    >
                      {enquiry.status || "N/A"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Required Date</p>
                        <p>{formatDateTime(enquiry.required_date || enquiry.date || enquiry.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Required Time</p>
                        <p>{enquiry.required_time || enquiry.time || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Source</p>
                        <p>{enquiry.source || enquiry.channel || enquiry.from || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Tag className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">Type</p>
                        <p>{enquiry.type || enquiry.enquiry_type || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Message / Description</p>
                    <p className="text-sm whitespace-pre-wrap">{enquiry.message || enquiry.description || "No message provided."}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No enquiry details available for this user.</p>
              )}
            </CardContent>
          </Card>

          {/* Listing Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                <CardTitle>Listing Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {listing ? (() => {
                const title = listing.title || listing.name || listing.address || `Property ${listing.id || ""}`;
                const image = getImageUrl(listing);
                const price = formatPrice(listing.price || listing.list_price);
                const beds = listing.bed ?? listing.beds ?? "-";
                const baths = listing.bath ?? listing.baths ?? "-";
                const sqft = listing.sqft ?? listing.square_feet ?? listing.area ?? "-";
                const location = listing.address || listing.location || "N/A";

                return (
                  <div className="rounded-lg border p-4">
                    <div className="flex gap-4">
                      <div className="w-28 h-20 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        {image ? (
                          <img src={image} alt={title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{title}</p>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">{location}</p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <span className="inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{price}</span>
                          <span className="inline-flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{beds} bd</span>
                          <span className="inline-flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{baths} ba</span>
                          <span className="inline-flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />{sqft} sqft</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <p className="text-sm text-muted-foreground">No listing details available for this user.</p>
              )}
            </CardContent>
          </Card>
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
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Status
              </h3>
              <Badge
                variant={
                  user.status === "Active" || user.is_active
                    ? "default"
                    : "secondary"
                }
                className={
                  user.status === "Active" || user.is_active
                    ? "bg-green-500"
                    : ""
                }
              >
                {user.status || (user.is_active ? "Active" : "Inactive")}
              </Badge>
            </div>

            {/* Role */}
            {user.role && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Role
                </h3>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm capitalize">{user.role}</p>
                </div>
              </div>
            )}

            {/* User ID */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                User ID
              </h3>
              <p className="text-sm font-mono">{user.id || user.user_id}</p>
            </div>

            {/* CRM Status */}
            {user.crm_status !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  CRM Status
                </h3>
                <Badge
                  variant={user.crm_status === "0" ? "secondary" : "default"}
                >
                  {user.crm_status === "0" ? "Not in CRM" : "In CRM"}
                </Badge>
              </div>
            )}

            {/* Last Active */}
            {user.last_active && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Last Active
                </h3>
                <p className="text-sm">
                  {new Date(user.last_active).toLocaleString()}
                </p>
              </div>
            )}

            {/* Created At */}
            {user.created_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Created At
                </h3>
                <p className="text-sm">
                  {new Date(user.created_at).toLocaleString()}
                </p>
              </div>
            )}

            {/* Updated At */}
            {user.updated_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Updated At
                </h3>
                <p className="text-sm">
                  {new Date(user.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
