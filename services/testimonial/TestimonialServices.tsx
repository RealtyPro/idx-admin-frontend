// Update testimonial (PUT v1/admin/testimonial/${id})
export const updateTestimonial = async (id: string, testimonialData: object) => {
	const response = await axiosInstance.put(`v1/admin/testimonial/${id}`, testimonialData);
	return response.data;
};
// Fetch single testimonial (GET v1/admin/testimonial/${id})
export const fetchSingleTestimonial = async (id: string) => {
	const response = await axiosInstance.get(`v1/admin/testimonial/${id}`);
	return response.data;
};

import axiosInstance from '@/services/Api';

// Fetch testimonials (GET v1/admin/testimonial?page=1)
export const fetchTestimonials = async (page: number = 1) => {
	const response = await axiosInstance.get(`v1/admin/testimonial?page=${page}`);
	return response.data;
};

// Create testimonial (POST v1/admin/testimonial)
export const createTestimonial = async (testimonialData: object) => {
  const response = await axiosInstance.post('v1/admin/testimonial', testimonialData);
  return response.data;
};
