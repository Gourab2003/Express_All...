'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginCredentials {
    email: string;
    password: string;
}

interface LoginFormProps {
    onSubmit: (credentials: LoginCredentials) => Promise<void>;
    loading?: boolean;
    error?: string | null;
}

export default function LoginForm({ onSubmit, loading = false, error }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onSubmit({ email, password });
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6 w-full">
            {/* Email Field */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                </label>
                <div className="relative mt-1">
                    <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        disabled={loading}
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="your@email.com"
                        required
                    />
                </div>
            </div>

            {/* Password Field */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <div className="relative mt-1">
                    <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-gray-700">
                        Remember me
                    </label>
                </div>
                <a href="#" className="text-blue-600 hover:underline">
                    Forgot password?
                </a>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 text-red-700 border-l-4 border-red-500 p-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Sign In Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 transition-all duration-200"
            >
                {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600 mt-4">
                Don&apos;t have an account?{' '}
                <a href="#" className="text-blue-600 hover:underline">
                    Sign up
                </a>
            </div>
        </form>
    );
}
