import axiosInstance from "../Api";
export const fetchBlogList = async (page: number = 1) => {
  const response = await axiosInstance.get(`v1/admin/blog?page=${page}`);
  console.log("response", response);
  return response.data;
}
export const fetchSingleBlog = async (id: string) => {
    const response = await axiosInstance.get(`v1/admin/blog/${id}`);
    console.log("response", response);
    return response.data;
}

export const postNewBlog = async (blogdata: any) => {
    try {
      const { imageFile, uuid, ...restData } = blogdata;
      
      // If there's an image file, send as FormData
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // Append all other fields (excluding uuid)
        Object.keys(restData).forEach(key => {
          if (restData[key] !== null && restData[key] !== undefined && key !== 'uuid') {
            if (typeof restData[key] === 'object') {
              formData.append(key, JSON.stringify(restData[key]));
            } else {
              formData.append(key, restData[key]);
            }
          }
        });
        
        const response = await axiosInstance.post('v1/admin/blog', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Send as JSON if no file - image object will be included in restData (uuid excluded)
        const response = await axiosInstance.post('v1/admin/blog', restData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  };
export const updateBlog = async (id: string, blogdata: any) => {
    try {
      const { imageFile, uuid, ...restData } = blogdata;
      
      // If there's an image file, send as FormData
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // Append all other fields (excluding uuid)
        Object.keys(restData).forEach(key => {
          if (restData[key] !== null && restData[key] !== undefined && key !== 'uuid') {
            if (typeof restData[key] === 'object') {
              formData.append(key, JSON.stringify(restData[key]));
            } else {
              formData.append(key, restData[key]);
            }
          }
        });
        
        const response = await axiosInstance.put(`v1/admin/blog/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Send as JSON if no file - image object will be included in restData (uuid excluded)
        const response = await axiosInstance.put(`v1/admin/blog/${id}`, restData);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  };

export const deleteBlog = async (id: string) => {
    try {
      const response = await axiosInstance.delete(`v1/admin/blog/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };