import axiosInstance from '@/services/Api';

// Upload profile photo
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

export const uploadProfilePhoto = async (file: File): Promise<ImageObject> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const mmss = `${minutes}${seconds}`;
  const datetimePath = `${year}/${month}/${day}/${hours}/${mmss}`;
  const uploadUrl = `filer/upload/user.user.model/${datetimePath}/photo`;
  const formData = new FormData();
  formData.append('photo', file);
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
  const folderPath = `user/user/${datetimePath}`;
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
