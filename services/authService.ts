import { supabase } from './supabaseClient';

export interface User {
    id: string;
    name: string;
    email: string;
    isGuest: boolean;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    mobile?: string;
    avatar?: string;
    country?: string;
    username?: string;
}

export const GUEST_USER: User = {
    id: 'guest',
    name: 'Ghost',
    email: '',
    isGuest: true
};

export const mapSupabaseUser = (u: any): User => {
    if (!u) return GUEST_USER;
    const metadata = u.user_metadata || {};
    return {
        id: u.id,
        email: u.email || '',
        name: metadata.name || 'User',
        isGuest: false,
        username: metadata.username,
        avatar: metadata.avatar || metadata.avatar_url || `https://ui-avatars.com/api/?name=${metadata.name || 'User'}&background=0067F5&color=fff&bold=true`,
        country: metadata.country,
        gender: metadata.gender,
        mobile: metadata.mobile
    };
};

export const getCurrentUser = async (): Promise<User> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return GUEST_USER;
    return mapSupabaseUser(session.user);
};

export const updateUser = async (updates: Partial<User>): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    // 1. Update Auth Metadata
    const { error: authError, data } = await supabase.auth.updateUser({
        data: { ...updates }
    });

    if (authError) throw authError;

    // 2. Update Public Profile
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: updates.email || user.email,
            username: updates.username || user.user_metadata.username,
            full_name: updates.name || user.user_metadata.name,
            avatar: updates.avatar || user.user_metadata.avatar
        });

    if (profileError) {
        console.error("Error updating profile table:", profileError);
        // We don't throw here because the auth update succeeded, so the session is valid.
    }

    // @ts-ignore
    return mapSupabaseUser(data.user);
};

export const signUpWithEmail = async (email: string, password: string, data: { name: string, username: string, country: string }) => {
    const { error, data: sessionData } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data
        }
    });
    if (error) throw error;
    return sessionData;
};

const resolveIdentifier = async (identifier: string): Promise<string> => {
    // If it looks like an email, assume it is one
    if (identifier.includes('@')) return identifier;

    // Otherwise, look it up in the profiles table
    const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .single();

    if (error || !data || !data.email) {
        throw new Error("Username not found");
    }

    return data.email;
};

export const signInWithEmail = async (identifier: string, password: string) => {
    const email = await resolveIdentifier(identifier);
    const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    if (error) throw error;
    return data;
};

export const signInWithOAuth = async (provider: 'google' | 'apple') => {
    const { error, data } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: window.location.origin
        }
    });
    if (error) throw error;
    return data;
};

export const logout = async () => {
    await supabase.auth.signOut();
};
