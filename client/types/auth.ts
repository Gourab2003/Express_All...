export interface User {
    _id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
};


export interface AuthResponse {
    status: string;
    message?: string;
    data: {
        user: User;
        token: string;
    }
};

export interface LoginCredentials {
    email: string;
    password: string;
};

export interface RegisterCredentials {
    email: string;
    userName: string;
    password: string;
};
