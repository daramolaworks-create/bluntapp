import React from 'react';
import { Home, Activity, Settings, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
    onOpenSettings: () => void;
    activeTab: 'home' | 'activity' | 'settings' | 'chat';
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenSettings, activeTab }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (user.isGuest) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full px-6 py-4 flex justify-between items-center">

                {/* Home */}
                <button
                    onClick={() => navigate('/')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-[#0067f5] scale-105' : 'text-brand-deep/40 hover:text-brand-deep/70'}`}
                >
                    <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Home</span>
                </button>

                {/* Activity */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'activity' ? 'text-[#0067f5] scale-105' : 'text-brand-deep/40 hover:text-brand-deep/70'}`}
                >
                    <Activity size={24} strokeWidth={activeTab === 'activity' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Activity</span>
                </button>

                {/* Settings */}
                <button
                    onClick={onOpenSettings}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-[#0067f5] scale-105' : 'text-brand-deep/40 hover:text-brand-deep/70'}`}
                >
                    <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Settings</span>
                </button>

                {/* Chat */}
                <button
                    onClick={() => navigate('/chat')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'chat' ? 'text-[#0067f5] scale-105' : 'text-brand-deep/40 hover:text-brand-deep/70'}`}
                >
                    <MessageCircle size={24} strokeWidth={activeTab === 'chat' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Chat</span>
                </button>

            </div>
        </div>
    );
};
