import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchPages, fetchSinglePage, createPage, updatePage, deletePage } from './PageServices';

// React Query hook for fetching pages
export const usePages = (page: number = 1) => {
	return useQuery({
		queryKey: ['pages', page],
		queryFn: () => fetchPages(page),
	});
};

// React Query hook for fetching a single page
export const useSinglePage = (id: string) => {
	return useQuery({
		queryKey: ['page', id],
		queryFn: () => fetchSinglePage(id),
		enabled: !!id,
	});
};

// React Query mutation hook for creating a page
export const useCreatePage = () => {
	return useMutation({
		mutationFn: (pageData: object) => createPage(pageData),
	});
};

// React Query mutation hook for updating a page
export const useUpdatePage = () => {
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: object }) => updatePage(id, data),
	});
};

// React Query mutation hook for deleting a page
export const useDeletePage = () => {
	return useMutation({
		mutationFn: (id: string) => deletePage(id),
	});
};

