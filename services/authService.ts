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

const USER_STORAGE_KEY = 'blunt_user_v1';

export const getCurrentUser = (): User => {
    try {
        const stored = localStorage.getItem(USER_STORAGE_KEY);
        if (!stored) return GUEST_USER;

        const parsed = JSON.parse(stored);
        // Backfill missing fields for existing users
        if (!parsed.username && !parsed.isGuest) {
            parsed.username = `@${parsed.name.replace(/\s+/g, '').toLowerCase()}${Math.floor(Math.random() * 1000)}`;
        }
        if (!parsed.avatar && !parsed.isGuest) {
            parsed.avatar = `https://ui-avatars.com/api/?name=${parsed.name}&background=0067F5&color=fff&bold=true`;
        }
        return parsed;
    } catch {
        return GUEST_USER;
    }
};

export const updateUser = (updates: Partial<User>): User => {
    const current = getCurrentUser();
    if (current.isGuest) throw new Error("Guests cannot update profile");

    const updated = { ...current, ...updates };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    return updated;
};

export const loginWithMock = async (provider: 'google' | 'apple' | 'email', name: string, email: string, country?: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        isGuest: false,
        country: country || 'US', // Default to US if not provided
        avatar: provider === 'google'
            ? `https://ui-avatars.com/api/?name=${name}&background=DB4437&color=fff&bold=true`
            : `https://ui-avatars.com/api/?name=${name}&background=0067F5&color=fff&bold=true`
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
};

export const logout = (): void => {
    localStorage.removeItem(USER_STORAGE_KEY);
    // Optional: clear rate limits on logout? Maybe keep them per device ID in future.
};
