
import axiosInstance from '@/services/Api';

// Fetch enquiries (GET v1/admin/enquiry?page=1)
export const fetchEnquiries = async (page: number = 1) => {
	const response = await axiosInstance.get(`v1/admin/enquiry?page=${page}`);
	return response.data;
};
