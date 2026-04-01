import api from '@/services/Api';

// Get all states
export const getStates = async () => {
  const response = await api.patch('admin/location/actions/options', {});
  return response.data;
};

// Get counties by state/region_id
export const getCountiesByState = async (region_id: string) => {
  const response = await api.patch('admin/location/actions/get_locations_by_parent', { region_id });
  return response.data;
};

// Get cities by county_id
export const getCitiesByCounty = async (county_id: string) => {
  const response = await api.patch('admin/location/actions/get_locations_by_parent', { county_id });
  return response.data;
};

