"use client";
import React from 'react';
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { useSinglePage } from '@/services/page/PageQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePage } from '@/services/page/PageServices';

export default function PageDetails() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
	
	const { data, isLoading, isError } = useSinglePage(id);
	const page = data?.data || data;

	const deletePageMutation = useMutation({
		mutationFn: (id: string) => deletePage(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['pages'] });
			alert("Page deleted successfully");
			router.push("/admin/pages");
		},
		onError: (error: any) => {
			console.error("Error deleting page:", error);
			const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete page. Please try again.";
			alert(errorMessage);
		},
	});

	const handleDelete = () => {
		if (window.confirm("Are you sure you want to delete this page?")) {
			deletePageMutation.mutate(id);
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-32 w-full rounded-xl" />
			</div>
		);
	}

	if (isError || !page) {
		return (
			<div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
				<Card>
					<CardHeader>
						<CardTitle>Page Not Found</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">The page you are looking for does not exist.</p>
						<Button asChild variant="secondary" className="mt-4">
							<Link href="/admin/pages">Back to Pages</Link>
						</Button>
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
						<CardTitle className="text-xl">{page.title}</CardTitle>
						<div className="text-sm text-muted-foreground">
							{page.slug && <span>{page.slug}</span>}
							{page.slug && page.date && <span> • </span>}
							{page.date && <span>{page.date}</span>}
							{page.created_at && !page.date && <span>{page.created_at}</span>}
						</div>
					</div>
					<div className="flex gap-2">
						<Button asChild variant="outline" size="sm">
							<Link href={`/admin/pages/${id}/edit`}>Edit</Link>
						</Button>
						<Button asChild variant="secondary" size="sm">
							<Link href="/admin/pages">Back</Link>
						</Button>
						<Button 
							variant="destructive" 
							size="sm" 
							onClick={handleDelete}
							disabled={deletePageMutation.isPending}
						>
							{deletePageMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</CardHeader>
				<CardContent className="pt-4">
					<div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
				</CardContent>
			</Card>
		</div>
	);
}

