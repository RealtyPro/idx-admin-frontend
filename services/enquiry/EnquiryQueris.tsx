
import { useQuery } from '@tanstack/react-query';
import { fetchEnquiries, EnquirySearchParams } from './EnquiryServices';

// React Query hook for fetching enquiries
export const useEnquiries = (params: EnquirySearchParams = {}) => {
	return useQuery({
		queryKey: ['enquiries', params],
		queryFn: () => fetchEnquiries(params),
	});
};
