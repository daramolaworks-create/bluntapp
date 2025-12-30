import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, ChevronRight, LogOut, Activity, MessageSquare, Hash, Mail, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from './Input';
import { Button } from './Button';
import { Link } from 'react-router-dom';

import { COUNTRIES } from '../constants/countries';

interface MenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSupport: () => void;
    initialView?: 'main' | 'settings';
}

export const MenuModal: React.FC<MenuModalProps> = ({ isOpen, onClose, onOpenSupport, initialView = 'main' }) => {
    const { user, updateProfile, logout } = useAuth();

    // Navigation State
    const [view, setView] = useState<'main' | 'settings'>('main');

    // Profile State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [gender, setGender] = useState('prefer_not_to_say');
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');
    const [country, setCountry] = useState('');

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setName(user.name);
            setEmail(user.email);
            setMobile(user.mobile || '');
            setGender(user.gender || 'prefer_not_to_say');
            setUsername(user.username || '');
            setAvatar(user.avatar || '');
            setCountry(user.country || 'US');
        }
    }, [isOpen, user, initialView]);

    const handleSaveProfile = () => {
        updateProfile({ name, email, mobile, gender: gender as any, username, avatar, country });
    };

    const handleLogout = () => {
        logout();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div
                className="absolute inset-0 bg-brand-deep/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-brand-cream rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up border-t sm:border border-white/50 max-h-[85vh] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-brand-deep/5 flex justify-between items-center bg-white/50 shrink-0">
                    <h2 className="text-xl font-black text-brand-deep">
                        {view === 'settings' ? 'Settings' : 'Menu'}
                    </h2>
                    <div className="flex gap-2">
                        {view === 'settings' && (
                            <button onClick={() => setView('main')} className="px-3 py-1 text-xs font-bold text-brand-deep hover:opacity-70">
                                Back
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-brand-deep/5 rounded-full transition-colors">
                            <X size={20} className="text-brand-deep" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {view === 'main' ? (
                        <div className="space-y-6">
                            {/* User Info */}
                            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-brand-deep text-white flex items-center justify-center font-black text-xl">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-brand-deep">{user.name}</h3>
                                    <p className="text-xs text-brand-deep/50">{user.email || 'Guest User'}</p>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="space-y-2">
                                {!user.isGuest && (
                                    <Link to="/dashboard" onClick={onClose} className="flex items-center justify-between p-4 bg-white hover:bg-white/80 rounded-2xl transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3 text-brand-deep">
                                            <Activity size={20} className="text-brand-bright" />
                                            <span className="font-bold">Tracking</span>
                                        </div>
                                        <ChevronRight size={16} className="text-brand-deep/30 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}

                                <div onClick={() => setView('settings')} className="flex items-center justify-between p-4 bg-white hover:bg-white/80 rounded-2xl transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3 text-brand-deep">
                                        <UserIcon size={20} className="text-brand-orange" />
                                        <span className="font-bold">Profile & Settings</span>
                                    </div>
                                    <ChevronRight size={16} className="text-brand-deep/30 group-hover:translate-x-1 transition-transform" />
                                </div>

                                <div onClick={() => { onOpenSupport(); onClose(); }} className="flex items-center justify-between p-4 bg-white hover:bg-white/80 rounded-2xl transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3 text-brand-deep">
                                        <MessageSquare size={20} className="text-brand-deep" />
                                        <span className="font-bold">Support</span>
                                    </div>
                                    <ChevronRight size={16} className="text-brand-deep/30 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>

                            {!user.isGuest && (
                                <button onClick={handleLogout} className="w-full py-4 text-center text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition-colors flex items-center justify-center gap-2">
                                    <LogOut size={16} />
                                    Log Out
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Settings View */}
                            {user.isGuest ? (
                                <div className="text-center py-8">
                                    <p className="text-brand-deep/60 text-sm mb-4">Sign up to manage your profile.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Avatar Picker */}
                                    <div>
                                        <label className="font-bold text-xs text-brand-deep/60 uppercase tracking-wider ml-4 mb-2 block">Avatar</label>
                                        <div className="flex gap-2 overflow-x-auto pb-2 px-2 no-scrollbar">
                                            {['0067F5', 'FF4500', '10B981', '8B5CF6', 'EC4899', 'F59E0B'].map((color) => {
                                                const avatarUrl = `https://ui-avatars.com/api/?name=${user.name}&background=${color}&color=fff&bold=true`;
                                                return (
                                                    <button
                                                        key={color}
                                                        onClick={() => {
                                                            // Logic to update avatar immediately or upon save (doing immediate visually, save later)
                                                            // For MVP we just assume we pick one.
                                                            // We actually need a local state for avatarURL to preview it.
                                                        }}
                                                        className="w-10 h-10 rounded-full shrink-0 border-2 border-white shadow-sm hover:scale-110 transition-transform"
                                                    >
                                                        <img src={avatarUrl} alt="avatar" className="w-full h-full rounded-full" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} icon={<Hash size={16} />} placeholder="@username" />
                                    <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} icon={<UserIcon size={16} />} />
                                    <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={16} />} />
                                    <Input label="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+1..." icon={<Smartphone size={16} />} />

                                    <div className="flex flex-col gap-2 w-full">
                                        <label className="font-bold text-xs text-brand-deep/60 uppercase tracking-wider ml-4">Country</label>
                                        <select
                                            value={country}
                                            onChange={e => setCountry(e.target.value)}
                                            className="w-full px-6 py-4 bg-white text-brand-deep text-lg rounded-2xl shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-bright/20 transition-all appearance-none"
                                        >
                                            {COUNTRIES.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-2 w-full">
                                        <label className="font-bold text-xs text-brand-deep/60 uppercase tracking-wider ml-4">Gender</label>
                                        <select
                                            value={gender}
                                            onChange={e => setGender(e.target.value)}
                                            className="w-full px-6 py-4 bg-white text-brand-deep text-lg rounded-2xl shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-bright/20 transition-all appearance-none"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer_not_to_say">Prefer not to say</option>
                                        </select>
                                    </div>

                                    <Button onClick={handleSaveProfile} fullWidth>
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <style>{`
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
        </div>
    );
};
