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
 * Upload company logo image file to the server
 * @param file - The image file to upload
 * @param config - The config path (e.g., 'idx.company.logo')
 * @returns The uploaded image object
 */
export const uploadCompanyLogo = async (file: File, config: string = 'idx.company.logo'): Promise<ImageObject> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const datetimePath = `${year}/${month}/${day}/${hours}/${minutes}`;
  const uploadUrl = `filer/upload/${config}/${datetimePath}/image`;
  const formData = new FormData();
  formData.append('image', file);
  const response = await axiosInstance.post(uploadUrl, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const imageData = response.data?.data || response.data?.image || response.data;
  if (imageData && typeof imageData === 'object' && imageData.file && imageData.path) {
    if (!imageData.folder && imageData.path) {
      const pathParts = imageData.path.split('/');
      pathParts.pop();
      imageData.folder = pathParts.join('/');
    }
    return imageData as ImageObject;
  }
  const originalFileName = file.name;
  const fileNameWithoutExt = originalFileName.replace(/\.[^/.]+$/, "");
  const fileExtension = originalFileName.split('.').pop() || '';
  const timestamp = Date.now();
  const generatedFileName = `${timestamp}.${fileExtension}`;
  const uploadedPath = imageData?.path || imageData?.url || imageData;
  const pathFromResponse = typeof uploadedPath === 'string' ? uploadedPath : '';
  const folderPath = `company/logo/${datetimePath}`;
  const constructedPath = pathFromResponse || `${folderPath}/${generatedFileName}`;
  const fileName = pathFromResponse.split('/').pop() || generatedFileName;
  const finalFolderPath = pathFromResponse ? constructedPath.substring(0, constructedPath.lastIndexOf('/')) : folderPath;
  const timeString = `${year}-${month}-${day} ${hours}:${minutes}`;
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
