import axiosInstance from '@/services/Api';

// Fetch pages (GET v1/admin/page?page=1)
export const fetchPages = async (page: number = 1) => {
	const response = await axiosInstance.get(`v1/admin/page?page=${page}`);
	return response.data;
};

// Fetch single page (GET v1/admin/page/${id})
export const fetchSinglePage = async (id: string) => {
	const response = await axiosInstance.get(`v1/admin/page/${id}`);
	return response.data;
};

// Create page (POST v1/admin/page)
export const createPage = async (pageData: object) => {
	const response = await axiosInstance.post('v1/admin/page', pageData);
	return response.data;
};

// Update page (PUT v1/admin/page/${id})
export const updatePage = async (id: string, pageData: object) => {
	const response = await axiosInstance.put(`v1/admin/page/${id}`, pageData);
	return response.data;
};

// Delete page (DELETE v1/admin/page/${id})
export const deletePage = async (id: string) => {
	const response = await axiosInstance.delete(`v1/admin/page/${id}`);
	return response.data;
};

