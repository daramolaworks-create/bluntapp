import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { TextArea } from '../components/Input';
import { getBlunt, acknowledgeBlunt, denyBlunt, addReply } from '../services/storageService';
import { supabase } from '../services/supabaseClient';
import { BluntMessage } from '../types';
import { Lock, Shield, CheckCircle, Send, FileText, MessageCircle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AvatarDisplay } from '../components/AvatarDisplay';

export const ViewBlunt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blunt, setBlunt] = useState<BluntMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let channel: any;
    if (id) {
      getBlunt(id).then(found => {
        setBlunt(found);
        setLoading(false);
      });

      channel = supabase.channel(`replies:${id}`)
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
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [blunt?.replies.length]);

  const handleAcknowledge = async () => {
    if (blunt) {
      await acknowledgeBlunt(blunt.id);
      setBlunt({ ...blunt, acknowledged: true });
    }
  };

  const handleReply = async () => {
    if (!blunt || !reply.trim() || sending) return;
    setSending(true);
    try {
      await addReply(blunt.id, reply, 'recipient');
      setReply('');
    } catch (e) {
      console.error('Failed to send reply:', e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  if (loading) return (
    <Layout hideHeader>
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <div className="w-4 h-4 bg-brand-deep rounded-full animate-ping" />
        <p className="text-brand-deep/60 text-xs font-bold uppercase tracking-widest">Decrypting...</p>
      </div>
    </Layout>
  );

  if (!blunt) return (
    <Layout>
      <div className="bg-white p-8 rounded-3xl shadow-soft text-center">
        <h2 className="text-2xl font-black text-brand-deep">404</h2>
        <p className="text-brand-deep/60">This message has vanished.</p>
      </div>
    </Layout>
  );

  const isLocked = blunt.scheduledFor > Date.now();

  if (isLocked) {
    return (
      <Layout>
        <div className="bg-white p-12 rounded-3xl shadow-soft text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center text-brand-deep/40">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-brand-deep mb-2">Time Locked</h2>
            <p className="text-brand-deep/60">This truth is scheduled for</p>
            <p className="text-brand-orange font-bold text-lg mt-2">
              {new Date(blunt.scheduledFor).toLocaleDateString()}
            </p>
          </div>
          <Link to="/">
            <Button variant="secondary">Return Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideHeader>
      <div className="flex flex-col h-[100dvh] -m-4 sm:-m-8">

        {/* Header */}
        <div className="px-4 py-4 bg-white border-b border-brand-deep/5 flex items-center gap-3 shrink-0 shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-deep to-brand-bright rounded-2xl flex items-center justify-center text-white shadow-sm">
            {blunt.isAnonymous ? <Shield size={20} /> : <span className="font-black">?</span>}
          </div>
          <div>
            <h2 className="font-bold text-brand-deep text-sm">
              {blunt.isAnonymous ? 'Anonymous Sender' : 'Someone'}
            </h2>
            <p className="text-[10px] text-brand-deep/40 font-bold uppercase tracking-wider">
              Sent you a blunt
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-surface">

          {/* Original Blunt Message */}
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-white text-brand-deep p-4 rounded-2xl rounded-tl-none shadow-sm border border-brand-deep/5">
              <p className="text-sm leading-relaxed font-medium">"{blunt.content}"</p>
              {blunt.attachment && (
                <div className="mt-3">
                  {blunt.attachmentType === 'image' ? (
                    <img src={blunt.attachment} className="w-full rounded-xl" alt="Proof" />
                  ) : (
                    <div className="bg-brand-cream p-3 rounded-lg flex items-center gap-2">
                      <FileText size={16} className="text-brand-deep" />
                      <span className="text-xs font-bold text-brand-deep">Attached File</span>
                    </div>
                  )}
                </div>
              )}
              <span className="text-[10px] text-brand-deep/30 mt-2 block">
                {new Date(blunt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Acknowledge / Deny Actions */}
          {!blunt.acknowledged && !blunt.denied && (
            <div className="flex flex-col gap-2 px-4">
              <Button onClick={handleAcknowledge} fullWidth className="py-3 text-sm shadow-lg">
                I ACKNOWLEDGE THIS TRUTH
              </Button>
              <button
                onClick={async () => {
                  if (blunt) {
                    await denyBlunt(blunt.id);
                    setBlunt({ ...blunt, denied: true });
                  }
                }}
                className="w-full py-3 rounded-xl text-red-500 font-bold uppercase tracking-widest text-[10px] hover:bg-red-50 transition-colors"
              >
                I do not acknowledge this truth
              </button>
            </div>
          )}

          {(blunt.acknowledged || blunt.denied) && (
            <div className="text-center py-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${blunt.denied ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                {blunt.denied ? '✕ Denied' : '✓ Acknowledged'}
              </span>
            </div>
          )}

          {/* Conversation Replies */}
          {blunt.replies.map(r => (
            <div key={r.id} className={`flex ${r.senderRole === 'recipient' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                r.senderRole === 'recipient'
                  ? 'bg-brand-bright text-white rounded-tr-none'
                  : 'bg-white text-brand-deep rounded-tl-none border border-brand-deep/5'
              }`}>
                <p className="text-sm leading-relaxed">{r.content}</p>
                <span className={`text-[10px] mt-2 block ${r.senderRole === 'recipient' ? 'text-white/40 text-right' : 'text-brand-deep/30'}`}>
                  {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {blunt.allowReply && (
          <div className="p-4 bg-white border-t border-brand-deep/5 shrink-0">
            {user.isGuest ? (
              /* Auth Gate — must sign up/login to reply */
              <div className="flex flex-col gap-3 text-center py-2">
                <p className="text-xs text-brand-deep/50 font-medium">Sign in to respond to this blunt</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/signup?returnTo=/view/${blunt.id}`)}
                    fullWidth
                    className="flex items-center justify-center gap-2 py-3"
                  >
                    <MessageCircle size={16} /> Sign Up to Reply
                  </Button>
                  <button
                    onClick={() => navigate(`/login?returnTo=/view/${blunt.id}`)}
                    className="flex-1 py-3 border border-brand-deep/10 rounded-xl text-brand-deep font-bold text-xs hover:bg-brand-cream/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn size={16} /> Log In
                  </button>
                </div>
              </div>
            ) : (
              /* Chat Input */
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <TextArea
                    placeholder="Your response..."
                    rows={1}
                    className="bg-brand-surface border-0"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button
                  onClick={handleReply}
                  disabled={!reply.trim() || sending}
                  className="h-12 w-12 bg-brand-deep text-white rounded-2xl flex items-center justify-center hover:bg-brand-bright transition-colors shadow-lg disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};