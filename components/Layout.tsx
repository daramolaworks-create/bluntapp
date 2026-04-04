import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { SupportModal } from './SupportModal';
import { MenuModal } from './MenuModal';
import { getNotifications } from '../services/storageService';
import { NotificationModal } from './NotificationModal';
import { SearchModal } from './SearchModal';
import { BottomNav } from './BottomNav';
import { Star, User as UserIcon, Activity, Menu, Bell, Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  onSearch?: (query: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideHeader = false, onSearch }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  React.useEffect(() => {
    if (user.isGuest) return;

    // Initial check
    const checkNodes = async () => {
      const notifs = await getNotifications();
      if (notifs.length > 0) setHasNewNotifications(true);
    };
    checkNodes();

    // Poll every 60s
    const interval = setInterval(checkNodes, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleOpenNotifications = () => {
    setShowNotificationModal(true);
    setHasNewNotifications(false); // Clear dot on open
  };

  const handleOpenSettings = () => {
    navigate('/settings');
  };

  const handleOpenAccount = () => {
    setShowMenuModal(true);
  };

  // Calculate active tab
  let activeTab: 'home' | 'activity' | 'settings' | 'chat' = 'home';
  if (location.pathname === '/settings') {
    activeTab = 'settings';
  } else if (location.pathname === '/dashboard') {
    activeTab = 'activity';
  } else if (location.pathname === '/chat' || location.pathname.startsWith('/chat/')) {
    activeTab = 'chat';
  } else if (location.pathname === '/') {
    activeTab = 'home';
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 font-sans selection:bg-brand-orange selection:text-white">
      <div className="w-full max-w-md flex flex-col gap-8 pb-32">
        {!hideHeader && (
          <header className="flex justify-between items-center py-6">
            {/* Logo or Avatar Menu */}
            {user.isGuest ? (
              <Link to="/" className="text-3xl font-black tracking-tighter text-brand-accent hover:opacity-80 transition-opacity">
                BLUNT.
              </Link>
            ) : (
              <button
                onClick={handleOpenAccount}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
              >
                <div className="w-10 h-10 rounded-full bg-brand-deep text-white flex items-center justify-center font-bold text-sm shadow-soft group-hover:shadow-soft-lg transition-all">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-brand-deep leading-none">{user.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-brand-deep/50 font-medium">{user.username || '@user'}</p>
                </div>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearchModal(true)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white text-brand-deep shadow-soft hover:shadow-soft-lg transition-all"
              >
                <Search size={20} />
              </button>
              <button
                onClick={handleOpenNotifications}
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white text-brand-deep shadow-soft hover:shadow-soft-lg transition-all"
              >
                <Bell size={20} />
                {hasNewNotifications && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                )}
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 w-full animate-fade-in">
          {children}
        </main>

        {/* Footer / Menu Trigger */}
        {/* Footer / Menu Trigger - REMOVED (Moved to Avatar) */}
      </div>

      {/* Bottom Navigation */}
      {!user.isGuest && (
        <BottomNav
          activeTab={activeTab}
          onOpenSettings={handleOpenSettings}
        />
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
      <MenuModal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        onOpenSupport={() => setShowSupportModal(true)}
      />
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={(query) => {
          if (onSearch) onSearch(query);
        }}
      />
    </div>
  );
};
