import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { useAuth } from '../context/AuthContext';
import { X, Apple } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleLogin = async (provider: 'google' | 'apple' | 'email') => {
        if (provider === 'email' && (!name || !email)) return;

        setIsLoading(true);
        // For Google/Apple, use defaults if fields are empty (Simulating provider data)
        const effectiveName = provider === 'email' ? name : (name || (provider === 'google' ? 'Google User' : 'Apple User'));
        const effectiveEmail = provider === 'email' ? email : (email || (provider === 'google' ? 'user@gmail.com' : 'user@icloud.com'));

        await login(provider, effectiveName, effectiveEmail);
        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-white/50 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-brand-deep/30 hover:text-brand-deep transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 flex flex-col gap-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-brand-deep mb-2">Member Access</h2>
                        <p className="text-brand-deep/50 text-sm">Unlock 10 Blunts daily + Priority features.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Input
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                        <Input
                            placeholder="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                            fullWidth
                            onClick={() => handleLogin('email')}
                            disabled={!name || !email || isLoading}
                            className="bg-brand-bright text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            CONTINUE
                        </Button>
                    </div>

                    <div className="relative flex items-center justify-center my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-brand-deep/10"></div>
                        </div>
                        <span className="relative bg-white px-2 text-[10px] uppercase font-bold text-brand-deep/30">Or join with</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={() => handleLogin('google')}
                            disabled={isLoading}
                            className="bg-white text-black border border-[#0a2e65]/10 hover:bg-[#0a2e65]/5 hover:border-[#0a2e65]/20 shadow-none transition-all active:scale-95"
                        >
                            <span className="flex items-center justify-center gap-2 font-bold text-xs">
                                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </span>
                        </Button>
                        <Button
                            onClick={() => handleLogin('apple')}
                            disabled={isLoading}
                            className="bg-white text-black border border-[#0a2e65]/10 hover:bg-[#0a2e65]/5 hover:border-[#0a2e65]/20 shadow-none transition-all active:scale-95"
                        >
                            <span className="flex items-center justify-center gap-2 font-bold text-xs">
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#000000">
                                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.62 4.12-.54 2.85 1.83 2.18 5.48 2.18 5.48s-1.58.74-1.92 2.6c-.38 2.07 1.45 3.03 1.45 3.03-1.05 2.65-2.38 5.66-4.63 7.57zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.54 4.33-3.74 4.25z" />
                                </svg>
                                Apple
                            </span>
                        </Button>
                    </div>

                    <p className="text-[10px] text-center text-secondary/50 uppercase tracking-widest font-bold">
                        Guest limit: 1 Blunt / Day
                    </p>
                </div>
            </div>
        </div>
    );
};
