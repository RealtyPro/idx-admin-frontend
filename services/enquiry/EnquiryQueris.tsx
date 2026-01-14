
import { useQuery } from '@tanstack/react-query';
import { fetchEnquiries } from './EnquiryServices';

// React Query hook for fetching enquiries
export const useEnquiries = (page: number = 1) => {
	return useQuery({
		queryKey: ['enquiries', page],
		queryFn: () => fetchEnquiries(page),
	});
};
