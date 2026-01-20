import { useMutation } from '@tanstack/react-query';
import { logoutUser } from './AuthServices';

export const useLogout = () => {
  return useMutation({
    mutationFn: logoutUser,
  });
};

