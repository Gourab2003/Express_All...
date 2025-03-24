'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, User } from 'lucide-react';
import { Button } from '../ui/Button';
import useAuthStore from '../../store/authStore';

export default function Header() {
    const { user, isLoggedIn, logout } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login'; // Redirect after logout
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
            <div className="container px-4 mx-auto">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/">
                            <span className="text-xl font-bold text-gray-900">Express all..</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex md:items-center md:space-x-6">
                        <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                        <Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Articles
                        </Link>
                        <Link href="/categories" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Categories
                        </Link>
                        <Link href="/trending" className="text-gray-700 hover:text-blue-600 transition-colors">
                            Trending
                        </Link>
                        <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                            About
                        </Link>
                    </nav>

                    {/* Search and Auth */}
                    <div className="flex items-center space-x-4">
                        {/* Search Bar (Desktop) */}
                        <div className="hidden md:block relative">
                            <form className="flex items-center">
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    className="px-4 py-1 w-64 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 text-gray-500 hover:text-gray-700"
                                >
                                    <Search size={18} />
                                </button>
                            </form>
                        </div>

                        {/* Mobile Search Button */}
                        <button
                            className="md:hidden text-gray-700 hover:text-blue-600"
                            onClick={toggleSearch}
                        >
                            <Search size={22} />
                        </button>

                        {/* Auth Button / User Menu */}
                        {isLoggedIn ? (
                            <div className="relative group">
                                <button className="flex items-center justify-center p-1 rounded-full bg-gray-100 hover:bg-gray-200">
                                    {user?.name ? (
                                        <span className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-blue-600 rounded-full">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    ) : (
                                        <User size={22} className="text-gray-700" />
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                    <div className="py-1">
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Profile
                                        </Link>
                                        {user?.role === 'admin' && (
                                            <Link
                                                href="/dashboard"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Dashboard
                                            </Link>
                                        )}
                                        <Link
                                            href="/blog/create"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Write Article
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Button
                                asChild
                                variant="default"
                                size="sm"
                                className="hidden md:inline-flex"
                            >
                                <Link href="/login">Login</Link>
                            </Button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-gray-700 hover:text-blue-600"
                            onClick={toggleMenu}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {isSearchOpen && (
                    <div className="md:hidden py-3 px-2">
                        <form className="flex items-center relative">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                className="w-full px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="absolute right-6 text-gray-500 hover:text-gray-700"
                            >
                                <Search size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <nav className="md:hidden py-3 px-2 space-y-3 border-t">
                        <Link
                            href="/"
                            className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/blog"
                            className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Articles
                        </Link>
                        <Link
                            href="/categories"
                            className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Categories
                        </Link>
                        <Link
                            href="/trending"
                            className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Trending
                        </Link>
                        <Link
                            href="/about"
                            className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About
                        </Link>
                        {!isLoggedIn && (
                            <Link
                                href="/login"
                                className="block py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
}