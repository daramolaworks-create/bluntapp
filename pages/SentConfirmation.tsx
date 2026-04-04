import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { getBlunt } from '../services/storageService';
import { BluntMessage } from '../types';
import { Check, Shield, Clock, ArrowRight, Lock, Sparkles } from 'lucide-react';

export const SentConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blunt, setBlunt] = useState<BluntMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    if (id) {
      getBlunt(id).then(found => {
        setBlunt(found);
        setLoading(false);
        // Stagger the checkmark animation
        setTimeout(() => setShowCheckmark(true), 400);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <Layout hideHeader>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
          <div className="w-4 h-4 bg-brand-bright rounded-full animate-ping" />
          <p className="text-brand-deep/60 text-xs font-bold uppercase tracking-widest">Finalizing...</p>
        </div>
      </Layout>
    );
  }

  if (!blunt) {
    return (
      <Layout>
        <div className="bg-white p-8 rounded-3xl shadow-soft text-center">
          <h2 className="text-2xl font-black text-brand-deep">Not Found</h2>
          <p className="text-brand-deep/60 mt-2">This blunt could not be located.</p>
        </div>
      </Layout>
    );
  }

  const isScheduled = blunt.scheduledFor > Date.now() + 60000;
  const deliveryLabel = blunt.deliveryMode === 'EMAIL' ? 'Email' : blunt.deliveryMode === 'SMS' ? 'SMS' : 'WhatsApp';

  return (
    <Layout hideHeader>
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 text-center px-4">

        {/* Animated Icon */}
        <div className={`relative transition-all duration-700 ease-out ${showCheckmark ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ${isScheduled ? 'bg-brand-orange' : 'bg-green-500'}`}>
            {isScheduled ? <Clock size={44} className="text-white" /> : <Check size={44} className="text-white" strokeWidth={3} />}
          </div>
          {/* Pulse ring */}
          <div className={`absolute inset-0 rounded-full animate-ping ${isScheduled ? 'bg-brand-orange/20' : 'bg-green-500/20'}`} style={{ animationDuration: '2s', animationIterationCount: 3 }} />
        </div>

        {/* Status Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-brand-deep tracking-tight">
            {isScheduled ? 'Scheduled' : 'Delivered'}
          </h1>
          <p className="text-brand-deep/50 text-sm max-w-[280px] mx-auto leading-relaxed">
            {isScheduled
              ? `Your blunt will be delivered on ${new Date(blunt.scheduledFor).toLocaleDateString()} at ${new Date(blunt.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
              : `Your blunt has been securely transmitted to the recipient.`
            }
          </p>
        </div>

        {/* Delivery Summary Card */}
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-soft p-6 space-y-4">
          {/* Recipient */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-deep/40 uppercase tracking-widest">Recipient</span>
            <span className="font-bold text-brand-deep text-sm">{blunt.recipientName}</span>
          </div>

          <div className="h-px bg-brand-deep/5" />

          {/* Channel */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-deep/40 uppercase tracking-widest">Channel</span>
            <span className="font-bold text-brand-deep text-sm">{deliveryLabel}</span>
          </div>

          <div className="h-px bg-brand-deep/5" />

          {/* Identity */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-brand-deep/40 uppercase tracking-widest">Identity</span>
            <div className="flex items-center gap-1.5">
              {blunt.isAnonymous ? (
                <>
                  <Shield size={14} className="text-brand-bright" />
                  <span className="font-bold text-brand-bright text-sm">Anonymous</span>
                </>
              ) : (
                <span className="font-bold text-brand-deep text-sm">Visible</span>
              )}
            </div>
          </div>

          {blunt.postToFeed && (
            <>
              <div className="h-px bg-brand-deep/5" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-deep/40 uppercase tracking-widest">Feed</span>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-brand-orange" />
                  <span className="font-bold text-brand-orange text-sm">Exposed</span>
                </div>
              </div>
            </>
          )}

          {isScheduled && (
            <>
              <div className="h-px bg-brand-deep/5" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-deep/40 uppercase tracking-widest">Time Lock</span>
                <div className="flex items-center gap-1.5">
                  <Lock size={14} className="text-brand-orange" />
                  <span className="font-bold text-brand-orange text-sm">
                    {new Date(blunt.scheduledFor).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Message Preview */}
        <div className="w-full max-w-sm bg-brand-cream/30 border border-brand-cream rounded-2xl p-5 text-left relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-bright rounded-l-2xl" />
          <p className="text-[10px] font-bold text-brand-deep/30 uppercase tracking-widest mb-2 pl-3">Preview</p>
          <p className="text-brand-deep font-medium leading-relaxed pl-3 line-clamp-3">"{blunt.content}"</p>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3">
          <Button
            fullWidth
            onClick={() => navigate('/create')}
            className="py-4 shadow-xl flex items-center justify-center gap-2"
          >
            Send Another <ArrowRight size={18} />
          </Button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 text-brand-deep/40 font-bold text-xs uppercase tracking-widest hover:text-brand-deep transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    </Layout>
  );
};
