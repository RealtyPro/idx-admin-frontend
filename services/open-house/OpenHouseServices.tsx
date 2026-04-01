import axiosInstance from "@/services/Api";

export interface OpenHouseSearchParams {
  page?: number;
  keyword?: string;
}

export interface OpenHousePayload {
  event_date: string;
  start_time: string;
  end_time?: string;
  description?: string;
  notes?: string;
  property_id: string;
  status?: string;
}

export interface OpenHouseProperty {
  id?: string | number;
  title?: string;
  name?: string;
  address?: string;
  location?: string;
  price?: number | string;
  bed?: number | string;
  beds?: number | string;
  bath?: number | string;
  baths?: number | string;
  sqft?: number | string;
  images?: unknown;
  image?: unknown;
  [key: string]: unknown;
}

export interface OpenHouseItem {
  id: string;
  title?: string;
  name?: string;
  status?: string;
  event_date?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  time?: string;
  description?: string;
  notes?: string;
  property_id?: string;
  property?: OpenHouseProperty;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

const OPEN_HOUSE_ENDPOINTS = ["v1/admin/openhouse"];

const isValidString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const buildQuery = (params: OpenHouseSearchParams = {}) => {
  const queryParams = new URLSearchParams();
  queryParams.append("page", String(params.page || 1));

  if (isValidString(params.keyword) && params.keyword.trim().length >= 2) {
    queryParams.append("search[keyword]", params.keyword.trim());
  }

  return queryParams.toString();
};

const tryEndpoints = async (
  requestFactory: (endpoint: string) => Promise<unknown>,
): Promise<unknown> => {
  let lastError: unknown;

  for (const endpoint of OPEN_HOUSE_ENDPOINTS) {
    try {
      return await requestFactory(endpoint);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const fetchOpenHouses = async (
  params: OpenHouseSearchParams = {},
): Promise<unknown> => {
  const query = buildQuery(params);

  return tryEndpoints(async (endpoint) => {
    const response = await axiosInstance.get(`${endpoint}?${query}`);
    return response.data;
  });
};

export const fetchSingleOpenHouse = async (id: string): Promise<unknown> => {
  return tryEndpoints(async (endpoint) => {
    const response = await axiosInstance.get(`${endpoint}/${id}`);
    return response.data;
  });
};

export const fetchPublicSingleOpenHouse = async (
  id: string,
): Promise<unknown> => {
  return tryEndpoints(async (endpoint) => {
    const response = await axiosInstance.get(`${'v1/openhouse'}?openhouse_id=${id}`);
    return response.data;
  });
};

export const createOpenHouse = async (
  payload: OpenHousePayload,
): Promise<unknown> => {
  return tryEndpoints(async (endpoint) => {
    const response = await axiosInstance.post(endpoint, payload);
    return response.data;
  });
};

export const updateOpenHouse = async (
  id: string,
  payload: Partial<OpenHousePayload>,
): Promise<unknown> => {
  return tryEndpoints(async (endpoint) => {
    const response = await axiosInstance.patch(`${endpoint}/${id}`, payload);
    return response.data;
  });
};

export const deleteOpenHouse = async (id: string): Promise<unknown> => {
  return tryEndpoints(async (endpoint) => {
    const response = await axiosInstance.delete(`${endpoint}/${id}`);
    return response.data;
  });
};
