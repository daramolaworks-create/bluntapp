import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { MessageCircle, UserPlus, LogIn } from 'lucide-react';

export const AuthLanding: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout hideHeader>
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4">
                {/* Logo/Icon */}
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-3xl">
                        <img src="/logo-auth.png" alt="BLUNT" className="h-32 w-auto" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-black text-brand-deep mb-2">Welcome to BLUNT.</h1>
                        <p className="text-brand-deep/60 font-medium">Say what matters. Safely</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full max-w-sm flex flex-col gap-4">
                    {/* Sign Up - Primary */}
                    <Button
                        fullWidth
                        onClick={() => navigate('/signup')}
                        className="h-14 bg-brand-bright text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        <UserPlus size={20} className="text-white" />
                        <span className="font-bold text-white">Sign Up</span>
                    </Button>

                    {/* Login - Secondary */}
                    <Button
                        fullWidth
                        onClick={() => navigate('/login')}
                        className="h-14 bg-white text-brand-deep border-2 border-brand-deep hover:bg-brand-deep/5 flex items-center justify-center gap-2"
                    >
                        <LogIn size={20} className="text-brand-deep" />
                        <span className="font-bold text-brand-deep">Login</span>
                    </Button>

                    {/* Continue as Guest - Tertiary */}
                    <button
                        onClick={() => navigate('/create')}
                        className="text-brand-deep/60 hover:text-brand-deep font-bold text-sm py-3 transition-colors"
                    >
                        Continue as Guest
                    </button>
                </div>

                {/* Footer Info */}
                <div className="text-center text-xs text-brand-deep/40 max-w-xs">
                    <p>Guest users can send 1 Blunt per day.</p>
                    <p className="mt-1">Sign up for unlimited access.</p>
                </div>
            </div>
        </Layout>
    );
};
