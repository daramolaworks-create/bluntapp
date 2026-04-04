import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { TextArea } from '../components/Input';
import { ArrowLeft, Send, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBlunt, addReply } from '../services/storageService';
import { sendReplyNotification } from '../services/deliveryService';
import { supabase } from '../services/supabaseClient';
import { BluntMessage } from '../types';
import { AvatarDisplay } from '../components/AvatarDisplay';

export const ChatThread: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [blunt, setBlunt] = useState<BluntMessage | null>(null);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        let channel: any;
        if (!user.isGuest && id) {
            getBlunt(id).then(found => {
                setBlunt(found);
                setLoading(false);
            });

            // Realtime subscription for new replies
            channel = supabase.channel(`chat:${id}`)
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'replies', filter: `blunt_id=eq.${id}` },
                    (payload) => {
                        setBlunt(prev => {
                            if (!prev) return prev;
                            if (prev.replies.some(r => r.id === payload.new.id)) return prev;
                            return {
                                ...prev,
                                replies: [...prev.replies, {
                                    id: payload.new.id,
                                    content: payload.new.content,
                                    createdAt: payload.new.created_at || Date.now(),
                                    senderId: payload.new.sender_id,
                                    senderRole: payload.new.sender_role || 'recipient'
                                }]
                            };
                        });
                    }
                )
                .subscribe();
        }
        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [id, user]);

    useEffect(() => {
        scrollToBottom();
    }, [blunt?.replies.length]);

    const handleSend = async () => {
        if (!blunt || !reply.trim() || sending) return;
        setSending(true);
        try {
            await addReply(blunt.id, reply, 'sender');
            setReply('');
            // Send email notification to recipient (non-blocking)
            if (blunt.recipientNumber) {
                sendReplyNotification(blunt.id, blunt.recipientNumber);
            }
        } catch (e) {
            console.error('Failed to send:', e);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (user.isGuest) {
        navigate('/signup');
        return null;
    }

    if (loading) return (
        <Layout hideHeader>
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <div className="w-4 h-4 bg-brand-deep rounded-full animate-ping" />
                <p className="text-brand-deep/60 text-xs font-bold uppercase tracking-widest">Loading...</p>
            </div>
        </Layout>
    );

    if (!blunt) return (
        <Layout hideHeader>
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <p className="text-brand-deep/60">Conversation not found.</p>
                <button onClick={() => navigate('/chat')} className="text-brand-bright font-bold text-sm">
                    ← Back to Messages
                </button>
            </div>
        </Layout>
    );

    return (
        <Layout hideHeader>
            <div className="flex flex-col h-[100dvh] -m-4 sm:-m-8">

                {/* Header */}
                <div className="px-4 py-4 bg-white border-b border-brand-deep/5 flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/chat')} className="p-2 -ml-2 hover:bg-brand-deep/5 rounded-full">
                            <ArrowLeft size={20} className="text-brand-deep" />
                        </button>
                        <div className="flex items-center gap-3">
                            <AvatarDisplay avatarId="ghost" size={40} />
                            <div>
                                <h2 className="font-bold text-brand-deep text-sm">{blunt.recipientName}</h2>
                                <p className="text-[10px] text-brand-deep/40 font-bold uppercase tracking-wider">
                                    {blunt.isAnonymous ? 'You are Anonymous' : 'Identity Revealed'} · {blunt.deliveryMode}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-surface">

                    {/* The Original Blunt (sent by you — right side) */}
                    <div className="flex justify-end">
                        <div className="max-w-[80%] bg-brand-deep text-white p-4 rounded-2xl rounded-tr-none shadow-sm">
                            <p className="text-sm leading-relaxed">{blunt.content}</p>
                            <span className="text-[10px] text-white/40 mt-2 block text-right">
                                {new Date(blunt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    {/* Status indicator */}
                    {blunt.acknowledged && blunt.replies.length === 0 && (
                        <div className="text-center py-2">
                            <span className="text-[10px] font-bold uppercase text-green-600/60 tracking-widest bg-green-50 px-3 py-1 rounded-full">
                                ✓ Acknowledged
                            </span>
                        </div>
                    )}
                    {blunt.denied && (
                        <div className="text-center py-2">
                            <span className="text-[10px] font-bold uppercase text-red-500/60 tracking-widest bg-red-50 px-3 py-1 rounded-full">
                                ✕ Denied
                            </span>
                        </div>
                    )}

                    {/* All Replies */}
                    {blunt.replies.map((r) => (
                        <div key={r.id} className={`flex ${r.senderRole === 'sender' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                                r.senderRole === 'sender'
                                    ? 'bg-brand-deep text-white rounded-tr-none'
                                    : 'bg-white text-brand-deep rounded-tl-none border border-brand-deep/5'
                            }`}>
                                <p className="text-sm leading-relaxed">{r.content}</p>
                                <span className={`text-[10px] mt-2 block ${r.senderRole === 'sender' ? 'text-white/40 text-right' : 'text-brand-deep/30'}`}>
                                    {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {blunt.replies.length === 0 && !blunt.acknowledged && !blunt.denied && (
                        <div className="text-center py-8 opacity-40">
                            <Shield size={32} className="mx-auto mb-2 text-brand-deep/30" />
                            <p className="text-xs text-brand-deep/40 font-medium">Waiting for response...</p>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input — sender can reply back */}
                <div className="p-4 bg-white border-t border-brand-deep/5 shrink-0">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <TextArea
                                placeholder="Reply back..."
                                rows={1}
                                className="bg-brand-surface border-0"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!reply.trim() || sending}
                            className="h-12 w-12 bg-brand-deep text-white rounded-2xl flex items-center justify-center hover:bg-brand-bright transition-colors shadow-lg disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
