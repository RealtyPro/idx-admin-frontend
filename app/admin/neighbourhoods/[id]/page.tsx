"use client";
import React from 'react';
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { useSingleNeighbourhood } from '@/services/neighbourhood/NeighbourhoodQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNeighbourhood } from '@/services/neighbourhood/NeighbourhoodServices';

export default function NeighbourhoodDetails() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
	
	const { data, isLoading, isError } = useSingleNeighbourhood(id);
	const neighbourhood = data?.data || data;

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
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-32 w-full rounded-xl" />
			</div>
		);
	}

	if (isError || !neighbourhood) {
		return (
			<div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Neighbourhood Not Found</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">The neighbourhood you are looking for does not exist.</p>
						<Button asChild variant="secondary" className="mt-4">
							<Link href="/admin/neighbourhoods">Back to Neighbourhoods</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
			<Card>
				<CardHeader className="flex flex-row justify-between items-center">
					<div>
						<CardTitle className="text-xl">{neighbourhood.name || neighbourhood.title}</CardTitle>
						<div className="text-sm text-muted-foreground mt-1">
							{neighbourhood.location && <span>{neighbourhood.location}</span>}
							{neighbourhood.location && neighbourhood.created_at && <span> • </span>}
							{neighbourhood.created_at && <span>{neighbourhood.created_at}</span>}
						</div>
					</div>
					<div className="flex gap-2">
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
				</CardHeader>
				<CardContent className="pt-4">
					{neighbourhood.image && (
						<div className="mb-4">
							<img
								src={neighbourhood.image}
								alt={neighbourhood.name || neighbourhood.title}
								className="w-full max-h-64 object-cover rounded-md border border-input"
							/>
						</div>
					)}
					{neighbourhood.description && (
						<div className="prose max-w-none">
							<p className="text-muted-foreground whitespace-pre-wrap">{neighbourhood.description}</p>
						</div>
					)}
					{neighbourhood.status && (
						<div className="mt-4">
							<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
								neighbourhood.status === 'active' 
									? 'bg-green-100 text-green-800' 
									: 'bg-gray-100 text-gray-800'
							}`}>
								{neighbourhood.status}
							</span>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

