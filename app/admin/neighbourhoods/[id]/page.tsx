"use client";
import React from 'react';
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge";
import { useSingleNeighbourhood } from '@/services/neighbourhood/NeighbourhoodQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNeighbourhood } from '@/services/neighbourhood/NeighbourhoodServices';
import { useStates, useCountiesByState, useCitiesByCounty } from '@/services/location/LocationQueries';
import { MapPin, Calendar, Info, Building2 } from 'lucide-react';

export default function NeighbourhoodDetails() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
	
	const { data, isLoading, isError } = useSingleNeighbourhood(id);
	const neighbourhood = data?.data || data;

	// Fetch location data to get names
	const { data: statesData } = useStates();
	const { data: countiesData } = useCountiesByState(neighbourhood?.state_id ? String(neighbourhood.state_id) : "");
	const { data: citiesData } = useCitiesByCounty(neighbourhood?.county_id ? String(neighbourhood.county_id) : "");

	// Extract location options
	const states = statesData?.data || statesData || [];
	const counties = countiesData?.data || countiesData || [];
	const cities = citiesData?.data || citiesData || [];

	// Find the location names by ID
	const stateName = neighbourhood?.state_id 
		? states.find((s: any) => String(s.value || s.key || s.id) === String(neighbourhood.state_id))?.text || 
		  states.find((s: any) => String(s.value || s.key || s.id) === String(neighbourhood.state_id))?.name || 
		  neighbourhood.state?.name || 
		  'N/A'
		: 'N/A';

	const countyName = neighbourhood?.county_id
		? counties.find((c: any) => String(c.value || c.key || c.id) === String(neighbourhood.county_id))?.text || 
		  counties.find((c: any) => String(c.value || c.key || c.id) === String(neighbourhood.county_id))?.name || 
		  neighbourhood.county?.name || 
		  'N/A'
		: 'N/A';

	const cityName = neighbourhood?.city_id
		? cities.find((c: any) => String(c.value || c.key || c.id) === String(neighbourhood.city_id))?.text || 
		  cities.find((c: any) => String(c.value || c.key || c.id) === String(neighbourhood.city_id))?.name || 
		  neighbourhood.city?.name || 
		  'N/A'
		: 'N/A';

	// Handle image - API uses 'images' field, but check 'image' for backwards compatibility
	const getImageUrl = () => {
		if (!neighbourhood) return null;
		
		const imageData = neighbourhood.images || neighbourhood.image;
		
		if (!imageData) return null;
		
		// Check if it's a default placeholder image
		if (typeof imageData === 'string') {
			const isDefaultImage = imageData.includes('/img/default/') || imageData.includes('default');
			if (isDefaultImage) return null; // Don't show default images
			
			return imageData.startsWith('http')
				? imageData
				: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/storage/${imageData}`;
		}
		
		// Handle image object
		if (typeof imageData === 'object' && imageData.path) {
			return imageData.path.startsWith('http')
				? imageData.path
				: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/storage/${imageData.path}`;
		}
		
		return null;
	};

	const imageUrl = getImageUrl();

	const deleteNeighbourhoodMutation = useMutation({
		mutationFn: (id: string) => deleteNeighbourhood(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['neighbourhoods'] });
			alert("Neighbourhood deleted successfully");
			router.push("/admin/neighbourhoods");
		},
		onError: (error: any) => {
			console.error("Error deleting neighbourhood:", error);
			const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete neighbourhood. Please try again.";
			alert(errorMessage);
		},
	});

	const handleDelete = () => {
		if (window.confirm("Are you sure you want to delete this neighbourhood?")) {
			deleteNeighbourhoodMutation.mutate(id);
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
						<Skeleton className="h-10 w-20" />
					</div>
				</div>
				<Skeleton className="h-96 w-full rounded-xl" />
				<Skeleton className="h-48 w-full rounded-xl" />
			</div>
		);
	}

	if (isError || !neighbourhood) {
		return (
			<div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Neighbourhood Not Found</CardTitle>
						<CardDescription>The neighbourhood you are looking for does not exist.</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="secondary">
							<Link href="/admin/neighbourhoods">Back to Neighbourhoods</Link>
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
					{neighbourhood.name || neighbourhood.title || "Neighbourhood Details"}
				</h1>
				<div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
					{(neighbourhood.city_id || neighbourhood.county_id || neighbourhood.state_id) && (
						<div className="flex items-center gap-1">
							<MapPin className="w-4 h-4" />
							<span>
								{[cityName !== 'N/A' ? cityName : null, countyName !== 'N/A' ? countyName : null, stateName !== 'N/A' ? stateName : null]
									.filter(Boolean)
									.join(', ') || neighbourhood.location || 'Location not specified'}
							</span>
						</div>
					)}
					{neighbourhood.created_at && (
						<div className="flex items-center gap-1">
							<Calendar className="w-4 h-4" />
							<span>{new Date(neighbourhood.created_at).toLocaleDateString()}</span>
						</div>
					)}
				</div>
			</div>
				<div className="flex gap-2 flex-wrap">
					<Button asChild variant="outline" size="sm">
						<Link href={`/admin/neighbourhoods/${id}/edit`}>Edit</Link>
					</Button>
					<Button asChild variant="secondary" size="sm">
						<Link href="/admin/neighbourhoods">Back</Link>
					</Button>
					<Button 
						variant="destructive" 
						size="sm" 
						onClick={handleDelete}
						disabled={deleteNeighbourhoodMutation.isPending}
					>
						{deleteNeighbourhoodMutation.isPending ? "Deleting..." : "Delete"}
					</Button>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid gap-6 md:grid-cols-12">
				{/* Image Section - 8 columns */}
				{imageUrl && (
					<Card className="overflow-hidden md:col-span-8 col-span-12">
						
						<CardContent className="p-0">
							<img
								src={imageUrl}
								alt={neighbourhood.name || neighbourhood.title || 'Neighbourhood image'}
								className="w-full h-[400px] object-cover"
								onError={(e) => {
									console.error('Image failed to load:', imageUrl);
									e.currentTarget.style.display = 'none';
								}}
							/>
						</CardContent>
					</Card>
				)}

				{/* Details Card - 4 columns */}
				<Card className={imageUrl ? "md:col-span-4 col-span-12" : "md:col-span-12 col-span-12"}>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Building2 className="w-5 h-5" />
							<CardTitle>Details</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Status */}
						<div>
							<h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
							<Badge 
								variant={neighbourhood.status === 'active' ? 'default' : 'secondary'}
								className={neighbourhood.status === 'active' ? 'bg-green-500' : ''}
							>
								{neighbourhood.status || 'Unknown'}
							</Badge>
						</div>

						{/* State */}
						{neighbourhood.state_id && (
							<div>
								<h3 className="text-sm font-medium text-muted-foreground mb-1">State</h3>
								<p className="text-sm">{stateName}</p>
							</div>
						)}

						{/* County */}
						{neighbourhood.county_id && (
							<div>
								<h3 className="text-sm font-medium text-muted-foreground mb-1">County</h3>
								<p className="text-sm">{countyName}</p>
							</div>
						)}

						{/* City */}
						{neighbourhood.city_id && (
							<div>
								<h3 className="text-sm font-medium text-muted-foreground mb-1">City</h3>
								<p className="text-sm">{cityName}</p>
							</div>
						)}

						{/* Created At */}
						{neighbourhood.created_at && (
							<div>
								<h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
								<p className="text-sm">
									{new Date(neighbourhood.created_at).toLocaleString()}
								</p>
							</div>
						)}

						
					</CardContent>
				</Card>
			</div>

			{/* Description Section - Full Width */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Info className="w-5 h-5" />
						<CardTitle>Description</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					{neighbourhood.description ? (
						<p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
							{neighbourhood.description}
						</p>
					) : (
						<p className="text-muted-foreground italic">No description available</p>
					)}
				</CardContent>
			</Card>

			{/* Additional Information */}
			{(neighbourhood.properties_count || neighbourhood.listings_count) && (
				<Card>
					<CardHeader>
						<CardTitle>Statistics</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{neighbourhood.properties_count !== undefined && (
								<div className="text-center p-4 border rounded-lg">
									<p className="text-2xl font-bold">{neighbourhood.properties_count}</p>
									<p className="text-sm text-muted-foreground">Properties</p>
								</div>
							)}
							{neighbourhood.listings_count !== undefined && (
								<div className="text-center p-4 border rounded-lg">
									<p className="text-2xl font-bold">{neighbourhood.listings_count}</p>
									<p className="text-sm text-muted-foreground">Listings</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

