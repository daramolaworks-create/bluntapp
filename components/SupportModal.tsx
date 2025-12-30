import React, { useState } from 'react';
import { Button } from './Button';
import { Input, TextArea } from './Input';
import { X, HelpCircle, AlertTriangle, Send } from 'lucide-react';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
    const [topic, setTopic] = useState<'cancel' | 'escalate' | 'other'>('other');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSubmitting(false);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setMessage('');
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-background border border-border w-full max-w-sm rounded-xl overflow-hidden shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-secondary hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 flex flex-col gap-6">
                    {!submitted ? (
                        <>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-surface border border-border rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HelpCircle size={24} className="text-secondary" />
                                </div>
                                <h2 className="text-2xl font-black text-[#0a2e65] mb-2">Support</h2>
                                <p className="text-secondary text-sm">Need to cancel a scheduled blunt or report an issue?</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider block mb-2">Topic</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => setTopic('cancel')}
                                            className={`p-2 border rounded text-[10px] font-bold uppercase transition-all ${topic === 'cancel' ? 'bg-red-900/20 border-red-500 text-red-500' : 'bg-surface border-border text-secondary hover:border-white'}`}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => setTopic('escalate')}
                                            className={`p-2 border rounded text-[10px] font-bold uppercase transition-all ${topic === 'escalate' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-500' : 'bg-surface border-border text-secondary hover:border-white'}`}
                                        >
                                            Escalate
                                        </button>
                                        <button
                                            onClick={() => setTopic('other')}
                                            className={`p-2 border rounded text-[10px] font-bold uppercase transition-all ${topic === 'other' ? 'bg-primary text-background border-primary' : 'bg-surface border-border text-secondary hover:border-white'}`}
                                        >
                                            Other
                                        </button>
                                    </div>
                                </div>

                                <TextArea
                                    placeholder="Describe your request..."
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <Button
                                fullWidth
                                onClick={handleSubmit}
                                disabled={!message || isSubmitting}
                            >
                                {isSubmitting ? 'SENDING...' : 'SUBMIT TICKET'}
                            </Button>
                        </>
                    ) : (
                        <div className="text-center py-8 flex flex-col items-center gap-4 animate-fade-in">
                            <div className="w-16 h-16 bg-green-900/20 border border-green-500 rounded-full flex items-center justify-center">
                                <Send size={32} className="text-green-500" />
                            </div>
                            <h2 className="text-xl font-black uppercase text-white">Ticket Sent</h2>
                            <p className="text-secondary text-sm">Support will review your request shortly.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
