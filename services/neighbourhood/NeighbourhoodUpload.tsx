import axiosInstance from '@/services/Api';

export interface ImageObject {
  file: string;
  path: string;
  disk: string;
  original: string;
  title: string;
  caption: string;
  time: string;
}

/**
 * Upload image file to the server
 * @param file - The image file to upload
 * @param config - The config path (e.g., 'idx.neighbourhood.neighbourhood.model')
 * @returns The uploaded image object with file, path, disk, original, title, caption, and time
 */
export const uploadNeighbourhoodImage = async (file: File, config: string = 'idx.neighbourhood.neighbourhood.model'): Promise<ImageObject> => {
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
  
  // The API should return the image object with the structure
  // If the response contains the image object directly, use it
  const imageData = response.data?.data || response.data?.image || response.data;
  
  // If we get an image object, return it
  if (imageData && typeof imageData === 'object' && imageData.file && imageData.path) {
    return imageData as ImageObject;
  }
  
  // If we only get a path or URL, construct the image object
  // Extract filename from the original file
  const originalFileName = file.name;
  const fileNameWithoutExt = originalFileName.replace(/\.[^/.]+$/, "");
  const fileExtension = originalFileName.split('.').pop() || '';
  
  // Generate a filename if not provided (using timestamp)
  const timestamp = Date.now();
  const generatedFileName = `${timestamp}.${fileExtension}`;
  
  // Try to extract path from response or construct it
  const uploadedPath = imageData?.path || imageData?.url || imageData;
  const pathFromResponse = typeof uploadedPath === 'string' ? uploadedPath : '';
  
  // Construct path if not provided (neighbourhood/neighbourhood/YYYY/MM/DD/HH/MM/filename)
  const constructedPath = pathFromResponse || `neighbourhood/neighbourhood/${year}/${month}/${day}/${hours}/${minutes}/${generatedFileName}`;
  const fileName = pathFromResponse.split('/').pop() || generatedFileName;
  
  // Format time as YYYY-MM-DD HH:MM:SS
  const timeString = `${year}-${month}-${day} ${hours}:${minutes}:${String(seconds).padStart(2, '0')}`;
  
  // Return the image object
  return {
    file: fileName,
    path: constructedPath,
    disk: 'local',
    original: originalFileName,
    title: fileNameWithoutExt.replace(/[-_]/g, ' '),
    caption: fileNameWithoutExt.replace(/[-_]/g, ' '),
    time: timeString
  };
};

