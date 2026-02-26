import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchProfile, updateProfile } from './ProfileServices';

// React Query hook for fetching profile
export const useProfile = () => {
	return useQuery({
		queryKey: ['profile'],
		queryFn: () => fetchProfile(),
	});
};

// React Query mutation hook for updating profile
export const useUpdateProfile = () => {
	return useMutation({
		mutationFn: (profileData: object) => updateProfile(profileData),
	});
};

