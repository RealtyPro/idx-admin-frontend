import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchProperties, fetchSingleProperty, deleteProperty } from './PropertyServices';

// React Query hook for fetching properties
export const useProperties = (page: number = 1) => {
	return useQuery({
		queryKey: ['properties', page],
		queryFn: () => fetchProperties(page),
	});
};

// React Query hook for fetching a single property
export const useSingleProperty = (id: string) => {
	return useQuery({
		queryKey: ['property', id],
		queryFn: () => fetchSingleProperty(id),
		enabled: !!id,
	});
};

// React Query mutation hook for deleting a property
export const useDeleteProperty = () => {
	return useMutation({
		mutationFn: (id: string) => deleteProperty(id),
	});
};

