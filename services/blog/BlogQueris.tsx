
import {useQuery} from '@tanstack/react-query'
import { fetchBlogList, fetchSingleBlog } from './BlogServices';
export const useBlogList = (page: number = 1) => {
    return useQuery({ queryKey: ['bloglist', page],
       queryFn: () =>  fetchBlogList(page ) });
  };
  interface UseSingleBlogProps {
    id: string;
  }
  export const useSingleBlog = ({id}:UseSingleBlogProps) => {
    return useQuery({ queryKey: ['blogData',id ], queryFn: () =>  fetchSingleBlog(id) });
  };