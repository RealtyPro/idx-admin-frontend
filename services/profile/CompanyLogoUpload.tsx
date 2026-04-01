import axiosInstance from '@/services/Api';

/**
 * Convert any image File to a JPEG File using the Canvas API.
 * Returns the original file unchanged if it is already JPEG.
 */
const toJpeg = (file: File, quality = 0.92): Promise<File> => {
  if (file.type === 'image/jpeg') return Promise.resolve(file);
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        blob => {
          if (!blob) return reject(new Error('Conversion failed'));
          const jpegName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
          resolve(new File([blob], jpegName, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
};

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
export const uploadCompanyLogo = async (file: File): Promise<ImageObject> => {
  // file = await toJpeg(file);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const mmss = `${minutes}${seconds}`;
  const datetimePath = `${year}/${month}/${day}/${hours}/${mmss}`;
  const uploadUrl = `filer/upload/user.user.model/${datetimePath}/company_logo`;
  const formData = new FormData();
  formData.append('company_logo', file);
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
