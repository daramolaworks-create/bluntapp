import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { updateUser, updatePassword } from '../services/authService';
import { User, Lock, Save, AlertTriangle, CheckCircle, Smartphone, Globe } from 'lucide-react';
import { COUNTRIES } from '../constants/countries';
import { useNavigate } from 'react-router-dom';

export const SettingsView: React.FC = () => {
    const { user, refreshUser, logout } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username || '');
    const [email, setEmail] = useState(user.email);
    const [country, setCountry] = useState(user.country || 'US');
    const [mobile, setMobile] = useState(user.mobile || '');

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
            await updateUser({ name, username, country, mobile });
            await refreshUser();
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

                    <Button onClick={handlePasswordUpdate} disabled={isLoading} variant="secondary" className="mt-4 bg-brand-deep text-white hover:bg-brand-deep/90">
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
