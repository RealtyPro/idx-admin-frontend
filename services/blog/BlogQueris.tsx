
import {useQuery} from '@tanstack/react-query'
import { fetchBlogList, fetchSingleBlog, BlogSearchParams } from './BlogServices';
export const useBlogList = (params: BlogSearchParams = {}) => {
    return useQuery({ queryKey: ['bloglist', params],
       queryFn: () =>  fetchBlogList(params) });
  };
  interface UseSingleBlogProps {
    id: string;
  }
  export const useSingleBlog = ({id}:UseSingleBlogProps) => {
    return useQuery({ queryKey: ['blogData',id ], queryFn: () =>  fetchSingleBlog(id) });
  };