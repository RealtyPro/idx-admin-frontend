
import axiosInstance from '@/services/Api';

export interface EnquirySearchParams {
	page?: number;
	q?: string;
}

// Fetch enquiries (GET v1/admin/enquiry?page=1)
export const fetchEnquiries = async (params: EnquirySearchParams = {}) => {
	const { page = 1, q } = params;
	
	const queryParams = new URLSearchParams();
	queryParams.append('page', page.toString());
	
	// Only add keyword if it has at least 3 characters
	if (q && q.trim().length >= 3) {
		queryParams.append('q', q.trim());
	}
	
	const response = await axiosInstance.get(`v1/admin/enquiry?${queryParams.toString()}`);
	return response.data;
};
