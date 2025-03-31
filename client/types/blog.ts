import { User } from "./auth";

export interface Post {
    _id: string;
    title: string;
    content: string;
    excerpt?: string;
    slug: string;
    status: 'draft' | 'published';
    tags?: string[];
    author: User | string;
    likes: string[];
    comments: Comment[];
    createdAt: string;
    updatedAt: string; // Fixed typo
    featuredImage?: string; // ✅ Added this line
}

export interface Comment {
    _id: string;
    content: string;
    user: User | string;
    createdAt: string;
}

export interface PaginationData {
    current: number; // Fixed typo
    pages: number;
    limit: number;
    total: number;
}

export interface PostResponse {
    status: string;
    message?: string;
    data: Post[];
    pagination?: PaginationData;
}

