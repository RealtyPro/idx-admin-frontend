import axiosInstance from '@/services/Api';

// Fetch newsletter subscribers (GET v1/admin/newsletter?page=1)
export const fetchNewsletterSubscribers = async (page: number = 1) => {
  const response = await axiosInstance.get(`v1/admin/newsletter?page=${page}`);
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
