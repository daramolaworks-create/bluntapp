import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, GUEST_USER, mapSupabaseUser, signInWithEmail, signInWithOAuth, signUpWithEmail, logout as authLogout, updateUser as authUpdateUser } from '../services/authService';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
    user: User;
    isLoading: boolean;
    login: (provider: 'google' | 'apple' | 'email', email: string, password?: string) => Promise<void>;
    signup: (email: string, password: string, data: { name: string, username: string, country: string }) => Promise<void>;
    logout: () => void;
    updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>(GUEST_USER);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ? mapSupabaseUser(session.user) : GUEST_USER);
            setIsLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ? mapSupabaseUser(session.user) : GUEST_USER);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (provider: 'google' | 'apple' | 'email', email: string, password?: string) => {
        setIsLoading(true);
        try {
            if (provider === 'email') {
                if (!password) throw new Error("Password required");
                await signInWithEmail(email, password);
            } else {
                await signInWithOAuth(provider);
            }
        } catch (e) {
            console.error(e);
            throw e; // Propagate error to UI
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (email: string, password: string, data: { name: string, username: string, country: string }) => {
        setIsLoading(true);
        try {
            await signUpWithEmail(email, password, data);
        } catch (e) {
            console.error(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await authLogout();
        setUser(GUEST_USER);
    };

    const updateProfile = async (updates: Partial<User>) => {
        try {
            const updated = await authUpdateUser(updates);
            setUser(updated);
        } catch (e) {
            console.error("Failed to update profile", e);
            throw e;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
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
