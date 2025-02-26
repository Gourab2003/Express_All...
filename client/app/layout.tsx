import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
    title: 'My Blog',
    description: 'A blog app built with Next.js',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-gray-100 min-h-screen">{children}</body>
        </html>
    );
}