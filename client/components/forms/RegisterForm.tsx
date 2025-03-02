'use client';

import { ChangeEvent, FormEvent, useState } from "react";
import { RegisterCredentials } from "../../types/auth";

interface RegisterFormProps {
    onSubmit: (credentials: RegisterCredentials) => Promise<void>;
    loading?: boolean;
    error?: string | null;
}

export default function RegisterForm({onSubmit, loading= false, error }: RegisterFormProps){
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleUserNameChange = (e: ChangeEvent<HTMLInputElement>)=>{
        setUserName(e.target.value)
    };
    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>)=>{
        setEmail(e.target.value)
    };
    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) =>{
        setPassword(e.target.value)
    };
    const handleFormSubmit = async (e: FormEvent) =>{
        e.preventDefault();
        await onSubmit({userName, email, password})
    };


    return (
        <form onSubmit={handleFormSubmit} className="space-y-4 max-w-md mx-auto p-4 bg-white rounded shadow">
            <div>
                <label htmlFor="userName" className="block text-gray-700 font-medium mb-1">
                    Username
                </label>
                <input
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={handleUserNameChange}
                    disabled={loading}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                    required
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={loading}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                    required
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={loading}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
                    required
                />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    )
}