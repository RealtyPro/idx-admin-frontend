import axiosInstance from '../Api';

export const logoutUser = async () => {
  const response = await axiosInstance.post('user/logout');
  return response.data;
};

