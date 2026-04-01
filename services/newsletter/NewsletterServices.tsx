import axiosInstance from '@/services/Api';

export interface NewsletterSearchParams {
  page?: number;
  q?: string;
}

// Fetch newsletter subscribers (GET v1/admin/newsletter?page=1)
export const fetchNewsletterSubscribers = async (params: NewsletterSearchParams = {}) => {
  const { page = 1, q } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  
  // Only add keyword if it has at least 3 characters
  if (q && q.trim().length >= 3) {
    queryParams.append('q', q.trim());
  }
  
  const response = await axiosInstance.get(`v1/admin/newsletter?${queryParams.toString()}`);
  return response.data;
};

// Add newsletter subscriber (POST v1/admin/newsletter)
export const addNewsletterSubscriber = async (subscriberData: object) => {
  const response = await axiosInstance.post('v1/admin/newsletter', subscriberData);
  return response.data;
};

// Delete newsletter subscriber (DELETE v1/admin/newsletter/{id})
export const deleteNewsletterSubscriber = async (id: string) => {
  const response = await axiosInstance.delete(`v1/admin/newsletter/${id}`);
  return response.data;
};
