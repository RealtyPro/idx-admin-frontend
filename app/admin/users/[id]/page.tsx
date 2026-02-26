"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/services/Api';
import { Mail, Phone, Calendar, User as UserIcon, FileText, Tag, Shield } from 'lucide-react';

function useUserDetail(id: string) {
  return useQuery({
    queryKey: ['user', id],
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
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const { data, isLoading, isError, error } = useUserDetail(id);
  const user = data?.data || data;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`v1/user/customer/${id}`);
    },
    onSuccess: () => {
      alert("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.push("/admin/users");
    },
    onError: (error: any) => {
      console.error("Error deleting user:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete user.";
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
            <CardDescription>The user you are looking for does not exist.</CardDescription>
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
                <span>Joined {new Date(user.created_at || user.date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/users">Back</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* User Information Card */}
        <Card className="md:col-span-2">
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
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
                <p className="text-sm">{user.name || user.full_name || 'N/A'}</p>
              </div>

              {/* Email */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                <p className="text-sm break-all">{user.email || 'N/A'}</p>
              </div>

              {/* Phone */}
              {user.contact_no && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone</h3>
                  <p className="text-sm">{user.contact_no}</p>
                </div>
              )}

              {/* Username */}
              {user.username && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Username</h3>
                  <p className="text-sm">{user.username}</p>
                </div>
              )}

              {/* Address */}
              {user.address && (
                <div className="sm:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Address</h3>
                  <p className="text-sm">{user.address}</p>
                </div>
              )}

              {/* Bio/Description */}
              {user.bio && (
                <div className="sm:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Bio</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{user.bio}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
              <Badge
                variant={user.status === 'Active' || user.is_active ? 'default' : 'secondary'}
                className={user.status === 'Active' || user.is_active ? 'bg-green-500' : ''}
              >
                {user.status || (user.is_active ? 'Active' : 'Inactive')}
              </Badge>
            </div>

            {/* Role */}
            {user.role && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Role</h3>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm capitalize">{user.role}</p>
                </div>
              </div>
            )}

            {/* User ID */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">User ID</h3>
              <p className="text-sm font-mono">{user.id || user.user_id}</p>
            </div>

            {/* CRM Status */}
            {user.crm_status !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">CRM Status</h3>
                <Badge variant={user.crm_status === "0" ? 'secondary' : 'default'}>
                  {user.crm_status === "0" ? 'Not in CRM' : 'In CRM'}
                </Badge>
              </div>
            )}

            {/* Last Active */}
            {user.last_active && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Active</h3>
                <p className="text-sm">
                  {new Date(user.last_active).toLocaleString()}
                </p>
              </div>
            )}

            {/* Created At */}
            {user.created_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                <p className="text-sm">
                  {new Date(user.created_at).toLocaleString()}
                </p>
              </div>
            )}

            {/* Updated At */}
            {user.updated_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Updated At</h3>
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

