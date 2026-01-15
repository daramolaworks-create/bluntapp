import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Moon, Sun, Monitor, Smartphone, Mail, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from './Input';
import { Button } from './Button';

import { AVATAR_OPTIONS } from '../constants/avatars';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'appearance'>('profile');

    // Profile State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [gender, setGender] = useState('prefer_not_to_say');
    const [avatar, setAvatar] = useState('');

    // Theme State
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(user.name);
            setEmail(user.email);
            setMobile(user.mobile || '');
            setGender(user.gender || 'prefer_not_to_say');
            setAvatar(user.avatar || AVATAR_OPTIONS[0]);
            setIsDark(document.documentElement.classList.contains('dark'));
        }
    }, [isOpen, user]);

    const handleSaveProfile = () => {
        updateProfile({ name, email, mobile, gender: gender as any, avatar });
        onClose();
    };

    const toggleTheme = () => {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-brand-deep/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-brand-cream dark:bg-brand-surface rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-white/50 dark:border-white/10">

                {/* Header */}
                <div className="p-6 border-b border-brand-deep/5 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20">
                    <h2 className="text-xl font-black text-brand-deep dark:text-white">Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-brand-deep/5 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-brand-deep dark:text-white" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 bg-brand-deep/5 dark:bg-white/5 m-4 rounded-xl">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'profile'
                            ? 'bg-white dark:bg-brand-bright text-brand-deep dark:text-white shadow-sm'
                            : 'text-brand-deep/60 dark:text-white/60 hover:text-brand-deep dark:hover:text-white'
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'appearance'
                            ? 'bg-white dark:bg-brand-bright text-brand-deep dark:text-white shadow-sm'
                            : 'text-brand-deep/60 dark:text-white/60 hover:text-brand-deep dark:hover:text-white'
                            }`}
                    >
                        Appearance
                    </button>
                </div>

                <div className="p-6 pt-2 h-[400px] overflow-y-auto">
                    {activeTab === 'profile' ? (
                        <div className="space-y-6">
                            {user.isGuest ? (
                                <div className="text-center py-8">
                                    <p className="text-brand-deep/60 dark:text-white/60 text-sm mb-4">Sign up to manage your profile.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Avatar Selection */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={avatar}
                                                alt="Current Avatar"
                                                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-gray-100"
                                            />
                                            <div className="absolute bottom-0 right-0 p-1.5 bg-brand-deep rounded-full text-white shadow-md">
                                                <UserIcon size={12} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2 w-full max-w-xs justify-items-center">
                                            {AVATAR_OPTIONS.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setAvatar(opt)}
                                                    className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all hover:scale-110 ${avatar === opt ? 'border-brand-deep ring-2 ring-brand-deep/20 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                                                        }`}
                                                >
                                                    <img src={opt} className="w-full h-full object-cover" alt={`Avatar option ${idx + 1}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} icon={<UserIcon size={16} />} />
                                        <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={16} />} />
                                        <Input label="Mobile" value={mobile} onChange={e => setMobile(e.target.value)} icon={<Smartphone size={16} />} placeholder="+1 (555) 000-0000" />

                                        <div className="flex flex-col gap-2 w-full">
                                            <label className="font-bold text-xs text-brand-deep/60 dark:text-white/60 uppercase tracking-wider ml-4">Gender</label>
                                            <select
                                                value={gender}
                                                onChange={e => setGender(e.target.value)}
                                                className="w-full px-6 py-4 bg-white dark:bg-brand-deep text-brand-deep dark:text-white text-lg rounded-2xl shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-bright/20 transition-all appearance-none"
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                                <option value="prefer_not_to_say">Prefer not to say</option>
                                            </select>
                                        </div>
                                    </div>

                                    <Button onClick={handleSaveProfile} fullWidth className="mt-4">
                                        Save Changes
                                    </Button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div
                                onClick={toggleTheme}
                                className="flex items-center justify-between p-4 bg-white dark:bg-brand-deep/50 rounded-2xl shadow-soft cursor-pointer hover:bg-gray-50 dark:hover:bg-brand-deep/70 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${isDark ? 'bg-brand-bright text-white' : 'bg-brand-orange text-white'}`}>
                                        {isDark ? <Moon size={20} /> : <Sun size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-brand-deep dark:text-white">Dark Mode</h3>
                                        <p className="text-xs text-brand-deep/50 dark:text-white/50">{isDark ? 'On' : 'Off'}</p>
                                    </div>
                                </div>
                                <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${isDark ? 'bg-brand-bright' : 'bg-gray-200'}`}>
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
