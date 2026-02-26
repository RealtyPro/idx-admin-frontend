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

export interface TestimonialSearchParams {
	page?: number;
	q?: string;
}

// Fetch testimonials (GET v1/admin/testimonial?page=1)
export const fetchTestimonials = async (params: TestimonialSearchParams = {}) => {
	const { page = 1, q } = params;
	
	const queryParams = new URLSearchParams();
	queryParams.append('page', page.toString());
	
	// Only add keyword if it has at least 3 characters
	if (q && q.trim().length >= 3) {
		queryParams.append('q', q.trim());
	}
	
	const response = await axiosInstance.get(`v1/admin/testimonial?${queryParams.toString()}`);
	return response.data;
};

// Create testimonial (POST v1/admin/testimonial)
export const createTestimonial = async (testimonialData: object) => {
  const response = await axiosInstance.post('v1/admin/testimonial', testimonialData);
  return response.data;
};

// Delete testimonial (DELETE v1/admin/testimonial/${id})
export const deleteTestimonial = async (id: string) => {
  const response = await axiosInstance.delete(`v1/admin/testimonial/${id}`);
  return response.data;
};