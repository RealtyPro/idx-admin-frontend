import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchNewsletterSubscribers, addNewsletterSubscriber, deleteNewsletterSubscriber } from './NewsletterServices';

// Query hook for fetching newsletter subscribers
export const useNewsletterSubscribers = (page: number = 1) => {
  return useQuery({
    queryKey: ['newsletter-subscribers', page],
    queryFn: () => fetchNewsletterSubscribers(page),
  });
};

// Mutation hook for adding a newsletter subscriber
export const useAddNewsletterSubscriber = () => {
  return useMutation({
    mutationFn: (data: object) => addNewsletterSubscriber(data),
  });
};

// Mutation hook for deleting a newsletter subscriber
export const useDeleteNewsletterSubscriber = () => {
  return useMutation({
    mutationFn: (id: string) => deleteNewsletterSubscriber(id),
  });
};
