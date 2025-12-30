import React from 'react';
import { X, Check, CheckCheck, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock notifications for MVP
const NOTIFICATIONS = [
    { id: 1, type: 'sent', text: 'Blunt sent to Blunt Team', time: '2m ago' },
    { id: 2, type: 'delivered', text: 'Blunt delivered to Mom', time: '1h ago' },
    { id: 3, type: 'responded', text: 'New reply from Ex-Boss', time: 'Yesterday' },
    { id: 4, type: 'sent', text: 'Blunt sent to @Sarah', time: '2d ago' },
    { id: 5, type: 'delivered', text: 'Blunt read by @HR', time: '3d ago' },
    { id: 6, type: 'responded', text: 'Reply from @Landlord', time: '4d ago' },
    { id: 7, type: 'sent', text: 'Blunt sent to Support', time: '5d ago' },
    { id: 8, type: 'delivered', text: 'Your confession was read', time: '1w ago' },
    { id: 9, type: 'responded', text: 'Anonymous reply received', time: '1w ago' },
    { id: 10, type: 'sent', text: 'Blunt sent to Future Self', time: '2w ago' },
];

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-white w-full max-w-sm mt-16 rounded-3xl overflow-hidden shadow-2xl animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-brand-cream flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell size={20} className="text-brand-deep" />
                        <h2 className="text-lg font-black text-brand-deep">Notifications</h2>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {NOTIFICATIONS.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {NOTIFICATIONS.map((notif) => (
                                <div key={notif.id} className="p-4 rounded-2xl hover:bg-brand-cream/30 transition-colors flex items-start gap-4 cursor-pointer">
                                    <div className={`p-2 rounded-full shrink-0 ${notif.type === 'sent' ? 'bg-blue-100 text-blue-600' :
                                        notif.type === 'delivered' ? 'bg-green-100 text-green-600' :
                                            'bg-purple-100 text-purple-600'
                                        }`}>
                                        {notif.type === 'sent' && <Check size={16} />}
                                        {notif.type === 'delivered' && <CheckCheck size={16} />}
                                        {notif.type === 'responded' && <Bell size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-brand-deep">{notif.text}</p>
                                        <p className="text-[10px] text-brand-deep/40 font-bold uppercase mt-1">{notif.time}</p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-brand-deep/30">
                            <Bell size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-bold text-sm">All caught up</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-brand-cream/20 text-center">
                    <button onClick={onClose} className="text-xs font-bold text-brand-deep/50 hover:text-brand-deep uppercase">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
