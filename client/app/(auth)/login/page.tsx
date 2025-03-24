'use client';

import { useState } from 'react';
import Link from 'next/link';
import useAuthStore from '../../../store/authStore';
import LoginForm from '../../../components/forms/LoginForm';
import { LoginCredentials } from '../../../types/auth';

export default function LoginPage() {
    const { login, user, isLoading, error: storeError } = useAuthStore();
    const [formError, setFormError] = useState<string | null>(null);

    const handleLogin = async (credentials: LoginCredentials) => {
        try {
            await login(credentials);
            window.location.href = '/';
        } catch (error) {
            console.error('Login error:', error);
            setFormError(storeError || 'Login failed');
        }
    };

    if (user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-green-600 text-lg font-semibold">Logged in as {user.email}</p>
                    <Link href="/" className="text-blue-600 hover:underline">
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>
                <LoginForm onSubmit={handleLogin} loading={isLoading} error={formError} />
            </div>
        </div>
    );
}
