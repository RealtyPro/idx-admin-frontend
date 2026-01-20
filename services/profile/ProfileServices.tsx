import axiosInstance from '@/services/Api';

// Fetch profile (GET /api/profile)
export const fetchProfile = async () => {
	const response = await axiosInstance.get('profile');
	return response.data;
};

// Update profile (PUT /api/profile)
export const updateProfile = async (profileData: object) => {
	const response = await axiosInstance.put('profile', profileData);
	return response.data;
};

