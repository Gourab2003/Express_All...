'use client';

import { useEffect, useState } from 'react';
import useBlogStore from '../store/blogStore';
import PostCard from '../components/blog/PostCard';
import Pagination from '../components/common/Pagination'

export default function HomePage() {
    const { posts, loading, error, pagination, fetchPosts } = useBlogStore();
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchPosts(currentPage, 6); // Fetch posts for current page
    }, [fetchPosts, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-600">Loading posts...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    if (!posts.length) {
        return <div className="text-center py-8 text-gray-600">No posts available.</div>;
    }

    return (
        <div className="min-h-screen">
            <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Welcome to BlogApp</h1>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
                {pagination && (
                    <Pagination pagination={pagination} onPageChange={handlePageChange} />
                )}
            </div>
        </div>
    );
}