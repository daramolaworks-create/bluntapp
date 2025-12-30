const RATE_STORAGE_KEY = 'blunt_rate_limits_v1';

interface DailyUsage {
    date: string; // YYYY-MM-DD
    count: number;
}

interface RateLimitStore {
    [userId: string]: DailyUsage;
}

export const getTodayString = (): string => {
    return new Date().toISOString().split('T')[0];
};

const getStore = (): RateLimitStore => {
    try {
        const data = localStorage.getItem(RATE_STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
};

export const checkLimit = (userId: string, isGuest: boolean): { allowed: boolean; remaining: number; max: number } => {
    const store = getStore();
    const today = getTodayString();
    const usage = store[userId];

    const max = isGuest ? 1 : 10;

    if (!usage || usage.date !== today) {
        return { allowed: true, remaining: max, max };
    }

    const remaining = Math.max(0, max - usage.count);
    return { allowed: remaining > 0, remaining, max };
};

export const incrementUsage = (userId: string): void => {
    const store = getStore();
    const today = getTodayString();
    const usage = store[userId];

    if (!usage || usage.date !== today) {
        store[userId] = { date: today, count: 1 };
    } else {
        store[userId].count += 1;
    }

    localStorage.setItem(RATE_STORAGE_KEY, JSON.stringify(store));
};
