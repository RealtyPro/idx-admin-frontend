import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchNewsletterSubscribers, addNewsletterSubscriber, deleteNewsletterSubscriber, NewsletterSearchParams } from './NewsletterServices';

// Query hook for fetching newsletter subscribers
export const useNewsletterSubscribers = (params: NewsletterSearchParams = {}) => {
  return useQuery({
    queryKey: ['newsletter-subscribers', params],
    queryFn: () => fetchNewsletterSubscribers(params),
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
