import axiosInstance from '@/services/Api';

// Fetch properties (GET v1/admin/property?page=1)
export const fetchProperties = async (page: number = 1) => {
	const response = await axiosInstance.get(`v1/admin/property?page=${page}`);
	return response.data;
};

// Fetch single property (GET v1/admin/property/${id})
export const fetchSingleProperty = async (id: string) => {
	const response = await axiosInstance.get(`v1/admin/property/${id}`);
	return response.data;
};

// Delete property (DELETE v1/admin/property/${id})
export const deleteProperty = async (id: string) => {
	const response = await axiosInstance.delete(`v1/admin/property/${id}`);
	return response.data;
};

