"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import React, { useState, useEffect } from 'react';
import axiosInstance from '@/services/Api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive?: string;
  crm_status?: string;
  created_at?: string;
}

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('v1/user/customer', {
        params: { page: currentPage },
      });
      
      const data = response.data;
      
      // Extract pagination metadata
      const pagination = data?.meta || data?.pagination || null;
      setTotalPages(pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1);
      setTotalItems(pagination?.total || pagination?.totalItems || 0);
      
      // Map API response to User interface
      const mappedUsers: User[] = Array.isArray(data) 
        ? data.map((user: any, index: number) => ({
            id: user.id || user.user_id || index + 1,
            name: user.name || user.full_name || user.username || `User ${index + 1}`,
            email: user.email || user.email_address || '',
            role: user.role || user.user_role || 'User',
            status: user.status || (user.is_active ? 'Active' : 'Inactive'),
            lastActive: user.last_active || user.last_login || user.updated_at || '',
            crm_status: user.crm_status ?? "0",
            created_at: user.created_at || '',
          }))
        : (data.data || data.users || []).map((user: any, index: number) => ({
            id: user.id || user.user_id || index + 1,
            name: user.name || user.full_name || user.username || `User ${index + 1}`,
            email: user.email || user.email_address || '',
            role: user.role || user.user_role || 'User',
            status: user.status || (user.is_active ? 'Active' : 'Inactive'),
            lastActive: user.last_active || user.last_login || user.updated_at || '',
            crm_status: user.crm_status ?? "0",
            created_at: user.created_at || '',
          }));
      
      setUsers(mappedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex flex-col items-center justify-center gap-4 mt-6">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          
          {startPage > 1 && (
            <>
              <Button
                variant={1 === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={loading}
              >
                1
              </Button>
              {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
            </>
          )}
          
          {pages.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              disabled={loading}
            >
              {page}
            </Button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
              <Button
                variant={totalPages === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={loading}
              >
                {totalPages}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} ({totalItems} total users)
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40 mb-4" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4">
        <p className="text-red-500">Error loading users: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <div className="grid gap-4">
        {Array.isArray(users) && users.length > 0 ? (
          users.map((user) => (
            <Card key={user.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    <Link 
                      href={`/admin/users/${user.id}`}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {user.name}
                    </Link>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                    {user.role && <span> • Role: {user.role}</span>}
                    {user.created_at && <span> • Joined: {new Date(user.created_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status}
                  </span>
                  <Button asChild variant="default" size="sm">
                    <Link href={`/admin/users/${user.id}`}>View</Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No users found.</p>
        )}
      </div>
      {renderPagination()}
    </div>
  );
}

