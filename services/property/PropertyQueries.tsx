import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchProperties, fetchSingleProperty, deleteProperty, PropertySearchParams } from './PropertyServices';

// React Query hook for fetching properties
export const useProperties = (params: PropertySearchParams = {}) => {
	return useQuery({
		queryKey: ['properties', params],
		queryFn: () => fetchProperties(params),
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

