import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ArrowLeft, Send, MoreVertical, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBlunt } from '../services/storageService';
import { BluntMessage } from '../types';

export const ChatThread: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [blunt, setBlunt] = useState<BluntMessage | null>(null);

    useEffect(() => {
        if (!user.isGuest && id) {
            const found = getBlunt(id);
            setBlunt(found);
        }
    }, [id, user]);

    if (user.isGuest) {
        navigate('/signup');
        return null;
    }

    if (!blunt) return null;

    return (
        <Layout hideHeader>
            <div className="flex flex-col h-screen bg-brand-surface">
                {/* Header */}
                <div className="px-4 py-4 bg-white border-b border-brand-deep/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/chat')} className="p-2 -ml-2 hover:bg-brand-deep/5 rounded-full">
                            <ArrowLeft size={20} className="text-brand-deep" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-deep text-white flex items-center justify-center font-bold">
                                {blunt.recipientName.charAt(0)}
                            </div>
                            <div>
                                <h2 className="font-bold text-brand-deep text-sm">{blunt.recipientName}</h2>
                                <p className="text-[10px] text-brand-deep/40 font-bold uppercase tracking-wider">
                                    {blunt.isAnonymous ? 'You are Anonymous' : 'Identity Revealed'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* The Original Blunt */}
                    <div className="flex justify-end">
                        <div className="max-w-[80%] bg-brand-deep text-white p-4 rounded-2xl rounded-tr-none shadow-sm">
                            <p className="text-sm leading-relaxed">{blunt.content}</p>
                            <span className="text-[10px] text-white/40 mt-2 block text-right">
                                {new Date(blunt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    {/* Replies */}
                    {blunt.replies.map((reply) => (
                        <div key={reply.id} className="flex justify-start">
                            <div className="max-w-[80%] bg-white text-brand-deep p-4 rounded-2xl rounded-tl-none shadow-sm border border-brand-deep/5">
                                <p className="text-sm leading-relaxed">{reply.content}</p>
                                <span className="text-[10px] text-brand-deep/30 mt-2 block">
                                    {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {blunt.acknowledged && blunt.replies.length === 0 && (
                        <div className="text-center py-4">
                            <span className="text-[10px] font-bold uppercase text-brand-deep/30 tracking-widest bg-brand-deep/5 px-3 py-1 rounded-full">
                                Seen by Recipient
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white border-t border-brand-deep/5 shrink-0">
                    <p className="text-center text-[10px] text-brand-deep/30 uppercase font-bold tracking-widest">
                        {blunt.replies.length > 0 ? "Conversation Closed" : "Waiting for response..."}
                    </p>
                </div>
            </div>
        </Layout>
    );
};
