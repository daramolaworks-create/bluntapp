import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { getBlunt } from '../services/storageService';
import { sendAnonymousBlunt } from '../services/deliveryService';
import { Check, Copy, MessageSquare, Smartphone, Lock, Mail, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';

export const ShareBlunt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  // Delivery State
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [deliveryMessage, setDeliveryMessage] = useState('');

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
  const prefillMessage = `I have a blunt message for you. Read it here: ${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualShare = (platform: 'whatsapp' | 'sms' | 'email') => {
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/${blunt.recipientNumber}?text=${encodeURIComponent(prefillMessage)}`);
    } else if (platform === 'sms') {
      window.open(`sms:${blunt.recipientNumber}?body=${encodeURIComponent(prefillMessage)}`);
    } else {
      window.open(`mailto:${blunt.recipientNumber}?subject=A Blunt Message&body=${encodeURIComponent(prefillMessage)}`);
    }
  };

  const handleAnonymousDelivery = async () => {
    setDeliveryStatus('sending');
    try {
      const result = await sendAnonymousBlunt(blunt);
      if (result.success) {
        setDeliveryStatus('sent');
        setDeliveryMessage(result.message);
      } else {
        setDeliveryStatus('error');
        setDeliveryMessage(result.message);
      }
    } catch (e) {
      setDeliveryStatus('error');
      setDeliveryMessage("Transmission failed.");
    }
  };

  const isScheduled = blunt.scheduledFor > Date.now();

  return (
    <Layout>
      <div className="flex flex-col gap-8 text-center pt-4">

        {/* Status Header */}
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-glow mb-2 animate-bounce-slow ${deliveryStatus === 'sent' ? 'bg-green-500' : 'bg-brand-bright'
          }`}>
          {deliveryStatus === 'sent' ? <Check size={40} className="text-white" /> : <Lock size={40} className="text-white" />}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-brand-deep tracking-tight">
            {deliveryStatus === 'sent' ? 'Delivered' : 'Ready to Deliver'}
          </h1>
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

        {/* Message Preview */}
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

        {/* Delivery Options */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-brand-deep/40 uppercase tracking-widest">
            {blunt.isAnonymous ? "Anonymous Protocol" : "Select Delivery Channel"}
          </h3>

          {blunt.isAnonymous ? (
            // ANONYMOUS DELIVERY UI
            <div className="bg-brand-cream/30 p-6 rounded-3xl border border-brand-cream">
              <div className="flex items-center gap-3 mb-4 text-brand-deep/70 text-sm">
                <ShieldCheck className="text-brand-deep" />
                <span className="font-bold">Platform Delivery Active</span>
              </div>
              <p className="text-xs text-left mb-6 text-brand-deep/60">
                Your identity is hidden. We will deliver this message via our secure server using the selected method ({blunt.deliveryMode}).
              </p>

              {deliveryStatus === 'idle' && (
                <Button onClick={handleAnonymousDelivery} fullWidth className="py-4 shadow-xl">
                  INITIATE TRANSMISSION
                </Button>
              )}

              {deliveryStatus === 'sending' && (
                <div className="py-4 flex flex-col items-center justify-center gap-2 text-brand-bright font-bold animate-pulse">
                  <Loader2 className="animate-spin" size={32} />
                  <span className="text-xs uppercase tracking-widest">Encrypting & Sending...</span>
                </div>
              )}

              {deliveryStatus === 'sent' && (
                <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center gap-3 font-bold text-sm">
                  <Check size={20} />
                  Transmission Complete.
                </div>
              )}

              {deliveryStatus === 'error' && (
                <div className="bg-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 font-bold text-sm">
                  <AlertTriangle size={20} />
                  {deliveryMessage}
                </div>
              )}
            </div>
          ) : (
            // PERSONAL DELIVERY UI
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleManualShare('whatsapp')}
                className="flex flex-col items-center justify-center gap-2 bg-[#25D366] text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <MessageSquare size={20} fill="currentColor" />
                <span className="font-bold text-[10px] uppercase">WhatsApp</span>
              </button>
              <button
                onClick={() => handleManualShare('sms')}
                className="flex flex-col items-center justify-center gap-2 bg-[#007AFF] text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <Smartphone size={20} />
                <span className="font-bold text-[10px] uppercase">iMessage</span>
              </button>
              <button
                onClick={() => handleManualShare('email')}
                className="flex flex-col items-center justify-center gap-2 bg-gray-500 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <Mail size={20} />
                <span className="font-bold text-[10px] uppercase">Email</span>
              </button>
            </div>
          )}
        </div>

        {/* Fallback Manual Link */}
        {/* Fallback Manual Link - Only show if NOT anonymous to prevent doxxing */}
        {!blunt.isAnonymous && (
          <div onClick={handleCopy} className="bg-white p-4 rounded-2xl shadow-soft flex items-center justify-between cursor-pointer active:scale-95 transition-all">
            <div className="text-left">
              <p className="text-[10px] font-bold text-brand-deep/40 uppercase">Manual Link (Backup)</p>
              <p className="text-brand-deep font-mono text-xs truncate max-w-[200px]">{shareUrl}</p>
            </div>
            <div className={`p-2 rounded-full ${copied ? 'bg-green-500 text-white' : 'bg-brand-cream text-brand-deep'}`}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
