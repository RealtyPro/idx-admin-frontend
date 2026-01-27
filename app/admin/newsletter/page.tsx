
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
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useNewsletterSubscribers(currentPage);
  const subscribers = data?.data || data || [];

  // Extract pagination metadata from API response
  const pagination = data?.meta || data?.pagination || null;
  const totalPages = pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1;
  const currentPageNum = pagination?.current_page || pagination?.currentPage || currentPage;
  const totalItems = pagination?.total || pagination?.totalItems || subscribers.length;

  const deleteMutation = useDeleteNewsletterSubscriber();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    // Show pagination if we have pagination data or if there are multiple pages worth of data
    if (totalPages <= 1 && (!pagination || subscribers.length < 10)) return null;

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
                variant={1 === currentPageNum ? 'default' : 'outline'}
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
              variant={page === currentPageNum ? 'default' : 'outline'}
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
                variant={totalPages === currentPageNum ? 'default' : 'outline'}
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
        {pagination && (
          <div className="text-sm text-muted-foreground">
            Page {currentPageNum} of {totalPages} {totalItems && `(${totalItems} total items)`}
          </div>
        )}
      </div>
    );
  };

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
        <p className="text-red-500">
          Error loading newsletter subscribers:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Newsletter</h1>
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
                  <div className="text-sm text-muted-foreground">{subscriber.email}</div>
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
                    {deleteMutation.isPending && deleteId === subscriber.id
                      ? 'Deleting...'
                      : 'Delete'}
                  </Button>
                  {/* Delete Confirmation Modal */}
                  <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Subscriber</DialogTitle>
                      </DialogHeader>
                      <div>Are you sure you want to delete this subscriber?</div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteModal(false)}
                          disabled={deleteMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            deleteId &&
                            deleteMutation.mutate(deleteId, {
                              onSuccess: () => {
                                setShowDeleteModal(false);
                                setDeleteId(null);
                                queryClient.invalidateQueries({
                                  queryKey: ['newsletter-subscribers'],
                                });
                              },
                            })
                          }
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
      {renderPagination()}
    </div>
  );
}