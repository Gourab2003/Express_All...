'use client';

import { useState } from 'react';
import useAuthStore from '../../../store/authStore';
import RegisterForm from '../../../components/forms/RegisterForm';
import { RegisterCredentials } from '../../../types/auth';
import Link from 'next/link';

export default function RegisterPage() {
    const { register, user, isLoading, error: storeError } = useAuthStore();
    const [formError, setFormError] = useState<string | null>(null);

    const handleRegister = async (credentials: RegisterCredentials) => {
        try {
            await register(credentials);
            window.location.href = '/login'; // Redirect to login on success
        } catch (err) {
            console.log('Register error:', err);
            setFormError(storeError || 'Registration failed');
        }
    };

    if (user) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p className="text-green-600">You are already logged in as {user.email}</p>
                <Link href="/" className="text-blue-500 hover:underline">Go to Homepage</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Register</h1>
                <RegisterForm onSubmit={handleRegister} loading={isLoading} error={formError} />
                <p className="mt-4 text-center text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}