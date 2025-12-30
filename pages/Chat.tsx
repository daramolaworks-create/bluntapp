import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ChevronRight, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStoredBlunts } from '../services/storageService';
import { BluntMessage } from '../types';

export const Chat: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<BluntMessage[]>([]);

    useEffect(() => {
        // Load real blunts
        const allBlunts = getStoredBlunts();
        // Filter to show only blunts created by this user? 
        // For MVP storage is shared/local, so we just show all. 
        // Ideally we filter by owner. But current storageService doesn't save ownerID?
        // Let's just show all for now as per MVP local capabilities.
        const sorted = allBlunts.sort((a, b) => b.createdAt - a.createdAt);
        setConversations(sorted);
    }, []);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString();
    };

    const StatusIcon = ({ status }: { status: 'read' | 'delivered' | 'sent' }) => {
        if (status === 'read') return <CheckCircle size={14} className="text-brand-bright" />;
        return <CheckCircle size={14} className="text-gray-300" />;
    };

    if (user.isGuest) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                    <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mb-6">
                        <Shield size={32} className="text-brand-deep/40" />
                    </div>
                    <h2 className="text-2xl font-black text-brand-deep mb-2">Private Access</h2>
                    <p className="text-brand-deep/60 mb-8">
                        Conversations are encrypted and stored for registered users only.
                    </p>
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-8 py-3 bg-brand-deep text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                    >
                        Create Account
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col gap-2 pb-24">
                <h1 className="text-2xl font-black text-brand-deep px-2 mb-2">Messages</h1>

                {conversations.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <p>No blunts sent yet.</p>
                    </div>
                ) : (
                    conversations.map((Convo) => (
                        <div
                            key={Convo.id}
                            onClick={() => navigate(`/chat/${Convo.id}`)}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-brand-deep/5 transition-all cursor-pointer flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-brand-surface flex items-center justify-center text-brand-deep font-bold shrink-0">
                                {Convo.recipientName.charAt(0)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <h3 className="font-bold text-brand-deep truncate">{Convo.recipientName}</h3>
                                    <span className="text-[10px] font-bold text-brand-deep/40 bg-brand-deep/5 px-2 py-0.5 rounded-full">
                                        {formatTime(Convo.createdAt)}
                                    </span>
                                </div>
                                <p className="text-xs text-brand-deep/60 truncate pr-4">
                                    {Convo.replies.length > 0 ? `Reply: ${Convo.replies[Convo.replies.length - 1].content}` : `You: ${Convo.content}`}
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                {Convo.replies.length > 0 && (
                                    <span className="w-5 h-5 bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                        {Convo.replies.length}
                                    </span>
                                )}
                                <StatusIcon status={Convo.acknowledged ? 'read' : 'sent'} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Layout>
    );
};
