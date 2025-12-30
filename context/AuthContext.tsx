import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, GUEST_USER, getCurrentUser, loginWithMock, logout as authLogout } from '../services/authService';

interface AuthContextType {
    user: User;
    isLoading: boolean;
    login: (provider: 'google' | 'apple' | 'email', name: string, email: string, country?: string) => Promise<void>;
    logout: () => void;
    updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>(GUEST_USER);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize user from storage
        setUser(getCurrentUser());
        setIsLoading(false);
    }, []);

    const login = async (provider: 'google' | 'apple' | 'email', name: string, email: string, country?: string) => {
        setIsLoading(true);
        try {
            const newUser = await loginWithMock(provider, name, email, country);
            setUser(newUser);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authLogout();
        setUser(GUEST_USER);
    };

    const updateProfile = (updates: Partial<User>) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('blunt_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
