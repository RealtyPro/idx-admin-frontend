import axiosInstance from '@/services/Api';

/**
 * Upload image file to the server
 * @param file - The image file to upload
 * @param config - The config path (e.g., 'idx.neighbourhood.neighbourhood.model')
 * @returns The uploaded image URL
 */
export const uploadNeighbourhoodImage = async (file: File, config: string = 'idx.neighbourhood.neighbourhood.model'): Promise<string> => {
  // Generate datetime string in format: YYYY/MM/DD/HHMMSSXXX
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  const datetimePath = `${year}/${month}/${day}/${hours}${minutes}${seconds}${milliseconds}`;
  
  // Generate upload URL
  const uploadUrl = `filer/upload/${config}/${datetimePath}/image`;
  
  // Create FormData
  const formData = new FormData();
  formData.append('image', file);
  
  // Upload the file
  const response = await axiosInstance.post(uploadUrl, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Return the uploaded image URL or path
  // The API should return the full URL or path to the uploaded image
  // If the API returns a relative path, construct the full URL
  const baseUrl = axiosInstance.defaults.baseURL || 'https://demorealestate2.webnapps.net/api/';
  const uploadedPath = response.data?.url || response.data?.path || response.data?.data?.url || response.data?.data?.path;
  
  // If the path is already a full URL, return it
  if (uploadedPath && (uploadedPath.startsWith('http://') || uploadedPath.startsWith('https://'))) {
    return uploadedPath;
  }
  
  // If it's a relative path, construct the full URL
  if (uploadedPath) {
    return uploadedPath.startsWith('/') 
      ? `${baseUrl.replace(/\/$/, '')}${uploadedPath}`
      : `${baseUrl.replace(/\/$/, '')}/${uploadedPath}`;
  }
  
  // Fallback: construct the full URL from the upload endpoint
  return `${baseUrl.replace(/\/$/, '')}/${uploadUrl}`;
};

