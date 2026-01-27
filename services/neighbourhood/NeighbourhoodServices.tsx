import axiosInstance from '@/services/Api';

// Fetch neighbourhoods (GET v1/admin/neighbourhood?page=1)
export const fetchNeighbourhoods = async (page: number = 1) => {
	const response = await axiosInstance.get(`v1/admin/neighbourhood?page=${page}`);
	return response.data;
};

// Fetch single neighbourhood (GET v1/admin/neighbourhood/${id})
export const fetchSingleNeighbourhood = async (id: string) => {
	const response = await axiosInstance.get(`v1/admin/neighbourhood/${id}`);
	return response.data;
};

// Create neighbourhood (POST v1/admin/neighbourhood)
export const createNeighbourhood = async (neighbourhoodData: any) => {
	const { imageFile, ...restData } = neighbourhoodData;

	console.log('createNeighbourhood - neighbourhoodData:', neighbourhoodData);
	console.log('createNeighbourhood - imageFile:', imageFile);
	console.log('createNeighbourhood - restData:', restData);

	// If there's an image file, send as FormData
	if (imageFile) {
		const formData = new FormData();

		formData.append('image', imageFile);

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

		const response = await axiosInstance.post('v1/admin/neighbourhood', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} else {
		// Send as JSON if no file - images object will be included in restData
		console.log('Sending as JSON with images object:', restData.images);
		const response = await axiosInstance.post('v1/admin/neighbourhood', restData);
		return response.data;
	}
};

// Update neighbourhood (PUT v1/admin/neighbourhood/${id})
export const updateNeighbourhood = async (id: string, neighbourhoodData: any) => {
	const { imageFile, ...restData } = neighbourhoodData;

	console.log('updateNeighbourhood - id:', id);
	console.log('updateNeighbourhood - neighbourhoodData:', neighbourhoodData);
	console.log('updateNeighbourhood - imageFile:', imageFile);
	console.log('updateNeighbourhood - restData:', restData);

	// If there's an image file, send as FormData
	if (imageFile) {
		const formData = new FormData();

		formData.append('image', imageFile);

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

		const response = await axiosInstance.put(`v1/admin/neighbourhood/${id}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} else {
		// Send as JSON if no file - images object will be included in restData
		console.log('Sending as JSON with images object:', restData.images);
		const response = await axiosInstance.put(`v1/admin/neighbourhood/${id}`, restData);
		return response.data;
	}
};

// Delete neighbourhood (DELETE v1/admin/neighbourhood/${id})
export const deleteNeighbourhood = async (id: string) => {
	const response = await axiosInstance.delete(`v1/admin/neighbourhood/${id}`);
	return response.data;
};

