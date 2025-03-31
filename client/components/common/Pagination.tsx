'use client';

import { PaginationData } from '../../types/blog';

interface PaginationProps {
    pagination: PaginationData;
    onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
    const { current, pages } = pagination;

    return (
        <div className="flex justify-center mt-8 gap-4">
            <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                onClick={() => onPageChange(Math.max(current - 1, 1))}
                disabled={current === 1}
            >
                Previous
            </button>
            <span className="self-center text-gray-600">
                Page {current} of {pages}
            </span>
            <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                onClick={() => onPageChange(Math.min(current + 1, pages))}
                disabled={current === pages}
            >
                Next
            </button>
        </div>
    );
}