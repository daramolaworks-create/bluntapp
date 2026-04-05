import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { updatePassword } from '../services/authService';
import { User, Lock, Save, AlertTriangle, CheckCircle, Smartphone, Globe } from 'lucide-react';
import { COUNTRIES } from '../constants/countries';
import { AVATAR_OPTIONS, getAvatarById } from '../constants/avatars';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { useNavigate } from 'react-router-dom';

export const SettingsView: React.FC = () => {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username || '');
    const [email, setEmail] = useState(user.email);
    const [country, setCountry] = useState(user.country || 'US');
    const [mobile, setMobile] = useState(user.mobile || '');
    const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || 'ghost');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user.isGuest) {
            navigate('/signup');
        }
    }, [user, navigate]);

    const handleProfileUpdate = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            await updateProfile({ name, username, country, mobile, avatar: selectedAvatar });
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
        } catch (e: any) {
            console.error(e);
            setMessage({ type: 'error', text: e.message || 'Failed to update profile.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }

        setIsLoading(true);
        setMessage(null);
        try {
            await updatePassword(newPassword);
            setMessage({ type: 'success', text: 'Password updated. Please login again.' });
            setTimeout(() => logout(), 2000);
        } catch (e: any) {
            console.error(e);
            setMessage({ type: 'error', text: e.message || 'Failed to update password.' });
            setIsLoading(false);
        }
    };

    if (user.isGuest) return null;

    return (
        <Layout>
            <div className="flex flex-col gap-6 pb-20">
                <h1 className="text-2xl font-black text-brand-deep px-2">Settings</h1>

                {message && (
                    <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        <span className="font-medium text-sm">{message.text}</span>
                    </div>
                )}

                {/* Profile Section */}
                <section className="bg-white p-6 rounded-3xl shadow-soft space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="text-brand-bright" size={20} />
                        <h2 className="font-bold text-brand-deep text-lg">Profile</h2>
                    </div>

                    {/* Avatar Picker */}
                    <div>
                        <label className="text-[10px] font-bold text-brand-deep/40 uppercase mb-3 block pl-1">Choose Avatar</label>
                        <div className="flex items-center gap-4 mb-4">
                            <AvatarDisplay avatarId={selectedAvatar} size={64} />
                            <div>
                                <p className="font-bold text-brand-deep">{getAvatarById(selectedAvatar).label}</p>
                                <p className="text-[10px] text-brand-deep/50">Tap below to change</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {AVATAR_OPTIONS.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSelectedAvatar(opt.id)}
                                    className={`w-full aspect-square rounded-xl flex items-center justify-center text-xl transition-all ${selectedAvatar === opt.id ? 'ring-2 ring-brand-bright ring-offset-2 scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                                    style={{ background: opt.bg }}
                                    title={opt.label}
                                >
                                    {opt.emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-brand-deep/5 my-2" />

                    <div className="grid gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-brand-deep/40 uppercase mb-1 block pl-1">Full Name</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-brand-deep/40 uppercase mb-1 block pl-1">Username</label>
                            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-brand-deep/40 uppercase mb-1 block pl-1">Country</label>
                            <div className="relative">
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-deep/10 bg-white text-brand-deep font-medium focus:outline-none focus:border-brand-bright transition-colors appearance-none"
                                >
                                    {COUNTRIES.map((c) => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                                <Globe className="absolute right-4 top-3.5 text-brand-deep/20 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-brand-deep/40 uppercase mb-1 block pl-1">Mobile Number</label>
                            <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+1 234 567 890" type="tel" />
                        </div>
                    </div>

                    <Button onClick={handleProfileUpdate} disabled={isLoading} className="mt-4">
                        {isLoading ? 'Saving...' : 'Update Profile'}
                    </Button>
                </section>

                {/* Security Section */}
                <section className="bg-white p-6 rounded-3xl shadow-soft space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="text-brand-orange" size={20} />
                        <h2 className="font-bold text-brand-deep text-lg">Security</h2>
                    </div>

                    <p className="text-xs text-brand-deep/60">Update your password to keep your account secure.</p>

                    <div className="grid gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-brand-deep/40 uppercase mb-1 block pl-1">New Password</label>
                            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-brand-deep/40 uppercase mb-1 block pl-1">Confirm Password</label>
                            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" />
                        </div>
                    </div>

                    <Button onClick={handlePasswordUpdate} disabled={isLoading} fullWidth className="mt-4 bg-brand-deep text-white hover:bg-brand-deep/90">
                        {isLoading ? 'Updating...' : 'Change Password'}
                    </Button>
                </section>

                <div className="px-4">
                    <Button onClick={logout} variant="secondary" className="w-full border-red-100 text-red-500 hover:bg-red-50">
                        Log Out
                    </Button>
                </div>

            </div>
        </Layout>
    );
};
