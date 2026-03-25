import axiosInstance from "@/services/Api";

export interface PropertySearchParams {
  page?: number;
  bath_min?: string;
  bath_max?: string;
  bed_min?: string;
  bed_max?: string;
  keyword?: string;
}

// Fetch properties (GET v1/admin/property?page=1)
export const fetchProperties = async (params: PropertySearchParams = {}) => {
  const { page = 1, bath_min, bath_max, bed_min, bed_max, keyword } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());

  if (bath_min) queryParams.append("search[bath_min]", bath_min);
  if (bath_max) queryParams.append("search[bath_max]", bath_max);
  if (bed_min) queryParams.append("search[bed_min]", bed_min);
  if (bed_max) queryParams.append("search[bed_max]", bed_max);
  // Only add keyword if it has at least 3 characters
  if (keyword && keyword.trim().length >= 3)
    queryParams.append("search[keyword]", keyword);

  const response = await axiosInstance.get(
    `v1/admin/property?${queryParams.toString()}`,
  );
  return response.data;
};

// Search properties (GET https://adminapi.realtipro.com/api/v1/properties/search)
export const searchProperties = async (keyword: string) => {
  const queryParams = new URLSearchParams();
  queryParams.append("page", "1");

  // Only add keyword if it has at least 3 characters
  if (keyword && keyword.trim().length >= 2)
    queryParams.append("search[keyword]", keyword);

  // const response = await axiosInstance.get('v1/properties/search', { params });
  const response = await axiosInstance.get(
    `v1/admin/property?${queryParams.toString()}`,
  );
  return response.data;
};

// Fetch single property (GET v1/admin/property/${id})
export const fetchSingleProperty = async (id: string) => {
  const response = await axiosInstance.get(`v1/admin/property/${id}`);
  return response.data;
};

// Delete property (DELETE v1/admin/property/${id})
export const deleteProperty = async (id: string) => {
  const response = await axiosInstance.delete(`v1/admin/property/${id}`);
  return response.data;
};

// Add featured (PATCH v1/admin/property/action/${id}/feature)
export const addFeaturedProperty = async (id: string) => {
  const response = await axiosInstance.patch(
    `v1/admin/property/action/${id}/feature`,
    { is_featured: 1 },
  );
  return response.data;
};

// Remove featured (PATCH v1/admin/property/action/${id}/feature)
export const removeFeaturedProperty = async (id: string) => {
  const response = await axiosInstance.patch(
    `v1/admin/property/action/${id}/feature`,
    { is_featured: 0 },
  );
  return response.data;
};
