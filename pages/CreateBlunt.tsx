import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { TextArea, Input } from '../components/Input';
import { moderateContent } from '../services/geminiService';
import { saveBlunt } from '../services/storageService';
import { checkLimit, incrementUsage } from '../services/rateLimitService';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { BluntMessage } from '../types';
import { Loader2, AlertTriangle, ShieldCheck, Paperclip, X, Crown, Calendar, Sparkles } from 'lucide-react';
import { getAuthoritiesForCountry, Authority } from '../constants/authorities';
import { COUNTRIES } from '../constants/countries';
import { Globe, Siren, User as UserIcon, MessageCircle } from 'lucide-react';

export const CreateBlunt: React.FC = () => {
  const navigate = useNavigate();

  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [remaining, setRemaining] = useState(0);

  // Check limit on mount and enforce guest anonymity
  React.useEffect(() => {
    const status = checkLimit(user.id, user.isGuest);
    setRemaining(status.remaining);
    if (!status.allowed) setLimitReached(true);

    // Guests must be anonymous
    if (user.isGuest) setIsAnonymous(true);
  }, [user]);

  // Content State
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [attachmentName, setAttachmentName] = useState<string | undefined>(undefined);
  const [attachmentType, setAttachmentType] = useState<'image' | 'file' | undefined>(undefined);

  // Recipient State
  const [recipientMode, setRecipientMode] = useState<'person' | 'authority'>('person');
  const [recipientName, setRecipientName] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'SMS' | 'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [selectedAuthorityId, setSelectedAuthorityId] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(user.country || 'US'); // Default to US if undefined

  // Settings State
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowReply, setAllowReply] = useState(true);
  const [scheduledFor, setScheduledFor] = useState<string>(new Date().toISOString().slice(0, 16));
  const [postToFeed, setPostToFeed] = useState(false);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      setError("File too large. MVP limit is 500KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment(reader.result as string);
      setAttachmentName(file.name);
      setAttachmentType(file.type.startsWith('image/') ? 'image' : 'file');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(undefined);
    setAttachmentName(undefined);
    setAttachmentType(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleDeliveryMode = () => {
    if (deliveryMode === 'WHATSAPP') setDeliveryMode('SMS');
    else if (deliveryMode === 'SMS') setDeliveryMode('EMAIL');
    else setDeliveryMode('WHATSAPP');
  };

  const handleSubmit = async () => {
    // 0. Rate Limit Check
    const status = checkLimit(user.id, user.isGuest);
    if (!status.allowed) {
      setLimitReached(true);
      if (user.isGuest) setShowAuthModal(true);
      return;
    }

    if (!message.trim()) {
      setError("You have nothing to say? Then don't.");
      return;
    }

    // Validation based on Mode
    if (recipientMode === 'person') {
      if (!recipientName.trim() || !recipientNumber.trim()) {
        setError("Recipient details are required.");
        return;
      }
    } else {
      if (!selectedAuthorityId) {
        setError("Please select an authority agency.");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    // 1. Moderate
    const moderation = await moderateContent(message);
    if (!moderation.safe) {
      setError(moderation.reason || "Content violation.");
      setIsSubmitting(false);
      return;
    }

    // Resolve Recipient Details for Authority Mode
    let finalRecipientName = recipientName;
    let finalRecipientNumber = recipientNumber;

    if (recipientMode === 'authority') {
      const authority = getAuthoritiesForCountry(selectedCountry).find(a => a.id === selectedAuthorityId);
      finalRecipientName = authority?.name || 'Authority';
      finalRecipientNumber = 'OFFICIAL_CHANNEL'; // In a real app, this would route to their API/Email
    }

    // 2. Create Object
    const newBlunt: BluntMessage = {
      id: crypto.randomUUID(),
      content: message,
      isAnonymous,
      allowReply,
      createdAt: Date.now(),
      acknowledged: false,
      replies: [],
      recipientName: finalRecipientName,
      recipientNumber: finalRecipientNumber,
      deliveryMode: recipientMode === 'authority' ? 'EMAIL' : deliveryMode, // Force EMAIL/Official channel for authorities
      scheduledFor: new Date(scheduledFor).getTime(),
      attachment,
      attachmentName,
      attachmentType,
      postToFeed // [NEW] Add to type definition if needed, or assume backend handles it. For now, adding to object.
    };

    // 3. Save
    try {
      await saveBlunt(newBlunt);
      incrementUsage(user.id);
      setIsSubmitting(false);
      navigate(`/share/${newBlunt.id}`);
    } catch (e) {
      console.error(e);
      setError("Failed to save. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">

        {/* Guest Warning / Sign In CTA */}
        {user.isGuest && (
          <div className="bg-brand-bright/10 border border-brand-bright/20 p-4 rounded-2xl flex items-center justify-between animate-fade-in shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-brand-bright tracking-widest mb-0.5">Guest Mode</span>
              <p className="text-xs font-medium text-brand-deep/70">You are posting anonymously.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 bg-brand-bright text-white text-xs font-bold rounded-xl shadow-sm hover:scale-105 transition-all"
              >
                Sign Up
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-white text-brand-deep border border-brand-deep text-xs font-bold rounded-xl shadow-sm hover:scale-105 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* SECTION 1: THE TARGET */}
        <section className="bg-white p-6 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-brand-orange uppercase tracking-widest">Target</h2>
            {/* Mode Toggle */}
            <div className="flex bg-brand-cream/50 p-1 rounded-lg">
              <button
                onClick={() => setRecipientMode('person')}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${recipientMode === 'person' ? 'bg-[#fff0f4] text-[#800020] shadow-sm' : 'text-brand-deep/40'}`}
              >
                <UserIcon size={12} /> Person
              </button>
              <button
                onClick={() => setRecipientMode('authority')}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${recipientMode === 'authority' ? 'bg-[#fff0f4] text-[#800020] shadow-sm' : 'text-brand-deep/40'}`}
              >
                <Siren size={12} /> Authority
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {recipientMode === 'person' ? (
              <>
                <Input
                  placeholder="Recipient Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />

                <div className="flex p-1 bg-brand-cream/50 rounded-xl relative">
                  {['SMS', 'WHATSAPP', 'EMAIL'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDeliveryMode(mode as any)}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${deliveryMode === mode
                        ? 'bg-white text-[#0067f5] shadow-sm scale-100'
                        : 'text-brand-deep/40 hover:text-brand-deep/60 scale-95'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <Input
                  placeholder={deliveryMode === 'EMAIL' ? 'Email Address' : 'Phone Number'}
                  value={recipientNumber}
                  onChange={(e) => setRecipientNumber(e.target.value)}
                  type={deliveryMode === 'EMAIL' ? 'email' : 'tel'}
                />
              </>
            ) : (
              <>
                {/* Authority Mode */}
                <div className="space-y-3">
                  {/* Country Selector (auto-filled but editable) */}
                  <div>
                    <label className="text-[10px] font-bold text-brand-deep/40 uppercase mb-1 block pl-1">Country</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        setSelectedAuthorityId(''); // Reset authority when country changes
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-brand-deep/10 bg-white text-brand-deep font-medium focus:outline-none focus:border-brand-bright transition-colors"
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Authority Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-brand-deep/40 uppercase mb-1 block pl-1">Agency</label>
                    <select
                      value={selectedAuthorityId}
                      onChange={(e) => setSelectedAuthorityId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-deep/10 bg-white text-brand-deep font-medium focus:outline-none focus:border-brand-bright transition-colors"
                    >
                      <option value="">Select Agency...</option>
                      {getAuthoritiesForCountry(selectedCountry).map((auth) => (
                        <option key={auth.id} value={auth.id}>
                          {auth.name}
                        </option>
                      ))}
                    </select>
                    {selectedAuthorityId && (
                      <p className="text-[10px] text-brand-deep/60 mt-1 pl-1">
                        {getAuthoritiesForCountry(selectedCountry).find(a => a.id === selectedAuthorityId)?.description}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* SECTION 2: THE VERDICT */}
        <section className="bg-white p-6 rounded-3xl shadow-soft">
          <h2 className="text-xs font-bold text-brand-bright uppercase tracking-widest mb-4">Verdict</h2>
          <TextArea
            placeholder="Speak your truth..."
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="mt-4 flex flex-col gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {attachmentName ? (
              <div className="flex items-center justify-between bg-brand-cream px-4 py-3 rounded-xl border border-brand-orange/20">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Paperclip size={16} className="text-brand-orange shrink-0" />
                  <span className="text-sm font-medium text-brand-deep truncate">{attachmentName}</span>
                </div>
                <button onClick={removeAttachment} className="text-brand-deep/50 hover:text-red-500">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs font-bold text-brand-deep/40 hover:text-brand-bright transition-colors w-fit px-2"
              >
                <Paperclip size={16} /> ATTACH PROOF
              </button>
            )}
          </div>
        </section>

        {/* SECTION 3: PROTOCOL */}
        <section className="bg-white p-6 rounded-3xl shadow-soft space-y-4">
          <h2 className="text-xs font-bold text-brand-deep/40 uppercase tracking-widest mb-2">Protocol</h2>

          {/* Anonymity Protocol */}
          <div className="flex items-center justify-between p-3 bg-brand-cream/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl text-brand-bright shadow-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-brand-deep">Anonymous</p>
                <p className="text-[10px] text-brand-deep/50">
                  {user.isGuest ? "Always active for guests" : "Hide your identity"}
                </p>
              </div>
            </div>
            <div
              onClick={() => !user.isGuest && setIsAnonymous(!isAnonymous)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isAnonymous ? 'bg-brand-bright' : 'bg-gray-200'} ${user.isGuest ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isAnonymous ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>

          {/* Time Lock Protocol */}
          <div className="flex items-center justify-between p-3 bg-brand-cream/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl text-brand-orange shadow-sm">
                <Calendar size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-brand-deep">Time Lock</p>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="bg-transparent text-[10px] text-brand-deep/60 mt-0.5 outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Feed Exposure Protocol */}
          <div className="flex items-center justify-between p-3 bg-brand-cream/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl text-brand-deep shadow-sm">
                <Globe size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-brand-deep">Expose on Feed</p>
                <p className="text-[10px] text-brand-deep/50">Post anonymously to 'Moments of Truth'</p>
              </div>
            </div>
            <div
              onClick={() => setPostToFeed(!postToFeed)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${postToFeed ? 'bg-brand-bright' : 'bg-gray-200'} cursor-pointer`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${postToFeed ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>

          {/* Allow Replies Protocol */}
          <div className="flex items-center justify-between p-3 bg-brand-cream/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl text-brand-deep shadow-sm">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-brand-deep">Allow Replies</p>
                <p className="text-[10px] text-brand-deep/50">Let the recipient respond</p>
              </div>
            </div>
            <div
              onClick={() => setAllowReply(!allowReply)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${allowReply ? 'bg-brand-bright' : 'bg-gray-200'} cursor-pointer`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${allowReply ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 flex items-start gap-3 rounded-2xl">
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <p className="text-red-600 font-medium text-xs">{error}</p>
          </div>
        )}

        {limitReached ? (
          <div className="bg-white border-2 border-brand-cream p-8 text-center rounded-3xl shadow-soft">
            <div className="w-16 h-16 bg-[#FF0000] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
              <Crown size={32} />
            </div>
            <h2 className="text-2xl font-black text-brand-deep mb-2">Limit Reached</h2>
            {user.isGuest ? (
              <>
                <p className="text-brand-deep/60 text-sm mb-6 max-w-xs mx-auto">Guests are limited to 1 Blunt per day.</p>
                <Button onClick={() => setShowAuthModal(true)} fullWidth className="bg-[#0067f5] text-white hover:bg-[#0067f5]/90">
                  UNLOCK ALL
                </Button>
              </>
            ) : (
              <p className="text-brand-deep/60 text-sm max-w-xs mx-auto">You're done for today. Come back tomorrow.</p>
            )}
          </div>
        ) : (
          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="shadow-xl"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" /> SEALING...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                SEND BLUNT <ShieldCheck size={20} />
              </span>
            )}
          </Button>
        )}
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </Layout>
  );
};
