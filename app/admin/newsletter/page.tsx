
"use client";
import React, { useState } from 'react';
import { useNewsletterSubscribers, useDeleteNewsletterSubscriber } from '@/services/newsletter/NewsletterQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
    export default function NewsletterPage() {
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const queryClient = useQueryClient();
    const { data, isLoading, isError, error } = useNewsletterSubscribers(1);
    const subscribers = data?.data || data || [];
    const deleteMutation = useDeleteNewsletterSubscriber();
    if (isLoading) {
        return (
            <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-40 mb-4" />
                    <Skeleton className="h-10 w-24 rounded" />
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
                <p className="text-red-500">Error loading newsletter subscribers: {error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Newsletter</h1>
                <div className="flex gap-2">
                    <Button asChild variant="secondary">
                        <Link href="/admin">Back</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/newsletter/create">New NewsLetter</Link>
                    </Button>
                </div>
            </div>
            <div className="grid gap-4">
                {Array.isArray(subscribers) && subscribers.length > 0 ? (
                    subscribers.map((subscriber: any) => (
                        <Card key={subscriber.id}>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle className="text-lg">
                                        <Link href={`/admin/newsletter/${subscriber.id}`}>
                                            {subscriber.name || subscriber.email || 'No Name'}
                                        </Link>
                                    </CardTitle>
                                    <div className="text-sm text-muted-foreground">
                                        {subscriber.email}
                                    </div>
                                    <div className="text-sm text-dark mt-2">{subscriber.created_at}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/newsletter/${subscriber.id}/edit`}>Edit</Link>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={deleteMutation.isPending}
                                        onClick={() => {
                                            setDeleteId(subscriber.id);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        {deleteMutation.isPending && deleteId === subscriber.id ? 'Deleting...' : 'Delete'}
                                    </Button>
                                    {/* Delete Confirmation Modal */}
                                    <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Delete Subscriber</DialogTitle>
                                            </DialogHeader>
                                            <div>Are you sure you want to delete this subscriber?</div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleteMutation.isPending}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => deleteId && deleteMutation.mutate(deleteId, {
                                                        onSuccess: () => {
                                                            setShowDeleteModal(false);
                                                            setDeleteId(null);
                                                            queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
                                                        }
                                                    })}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                </div>
                            </CardHeader>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground">No subscribers found.</p>
                )}
            </div>
        </div>
    );
}