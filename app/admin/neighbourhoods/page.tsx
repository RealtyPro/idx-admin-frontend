"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from 'react';
import { useNeighbourhoods, useDeleteNeighbourhood } from '@/services/neighbourhood/NeighbourhoodQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNeighbourhood, NeighbourhoodSearchParams } from '@/services/neighbourhood/NeighbourhoodServices';
import { useStates, useCountiesByState, useCitiesByCounty } from '@/services/location/LocationQueries';

export default function NeighbourhoodsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState<NeighbourhoodSearchParams>({
    region_id: '',
    county_id: '',
    city_id: '',
  });
  
  // Fetch location options dynamically
  const { data: statesData, isLoading: statesLoading } = useStates();
  const { data: countiesData, isLoading: countiesLoading } = useCountiesByState(searchParams.region_id);
  const { data: citiesData, isLoading: citiesLoading } = useCitiesByCounty(searchParams.county_id);
  
  // Handle different possible response structures
  const states = statesData?.data || statesData || [];
  const counties = countiesData?.data || countiesData || [];
  const cities = citiesData?.data || citiesData || [];
  
  // Reset county when state changes
  useEffect(() => {
    if (searchParams.region_id) {
      setSearchParams(prev => ({ ...prev, county_id: '', city_id: '' }));
    }
  }, [searchParams.region_id]);
  
  // Reset city when county changes
  useEffect(() => {
    if (searchParams.county_id) {
      setSearchParams(prev => ({ ...prev, city_id: '' }));
    }
  }, [searchParams.county_id]);
  
  const { data, isLoading, isError, error } = useNeighbourhoods({ ...searchParams, page: currentPage });
  const queryClient = useQueryClient();
  
  // Extract neighbourhoods from API response
  const neighbourhoods = data?.data || data || [];
  
  // Extract pagination metadata from API response
  const pagination = data?.meta || data?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1;
  const currentPageNum = pagination?.current_page || pagination?.currentPage || currentPage;
  const totalItems = pagination?.total || pagination?.totalItems || neighbourhoods.length;

  const deleteNeighbourhoodMutation = useMutation({
    mutationFn: (id: string) => deleteNeighbourhood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['neighbourhoods'] });
      alert("Neighbourhood deleted successfully");
    },
    onError: (error: any) => {
      console.error("Error deleting neighbourhood:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete neighbourhood. Please try again.";
      alert(errorMessage);
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this neighbourhood?")) {
      deleteNeighbourhoodMutation.mutate(id);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearSearch = () => {
    setSearchParams({
      region_id: '',
      county_id: '',
      city_id: '',
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (field: keyof NeighbourhoodSearchParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const renderPagination = () => {
    if (totalPages <= 1 && (!pagination || neighbourhoods.length < 10)) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPageNum - Math.floor(maxVisiblePages / 2));
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
            onClick={() => handlePageChange(currentPageNum - 1)}
            disabled={currentPageNum === 1 || isLoading}
          >
            Previous
          </Button>
          
          {startPage > 1 && (
            <>
              <Button
                variant={1 === currentPageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={isLoading}
              >
                1
              </Button>
              {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
            </>
          )}
          
          {pages.map((page) => (
            <Button
              key={page}
              variant={page === currentPageNum ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              disabled={isLoading}
            >
              {page}
            </Button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
              <Button
                variant={totalPages === currentPageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={isLoading}
              >
                {totalPages}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPageNum + 1)}
            disabled={currentPageNum === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Page {currentPageNum} of {totalPages} ({totalItems} total items)
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-32 rounded" />
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

  if (isError) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4">
        <p className="text-red-500">Error loading neighbourhoods: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Neighbourhood</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button asChild>
            <Link href="/admin/neighbourhoods/create">Add Neighbourhood</Link>
          </Button>
        </div>
      </div>

      {/* Search Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state-search">State</Label>
              <select
                id="state-search"
                value={searchParams.region_id || ''}
                onChange={e => handleFilterChange('region_id', e.target.value)}
                disabled={statesLoading}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
              >
                <option value="">{statesLoading ? 'Loading states...' : 'Select state'}</option>
                {Array.isArray(states) && states.map((stateOption: any) => (
                  <option key={stateOption.id} value={stateOption.id}>
                    {stateOption.name || stateOption.title || stateOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="county-search">County</Label>
              <select
                id="county-search"
                value={searchParams.county_id || ''}
                onChange={e => handleFilterChange('county_id', e.target.value)}
                disabled={!searchParams.region_id || countiesLoading}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
              >
                <option value="">{countiesLoading ? 'Loading counties...' : 'Select county'}</option>
                {Array.isArray(counties) && counties.map((countyOption: any) => (
                  <option key={countyOption.id} value={countyOption.id}>
                    {countyOption.name || countyOption.title || countyOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city-search">City</Label>
              <select
                id="city-search"
                value={searchParams.city_id || ''}
                onChange={e => handleFilterChange('city_id', e.target.value)}
                disabled={!searchParams.county_id || citiesLoading}
                className="block w-full px-4 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50"
              >
                <option value="">{citiesLoading ? 'Loading cities...' : 'Select city'}</option>
                {Array.isArray(cities) && cities.map((cityOption: any) => (
                  <option key={cityOption.id} value={cityOption.id}>
                    {cityOption.name || cityOption.title || cityOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} size="sm">
              Search
            </Button>
            <Button onClick={handleClearSearch} variant="outline" size="sm">
              Clear
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {Array.isArray(neighbourhoods) && neighbourhoods.length > 0 ? (
          neighbourhoods.map((neighbourhood: any) => (
            <Card key={neighbourhood.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                
                  <div className="text-sm text-muted-foreground">
                    
                  <Link 
                      href={`/admin/neighbourhoods/${neighbourhood.id}`}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                       {neighbourhood.description && <span>{neighbourhood.description.substring(0, 100)}...</span>}
                    </Link>

                    {neighbourhood.created_at && <span className="ml-2">• {neighbourhood.created_at}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="default" size="sm">
                    <Link href={`/admin/neighbourhoods/${neighbourhood.id}`}>View</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/neighbourhoods/${neighbourhood.id}/edit`}>Edit</Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(neighbourhood.id)}
                    disabled={deleteNeighbourhoodMutation.isPending}
                  >
                    {deleteNeighbourhoodMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No Neighbourhoods Found.</p>
        )}
      </div>
      
      {/* Pagination Controls */}
      {renderPagination()}
    </div>
  );
}

