import { useMutation } from '@tanstack/react-query';
import { logoutUser, registerUser, RegisterPayload } from './AuthServices';

export const useRegister = () => {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logoutUser,
  });
};

