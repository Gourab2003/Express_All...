import Link from 'next/link';
import Image from 'next/image';
import { Post } from '../../types/blog';

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    return (
        <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden">
            {/* Image */}
            <div className="h-48 w-full relative">
                <Image
                    src={post.featuredImage || 'https://picsum.photos/400/200'} // Use picsum.photos as fallback
                    alt={post.title}
                    fill // Replaces layout="fill"
                    className="object-cover" // Use className for styling
                    priority // Optional: improves LCP for above-the-fold images
                />
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <Link href={`/blog/${post.slug}`} passHref>
                    <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer">
                        {post.title}
                    </h2>
                </Link>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}