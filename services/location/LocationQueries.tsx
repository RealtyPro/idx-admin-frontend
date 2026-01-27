import { useQuery } from '@tanstack/react-query';
import { getStates, getCountiesByState, getCitiesByCounty } from './LocationServices';

// Hook to fetch all states
export const useStates = () => {
  return useQuery({
    queryKey: ['states'],
    queryFn: getStates,
    enabled: true,
  });
};

// Hook to fetch counties by state/region_id
export const useCountiesByState = (region_id?: string) => {
  return useQuery({
    queryKey: ['counties', region_id],
    queryFn: () => getCountiesByState(region_id!),
    enabled: !!region_id,
  });
};

// Hook to fetch cities by county_id
export const useCitiesByCounty = (county_id?: string) => {
  return useQuery({
    queryKey: ['cities', county_id],
    queryFn: () => getCitiesByCounty(county_id!),
    enabled: !!county_id,
  });
};

