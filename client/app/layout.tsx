import './globals.css';
import { ReactNode } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

export const metadata = {
    title: 'My Blog',
    description: 'A blog app built with Next.js',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container mx-auto p-4">{children}</main>
                <Footer />
            </body>
        </html>
    );
}