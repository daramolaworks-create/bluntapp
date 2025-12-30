import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { TextArea } from '../components/Input';
import { getBlunt, acknowledgeBlunt, denyBlunt, addReply } from '../services/storageService';
import { BluntMessage } from '../types';
import { Lock, Clock, Shield, CheckCircle, Send, FileText, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ViewBlunt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blunt, setBlunt] = useState<BluntMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [replySent, setReplySent] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getBlunt(id);
      setBlunt(found);
      setLoading(false);
    }
  }, [id]);

  const handleAcknowledge = () => {
    if (blunt) {
      acknowledgeBlunt(blunt.id);
      setBlunt({ ...blunt, acknowledged: true });
    }
  };

  const handleReply = () => {
    if (blunt && reply.trim()) {
      const updated = addReply(blunt.id, reply);
      if (updated) {
        setBlunt(updated);
        setReply('');
        setReplySent(true);
      }
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

  // Permission Logic
  const isAuthority = blunt.recipientNumber === 'OFFICIAL_CHANNEL';
  const canReply = isAuthority || !user.isGuest;

  return (
    <Layout>
      <div className="flex flex-col gap-6">

        {/* SENDER IDENTITY */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-deep to-brand-bright rounded-2xl shadow-lg flex items-center justify-center text-white">
            {blunt.isAnonymous ? <Shield size={32} /> : <span className="text-2xl font-black">?</span>}
          </div>
          <p className="font-bold text-brand-deep">
            {blunt.isAnonymous ? 'Anonymous' : 'Someone'} sent you a blunt.
          </p>
        </div>

        {/* MESSAGE CARD */}
        <div className="bg-white p-8 rounded-3xl shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileText size={100} />
          </div>

          <p className="text-2xl font-medium text-brand-deep leading-relaxed relative z-10">
            "{blunt.content}"
          </p>

          {blunt.attachment && (
            <div className="mt-8">
              {blunt.attachmentType === 'image' ? (
                <img src={blunt.attachment} className="w-full rounded-2xl border border-brand-cream shadow-sm" alt="Proof" />
              ) : (
                <div className="bg-brand-cream p-4 rounded-xl flex items-center gap-3">
                  <FileText className="text-brand-deep" />
                  <span className="font-bold text-brand-deep text-sm">Attached File</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        {!blunt.acknowledged && !blunt.denied ? (
          <div className="flex flex-col gap-3">
            <Button onClick={handleAcknowledge} fullWidth className="py-4 text-lg shadow-xl">
              I ACKNOWLEDGE THIS TRUTH
            </Button>
            <button
              onClick={() => {
                if (blunt) {
                  denyBlunt(blunt.id);
                  setBlunt({ ...blunt, denied: true });
                }
              }}
              className="w-full py-4 rounded-xl text-red-500 font-bold uppercase tracking-widest text-xs hover:bg-red-50 transition-colors"
            >
              I do not acknowledge this truth
            </button>
          </div>
        ) : (
          <div className={`text-center py-4 rounded-2xl border ${blunt.denied ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
            <div className={`flex items-center justify-center gap-2 ${blunt.denied ? 'text-red-500' : 'text-green-600'} font-bold uppercase text-xs tracking-widest`}>
              {blunt.denied ? (
                <>
                  <Shield size={14} /> Denied
                </>
              ) : (
                <>
                  <CheckCircle size={14} /> Acknowledged
                </>
              )}
            </div>
          </div>
        )}

        {/* REPLY SECTION */}
        {blunt.allowReply && (
          <div className="space-y-4 pt-4 border-t border-brand-deep/5">
            {blunt.replies.map(r => (
              <div key={r.id} className="bg-brand-bright text-white p-4 rounded-2xl rounded-tr-none ml-8 shadow-md">
                <p className="text-sm">{r.content}</p>
              </div>
            ))}

            {!replySent ? (
              canReply ? (
                <div className="flex gap-2 items-end">
                  <TextArea
                    placeholder={isAuthority ? "Official Response..." : "Your response..."}
                    rows={1}
                    className="bg-white"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <button
                    onClick={handleReply}
                    className="h-12 w-12 bg-brand-deep text-white rounded-2xl flex items-center justify-center hover:bg-brand-bright transition-colors shadow-lg"
                  >
                    <Send size={20} />
                  </button>
                </div>
              ) : (
                <div className="bg-brand-cream/50 p-6 rounded-2xl text-center flex flex-col items-center gap-4">
                  <UserPlus size={32} className="text-brand-deep/40" />
                  <div>
                    <h3 className="font-bold text-brand-deep">Sign Up to Reply</h3>
                    <p className="text-xs text-brand-deep/60 mt-1 max-w-xs mx-auto">
                      To respond to this blunt, your identity must be verified.
                    </p>
                  </div>
                  <Button onClick={() => navigate(`/signup?returnTo=/view/${blunt.id}`)} className="h-10 text-sm">
                    Create Account
                  </Button>
                </div>
              )
            ) : (
              <p className="text-center text-xs text-brand-deep/40 font-medium">Response sent.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};