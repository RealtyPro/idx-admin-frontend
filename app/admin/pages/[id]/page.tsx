"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockPages } from '@/lib/mockData';
import { Skeleton } from '@/components/ui/skeleton';

export default function PageDetails() {
	const [page, setPage] = useState<typeof mockPages[0] | undefined>(undefined);
	const [loading, setLoading] = useState(true);
	const params = useParams();

	useEffect(() => {
		setPage(mockPages.find((p) => p.id === params.id));
		const timer = setTimeout(() => setLoading(false), 300);
		return () => clearTimeout(timer);
	}, [params.id]);

	if (loading) {
		return (
			<div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-2xl">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-32 w-full rounded-xl" />
			</div>
		);
	}

	if (!page) {
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
						<div className="text-sm text-muted-foreground">{page.slug} • {page.date}</div>
					</div>
					<div className="flex gap-2">
						<Button asChild variant="outline" size="sm">
							<Link href={`/admin/pages/${page.id}/edit`}>Edit</Link>
						</Button>
						<Button asChild variant="secondary" size="sm">
							<Link href="/admin/pages">Back</Link>
						</Button>
						<Button variant="destructive" size="sm" onClick={() => alert('Deleted!')}>Delete</Button>
					</div>
				</CardHeader>
				<CardContent className="pt-4">
					<div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
				</CardContent>
			</Card>
		</div>
	);
}

