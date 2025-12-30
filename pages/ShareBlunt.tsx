import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { getBlunt } from '../services/storageService';
import { Check, Copy, MessageSquare, Smartphone, Lock } from 'lucide-react';

export const ShareBlunt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = React.useState(false);

  const blunt = getBlunt(id || '');

  if (!blunt) {
    return (
      <Layout>
        <div className="text-center pt-20">
          <h2 className="text-2xl font-bold text-brand-deep">Blunt Not Found</h2>
        </div>
      </Layout>
    );
  }

  const shareUrl = `${window.location.origin}/#/view/${blunt.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: 'whatsapp' | 'sms') => {
    const text = `I have a blunt message for you. Read it here: ${shareUrl}`;
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/${blunt.recipientNumber}?text=${encodeURIComponent(text)}`);
    } else {
      window.open(`sms:${blunt.recipientNumber}?body=${encodeURIComponent(text)}`);
    }
  };

  const isScheduled = blunt.scheduledFor > Date.now();

  return (
    <Layout>
      <div className="flex flex-col gap-8 text-center pt-4">
        <div className="w-20 h-20 bg-brand-bright rounded-3xl flex items-center justify-center mx-auto shadow-glow mb-2">
          <Check size={40} className="text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-brand-deep tracking-tight">Ready to Deliver</h1>
          <p className="text-brand-deep/60">
            Prepared for <span className="text-brand-deep font-bold bg-brand-cream px-2 py-0.5 rounded-lg">{blunt.recipientName}</span>
          </p>
        </div>

        {isScheduled && (
          <div className="bg-brand-orange/10 border border-brand-orange/20 p-4 rounded-2xl flex items-center justify-center gap-2">
            <Lock size={16} className="text-brand-orange" />
            <p className="text-brand-orange font-bold text-xs uppercase tracking-wide">
              Time Locked until {new Date(blunt.scheduledFor).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="bg-white p-6 rounded-3xl shadow-soft text-left relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-bright" />
          <h3 className="text-xs font-bold text-brand-deep/40 uppercase tracking-widest mb-2">Preview</h3>
          <p className="text-xl font-medium text-brand-deep leading-relaxed">"{blunt.content}"</p>
          {blunt.isAnonymous && (
            <div className="mt-4 inline-flex items-center gap-2 bg-brand-deep text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Anonymous
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-brand-deep/40 uppercase tracking-widest">Select Delivery Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex flex-col items-center justify-center gap-3 bg-[#25D366] text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <MessageSquare size={24} fill="currentColor" />
              <span className="font-bold">WhatsApp</span>
            </button>
            <button
              onClick={() => handleShare('sms')}
              className="flex flex-col items-center justify-center gap-3 bg-brand-bright text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <Smartphone size={24} />
              <span className="font-bold">iMessage</span>
            </button>
          </div>
        </div>

        <div onClick={handleCopy} className="bg-white p-4 rounded-2xl shadow-soft flex items-center justify-between cursor-pointer active:scale-95 transition-all">
          <div className="text-left">
            <p className="text-[10px] font-bold text-brand-deep/40 uppercase">Manual Link</p>
            <p className="text-brand-deep font-mono text-xs truncate max-w-[200px]">{shareUrl}</p>
          </div>
          <div className={`p-2 rounded-full ${copied ? 'bg-green-500 text-white' : 'bg-brand-cream text-brand-deep'}`}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </div>
        </div>
      </div>
    </Layout>
  );
};
