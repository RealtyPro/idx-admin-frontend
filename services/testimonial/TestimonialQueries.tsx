
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchTestimonials, fetchSingleTestimonial, updateTestimonial, deleteTestimonial, TestimonialSearchParams } from './TestimonialServices';
// React Query mutation hook for updating a testimonial
export const useUpdateTestimonial = () => {
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: object }) => updateTestimonial(id, data),
	});
};

// React Query mutation hook for deleting a testimonial
export const useDeleteTestimonial = () => {
  return useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
  });
};
// React Query hook for fetching a single testimonial
export const useSingleTestimonial = (id: string) => {
	return useQuery({
		queryKey: ['testimonial', id],
		queryFn: () => fetchSingleTestimonial(id),
		enabled: !!id,
	});
};

// React Query hook for fetching testimonials
export const useTestimonials = (params: TestimonialSearchParams = {}) => {
	return useQuery({
		queryKey: ['testimonials', params],
		queryFn: () => fetchTestimonials(params),
	});
};
