import axiosInstance from "../Api";
export const fetchBlogList = async (page: number = 1) => {
  const response = await axiosInstance.get(`v1/admin/blog?page=${page}`);
  console.log("response", response);
  return response.data;
}
export const  fetchSingleBlog =async (id:string) =>{
    const response = await axiosInstance.get(`/blog/admin/${id}`);
    console.log("response",response)
    return response.data;
}

export const postNewBlog = async (blogdata:object) => {

    try {
      const response = await axiosInstance.post('/blog', blogdata);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  export const deleteBlog = async (id:string) => {

    try {
      const response = await axiosInstance.delete('/blog/'+id);
      return response.data;
    } catch (error) {
      throw error;
    }
  };