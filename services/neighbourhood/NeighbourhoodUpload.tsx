import axiosInstance from '@/services/Api';

export interface ImageObject {
  folder: string;
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
  // Generate datetime string in format: YYYY/MM/DD/HH/MM
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  // Use HH/MM format for folder structure to match API
  const datetimePath = `${year}/${month}/${day}/${hours}/${minutes}`;
  
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
  
  // If we get an image object, return it (ensure it has folder field)
  if (imageData && typeof imageData === 'object' && imageData.file && imageData.path) {
    // Fix: API sometimes returns blog path instead of neighbourhood path
    // Replace "blog/blog" with "neighbourhood/neighbourhood" if present
    if (imageData.path && imageData.path.includes('blog/blog')) {
      console.warn('API returned blog path, correcting to neighbourhood path');
      imageData.path = imageData.path.replace(/^blog\/blog/, 'neighbourhood/neighbourhood');
    }
    
    // Ensure folder field exists, if not extract from path
    if (!imageData.folder && imageData.path) {
      const pathParts = imageData.path.split('/');
      pathParts.pop(); // Remove filename
      imageData.folder = pathParts.join('/');
    } else if (imageData.folder && imageData.folder.includes('blog/blog')) {
      // Also fix folder field if it has wrong path
      imageData.folder = imageData.folder.replace(/^blog\/blog/, 'neighbourhood/neighbourhood');
    }
    
    console.log('Final image object after path correction:', imageData);
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
  
  // Construct folder path: neighbourhood/neighbourhood/YYYY/MM/DD/HH/MM
  const folderPath = `neighbourhood/neighbourhood/${datetimePath}`;
  
  // Construct full path if not provided
  const constructedPath = pathFromResponse || `${folderPath}/${generatedFileName}`;
  const fileName = pathFromResponse.split('/').pop() || generatedFileName;
  
  // Extract folder from path if we have a path from response
  const finalFolderPath = pathFromResponse ? constructedPath.substring(0, constructedPath.lastIndexOf('/')) : folderPath;
  
  // Format time as YYYY-MM-DD HH:MM:SS
  const timeString = `${year}-${month}-${day} ${hours}:${minutes}:${String(seconds).padStart(2, '0')}`;
  
  // Return the image object
  return {
    folder: finalFolderPath,
    file: fileName,
    path: constructedPath,
    disk: 'local',
    original: originalFileName,
    title: fileNameWithoutExt.replace(/[-_]/g, ' '),
    caption: fileNameWithoutExt.replace(/[-_]/g, ' '),
    time: timeString
  };
};

