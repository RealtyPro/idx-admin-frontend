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
export const createPage = async (pageData: any) => {
	const { bannerFile, ...restData } = pageData;

	// If there's a banner image file, send as FormData
	if (bannerFile) {
		const formData = new FormData();

		formData.append('banner', bannerFile);

		// Append all other fields
		Object.keys(restData).forEach((key) => {
			const value = (restData as any)[key];
			if (value !== null && value !== undefined) {
				if (typeof value === 'object') {
					formData.append(key, JSON.stringify(value));
				} else {
					formData.append(key, value);
				}
			}
		});

		const response = await axiosInstance.post('v1/admin/page', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} else {
		// Send as JSON if no file
		const response = await axiosInstance.post('v1/admin/page', restData);
		return response.data;
	}
};

// Update page (PUT v1/admin/page/${id})
export const updatePage = async (id: string, pageData: any) => {
	const { bannerFile, ...restData } = pageData;

	// If there's a banner image file, send as FormData
	if (bannerFile) {
		const formData = new FormData();

		formData.append('banner', bannerFile);

		// Append all other fields
		Object.keys(restData).forEach((key) => {
			const value = (restData as any)[key];
			if (value !== null && value !== undefined) {
				if (typeof value === 'object') {
					formData.append(key, JSON.stringify(value));
				} else {
					formData.append(key, value);
				}
			}
		});

		const response = await axiosInstance.put(`v1/admin/page/${id}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} else {
		// Send as JSON if no file
		const response = await axiosInstance.put(`v1/admin/page/${id}`, restData);
		return response.data;
	}
};

// Delete page (DELETE v1/admin/page/${id})
export const deletePage = async (id: string) => {
	const response = await axiosInstance.delete(`v1/admin/page/${id}`);
	return response.data;
};

