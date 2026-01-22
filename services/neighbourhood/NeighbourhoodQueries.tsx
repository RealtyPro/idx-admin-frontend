import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchNeighbourhoods, fetchSingleNeighbourhood, createNeighbourhood, updateNeighbourhood, deleteNeighbourhood } from './NeighbourhoodServices';

// React Query hook for fetching neighbourhoods
export const useNeighbourhoods = (page: number = 1) => {
	return useQuery({
		queryKey: ['neighbourhoods', page],
		queryFn: () => fetchNeighbourhoods(page),
	});
};

// React Query hook for fetching a single neighbourhood
export const useSingleNeighbourhood = (id: string) => {
	return useQuery({
		queryKey: ['neighbourhood', id],
		queryFn: () => fetchSingleNeighbourhood(id),
		enabled: !!id,
	});
};

// React Query mutation hook for creating a neighbourhood
export const useCreateNeighbourhood = () => {
	return useMutation({
		mutationFn: (neighbourhoodData: object) => createNeighbourhood(neighbourhoodData),
	});
};

// React Query mutation hook for updating a neighbourhood
export const useUpdateNeighbourhood = () => {
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: object }) => updateNeighbourhood(id, data),
	});
};

// React Query mutation hook for deleting a neighbourhood
export const useDeleteNeighbourhood = () => {
	return useMutation({
		mutationFn: (id: string) => deleteNeighbourhood(id),
	});
};

