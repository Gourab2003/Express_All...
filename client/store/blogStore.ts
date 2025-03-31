import { create } from 'zustand';
import api from '../lib/api';
import { Post, PostResponse, PaginationData } from '../types/blog';

interface BlogState {
    posts: Post[];
    loading: boolean;
    error: string | null;
    pagination: PaginationData | null;
    fetchPosts: (page: number, limit: number) => Promise<void>;
}

const useBlogStore = create<BlogState>((set) => ({
    posts: [],
    loading: false,
    error: null,
    pagination: null,

    fetchPosts: async (page: number, limit: number) => {
        set({ loading: true, error: null });
        try {
            console.log(`Fetching posts: page=${page}, limit=${limit}`);
            const response = await api.get<PostResponse>(`/blog/posts?page=${page}&limit=${limit}`);
            console.log('API Response:', response.data);
            set({
                posts: response.data.data,
                pagination: response.data.pagination,
                loading: false,
            });
        } catch (error: any) {
            console.error('Fetch Posts Error:', error);
            set({
                error: error.response?.data?.message || 'Failed to fetch posts',
                loading: false,
            });
        }
    },
}));

export default useBlogStore;