import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { COUNTRIES } from '../constants/countries';

export const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const { login, signup } = useAuth(); // Destructure signup
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [country, setCountry] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (provider: 'email' | 'google' | 'apple') => {
        setIsLoading(true);
        try {
            if (provider === 'email') {
                if (!username || !email || !password || !country) return;
                await signup(email, password, { name: username, username, country });
            } else {
                // For OAuth, we just log in (signup is implicit/handled by provider)
                await login(provider, '', '');
            }

            // Check for returnTo redirect
            const searchParams = new URLSearchParams(location.search);
            const returnTo = searchParams.get('returnTo');
            navigate(returnTo || '/');

        } catch (error) {
            console.error("Sign up failed", error);
            alert("Sign up failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout hideHeader>
            <div className="flex flex-col min-h-screen py-8 px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/auth')}
                    className="flex items-center gap-2 text-brand-deep/60 hover:text-brand-deep mb-8"
                >
                    <ArrowLeft size={20} />
                    <span className="font-bold text-sm">Back</span>
                </button>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-brand-deep mb-2">Join today</h1>
                        <p className="text-brand-deep/60 font-medium">Create your account to get started</p>
                    </div>

                    {/* Form */}
                    <div className="flex flex-col gap-4 mb-6">
                        <Input
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />
                        <Input
                            placeholder="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-brand-deep/10 bg-white text-brand-deep font-medium focus:outline-none focus:border-brand-bright transition-colors"
                        >
                            <option value="">Select Country</option>
                            {COUNTRIES.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                        <Button
                            fullWidth
                            onClick={() => handleSignUp('email')}
                            disabled={!username || !email || !password || !country || isLoading}
                            className="h-12 bg-brand-bright text-white shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-brand-deep/10"></div>
                        </div>
                        <span className="relative bg-white px-3 text-xs uppercase font-bold text-brand-deep/30">Or sign up with</span>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex flex-col gap-3 mb-6">
                        <Button
                            onClick={() => handleSignUp('google')}
                            disabled={isLoading}
                            className="bg-white text-black border border-[#0a2e65]/10 hover:bg-[#0a2e65]/5 shadow-none"
                        >
                            <span className="flex items-center justify-center gap-2 font-bold text-xs">
                                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </span>
                        </Button>
                    </div>

                    {/* Footer Link */}
                    <div className="text-center text-sm">
                        <span className="text-brand-deep/60">Already have an account? </span>
                        <Link to="/login" className="text-brand-bright font-bold hover:underline">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
