import axiosInstance from '@/services/Api';

export interface NeighbourhoodSearchParams {
  page?: number;
  city_id?: string;
  region_id?: string;
  county_id?: string;
  keyword?: string;
}

// Fetch neighbourhoods (GET v1/admin/neighbourhood?page=1)
export const fetchNeighbourhoods = async (params: NeighbourhoodSearchParams = {}) => {
	const { page = 1, city_id, region_id, county_id, keyword } = params;
	
	const queryParts: string[] = [];
	
	if (city_id) {
		queryParts.push(`city_id:=,${city_id}`);
	}
	
	if (region_id) {
		queryParts.push(`region_id:=,${region_id}`);
	}
	
	if (county_id) {
		queryParts.push(`county_id:=,${county_id}`);
	}

	if (keyword && keyword.trim().length >= 3) {
		queryParts.push(`keyword:LIKE,${keyword.trim()}`);
	}
	
	const queryParams = new URLSearchParams();
	queryParams.append('page', page.toString());
	
	if (queryParts.length > 0) {
		queryParams.append('q', queryParts.join(';'));
	}
	
	const response = await axiosInstance.get(`v1/admin/neighbourhood?${queryParams.toString()}`);
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

