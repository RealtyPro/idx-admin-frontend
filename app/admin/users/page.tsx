"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import SearchFilters from "@/components/SearchFilters";
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
  avatar?: string;
}

interface SearchFilters {
  email: string;
  name: string;
  crm_status: string;
  keyword: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const lastFetchKeyRef = useRef<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    email: '',
    name: '',
    crm_status: '',
    keyword: "",
  });

  const getInitials = (name?: string, email?: string) => {
    const source = name?.trim() || email?.trim() || "";
    if (!source) return "U";
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  };

  const formatJoinedDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Build query string from search filters
  const buildQueryString = (filters: SearchFilters = searchFilters) => {
    const queryParts: string[] = [];
    
    if (filters.email.trim()) {
      queryParts.push(`email:LIKE,${filters.email.trim()}`);
    }
    
    if (filters.name.trim()) {
      queryParts.push(`name:LIKE,${filters.name.trim()}`);
    }
    
    if (filters.crm_status) {
      queryParts.push(`crm_status:=,${filters.crm_status}`);
    }
    
    return queryParts.length > 0 ? queryParts.join(';') : '';
  };

  const fetchUsers = async (filtersToUse?: SearchFilters, force = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page: currentPage };
      const queryString = buildQueryString(filtersToUse);
      const fetchKey = `${currentPage}|${queryString}`;
      if (!force && lastFetchKeyRef.current === fetchKey) {
        setLoading(false);
        return;
      }
      lastFetchKeyRef.current = fetchKey;
      
      if (queryString) {
        params.q = queryString;
      }
      
      const response = await axiosInstance.get('v1/user/customer', { params });
      
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
            avatar: user.avatar || user.photo || user.profile_image || user.image || user.profile_photo || '',
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
            avatar: user.avatar || user.photo || user.profile_image || user.image || user.profile_photo || '',
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

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    fetchUsers(undefined, true);
  };

  const handleClearSearch = () => {
    const clearedFilters: SearchFilters = {
      email: '',
      name: '',
      crm_status: '',
      keyword: '',
    };
    setSearchFilters(clearedFilters);
    setCurrentPage(1);
    // Pass cleared filters directly to fetchUsers to avoid stale state
    setTimeout(() => fetchUsers(clearedFilters, true), 0);
  };

  const handleKeywordClear = () => {
    if (searchFilters.keyword.trim()) {
      setSearchFilters(prev => ({
        ...prev,
        keyword: ''
      }));
      setCurrentPage(1);
      setTimeout(() => fetchUsers(undefined, true), 0);
    } else {
      setSearchFilters(prev => ({
        ...prev,
        keyword: ''
      }));
    }
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePushToCRM = async (user: User) => {
    try {
      // Check if user is authenticated
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        alert('Please login to sync customers to CRM');
        return;
      }

      console.log('Pushing to CRM:', user);
      const response = await axiosInstance.get(`/user/sync-customer-to-crm`, {
        params: {
          customer_id: user.id
        }
      });
      console.log('CRM sync response:', response.data);
      
      // Show success message
      if (response.data.message) {
        alert(response.data.message);
      } else {
        alert('Customer successfully synced to CRM');
      }
      
      // Reload customer list after successful sync
      await fetchUsers();
    } catch (error: any) {
      console.error('Error pushing to CRM:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
      } else if (error.response?.data?.message) {
        alert(`Failed to sync: ${error.response.data.message}`);
      } else {
        alert('Failed to sync customer to CRM. Please try again.');
      }
    }
  };

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
        <SearchFilters
          className="max-w-2xl"
          keyword={searchFilters.keyword}
          isKeywordValid={!searchFilters.keyword || searchFilters.keyword.length === 0 || searchFilters.keyword.length >= 3}
          hasActiveFilters={!!(searchFilters.email.trim() || searchFilters.name.trim() || searchFilters.crm_status)}
          isLoading={loading}
          onKeywordChange={(value) => handleFilterChange('name', value)}
          onKeywordClear={handleKeywordClear}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          renderFields={() => (
            <>
              <div className="space-y-2">
                <Label htmlFor="email-search">Email</Label>
                <Input
                  id="email-search"
                  placeholder="Search by email..."
                  value={searchFilters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name-search">Name</Label>
                <Input
                  id="name-search"
                  placeholder="Search by name..."
                  value={searchFilters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crm-status-search">CRM Status</Label>
                <Select
                  value={searchFilters.crm_status}
                  onValueChange={(value) => handleFilterChange('crm_status', value)}
                >
                  <SelectTrigger id="crm-status-search">
                    <SelectValue placeholder="Select CRM status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Not in CRM</SelectItem>
                    <SelectItem value="1">In CRM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        />
      </div>

      <div className="grid gap-2">
        {Array.isArray(users) && users.length > 0 ? (
          users.map((user) => (
            <Card
              key={user.id}
              className="cursor-pointer"
              onClick={() => router.push(`/admin/users/${user.id}`)}
            >
              <CardHeader className="flex flex-row justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-semibold">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(user.name, user.email)}</span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Link 
                        href={`/admin/users/${user.id}`}
                        className="hover:text-primary hover:underline transition-colors"
                      >
                        {user.name}
                      </Link>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        user.status === 'Active' 
                          ? 'bg-[#a0b76e]/15 text-[#a0b76e] border-[#a0b76e]' 
                          : 'bg-red-50 text-red-600 border-red-400'
                      }`}>
                        {user.status}
                      </span>
                    </CardTitle>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                      {user.email && (
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="2" y="4" width="20" height="16" rx="4" />
                              <path d="m22 6-10 7L2 6" />
                            </svg>
                          </span>
                          <span>{user.email}</span>
                        </span>
                      )}
                      {user.role && (
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="9" />
                              <circle cx="12" cy="10" r="3" />
                              <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
                            </svg>
                          </span>
                          <span>{user.role}</span>
                        </span>
                      )}
                      {user.created_at && (
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            <svg
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="4" />
                              <path d="M16 2v4" />
                              <path d="M8 2v4" />
                              <path d="M3 10h18" />
                              <path d="M12 14v6" />
                              <path d="M9 17h6" />
                            </svg>
                          </span>
                          <span>{formatJoinedDate(user.created_at)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-wrap" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePushToCRM(user)}
                    disabled={user.crm_status !== "0"}
                  >
                    {user.crm_status === "0" ? 'Push to CRM' : 'In CRM'}
                  </Button>
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

