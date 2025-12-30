import React, { useState, useEffect } from 'react';
import { X, Search, Clock, TrendingUp } from 'lucide-react';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
}

const RECENT_SEARCHES_KEY = 'blunt_recent_searches';
const MAX_RECENT_SEARCHES = 5;

const TRENDING_TOPICS = [
    'Workplace',
    'Personal',
    'Safety',
    'Relationships',
    'Mental Health'
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        // Load recent searches from localStorage
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
        }
    }, [isOpen]);

    const saveSearch = (query: string) => {
        if (!query.trim()) return;

        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, MAX_RECENT_SEARCHES);
        setRecentSearches(updated);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    };

    const handleSearch = (query: string) => {
        if (!query.trim()) return;

        saveSearch(query);
        onSearch(query);
        onClose();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(searchQuery);
        }
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Search Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl animate-slide-up overflow-hidden">
                {/* Search Input */}
                <div className="p-6 border-b border-brand-cream">
                    <div className="flex items-center gap-3">
                        <Search size={24} className="text-brand-deep/40" />
                        <input
                            type="text"
                            placeholder="Search feed..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            autoFocus
                            className="flex-1 text-lg font-medium text-brand-deep placeholder:text-brand-deep/30 outline-none bg-transparent"
                        />
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-brand-surface rounded-xl transition-colors"
                        >
                            <X size={20} className="text-brand-deep/60" />
                        </button>
                    </div>
                    <p className="text-xs text-brand-deep/40 mt-2">Press Enter to search</p>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                        <div className="p-6 border-b border-brand-cream">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-brand-deep uppercase tracking-wide">Recent</h3>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-brand-bright hover:underline font-bold"
                                >
                                    Clear all
                                </button>
                            </div>
                            <div className="space-y-2">
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSearch(search)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-brand-surface rounded-xl transition-colors text-left"
                                    >
                                        <Clock size={18} className="text-brand-deep/40 shrink-0" />
                                        <span className="text-brand-deep font-medium">{search}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trending Topics */}
                    <div className="p-6">
                        <h3 className="text-sm font-bold text-brand-deep uppercase tracking-wide mb-4">Trending</h3>
                        <div className="space-y-2">
                            {TRENDING_TOPICS.map((topic, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearch(topic)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-brand-surface rounded-xl transition-colors text-left"
                                >
                                    <TrendingUp size={18} className="text-brand-bright shrink-0" />
                                    <span className="text-brand-deep font-medium">{topic}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
