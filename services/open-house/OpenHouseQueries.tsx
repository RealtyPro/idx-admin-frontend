import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createOpenHouse,
  deleteOpenHouse,
  fetchOpenHouses,
  fetchSingleOpenHouse,
  OpenHousePayload,
  OpenHouseSearchParams,
  updateOpenHouse,
} from "./OpenHouseServices";

export const useOpenHouses = (params: OpenHouseSearchParams = {}) => {
  return useQuery({
    queryKey: ["open-houses", params],
    queryFn: () => fetchOpenHouses(params),
  });
};

export const useSingleOpenHouse = (id: string) => {
  return useQuery({
    queryKey: ["openhouse", id],
    queryFn: () => fetchSingleOpenHouse(id),
    enabled: !!id,
  });
};

export const useCreateOpenHouse = () => {
  return useMutation({
    mutationFn: (payload: OpenHousePayload) => createOpenHouse(payload),
  });
};

export const useUpdateOpenHouse = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<OpenHousePayload> }) =>
      updateOpenHouse(id, payload),
  });
};

export const useDeleteOpenHouse = () => {
  return useMutation({
    mutationFn: (id: string) => deleteOpenHouse(id),
  });
};
