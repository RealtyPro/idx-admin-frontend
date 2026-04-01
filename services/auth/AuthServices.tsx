import axiosInstance from '../Api';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  uuid: string;
}

export const registerUser = async (payload: RegisterPayload) => {
  const response = await axiosInstance.post('customer/register', payload);
  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosInstance.post('user/logout');
  return response.data;
};

export interface ForgotPasswordPayload {
  email: string;
}

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const response = await axiosInstance.post('user/forgot-user-password', payload);
  return response.data;
};

