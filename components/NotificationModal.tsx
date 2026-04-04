import React, { useEffect, useState } from 'react';
import { X, Check, CheckCheck, Bell, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, NotificationItem } from '../services/storageService';
import { useNavigate } from 'react-router-dom';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}



export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && !user.isGuest) {
            setLoading(true);
            getNotifications()
                .then(setNotifications)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, user]);

    const handleClick = (notif: NotificationItem) => {
        onClose();
        navigate(`/chat/${notif.bluntId}`);
    };

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
                    {notifications.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleClick(notif)}
                                    className="p-4 rounded-2xl hover:bg-brand-cream/30 transition-colors flex items-start gap-4 cursor-pointer"
                                >
                                    <div className={`p-2 rounded-full shrink-0 ${notif.type === 'sent' ? 'bg-blue-100 text-blue-600' :
                                            notif.type === 'delivered' ? 'bg-green-100 text-green-600' :
                                                notif.type === 'denied' ? 'bg-red-100 text-red-600' :
                                                    'bg-purple-100 text-purple-600'
                                        }`}>
                                        {notif.type === 'sent' && <Check size={16} />}
                                        {notif.type === 'delivered' && <CheckCheck size={16} />}
                                        {notif.type === 'denied' && <ShieldAlert size={16} />}
                                        {notif.type === 'responded' && <Bell size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-brand-deep">{notif.text}</p>
                                        <p className="text-[10px] text-brand-deep/40 font-bold uppercase mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
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
