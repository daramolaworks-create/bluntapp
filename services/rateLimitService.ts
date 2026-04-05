import { supabase } from './supabaseClient';

const RATE_STORAGE_KEY = 'blunt_rate_limits_v1';

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    max: number;
}

// Server-side rate limit check via Supabase RPC
// Falls back to localStorage if the RPC isn't available yet
export const checkLimit = async (userId: string, isGuest: boolean): Promise<RateLimitResult> => {
    // Guests always get 1 per day (client-side only since they have no DB user)
    if (isGuest) {
        return checkLocalLimit(userId, 1);
    }

    try {
        const { data, error } = await supabase.rpc('check_rate_limit', { p_user_id: userId });

        if (error || !data) {
            console.warn('[RateLimit] Server-side check failed, falling back to local:', error);
            return checkLocalLimit(userId, 10);
        }

        return {
            allowed: data.allowed,
            remaining: data.remaining,
            max: data.max
        };
    } catch (e) {
        console.warn('[RateLimit] RPC unavailable, using local fallback:', e);
        return checkLocalLimit(userId, 10);
    }
};

// Local fallback (for guests and when server is unreachable)
const checkLocalLimit = (userId: string, max: number): RateLimitResult => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const data = localStorage.getItem(RATE_STORAGE_KEY);
        const store = data ? JSON.parse(data) : {};
        const usage = store[userId];

        if (!usage || usage.date !== today) {
            return { allowed: true, remaining: max, max };
        }

        const remaining = Math.max(0, max - usage.count);
        return { allowed: remaining > 0, remaining, max };
    } catch {
        return { allowed: true, remaining: max, max };
    }
};

// Increment local counter (still useful as a quick client-side guard)
export const incrementUsage = (userId: string): void => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const data = localStorage.getItem(RATE_STORAGE_KEY);
        const store = data ? JSON.parse(data) : {};
        const usage = store[userId];

        if (!usage || usage.date !== today) {
            store[userId] = { date: today, count: 1 };
        } else {
            store[userId].count += 1;
        }

        localStorage.setItem(RATE_STORAGE_KEY, JSON.stringify(store));
    } catch {
        // Silently fail
    }
};
