import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Shield, Lock, ArrowRight, Quote, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { getPublicBlunts } from '../services/storageService';
import { BluntMessage } from '../types';

interface FeedItem {
  id: string;
  category: string;
  text: string;
  time: string;
  realCount: number;
  hasReacted: boolean;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Workplace: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
  Personal: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-400' },
  Safety: { bg: 'bg-red-50', text: 'text-red-500', dot: 'bg-red-400' },
  Family: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
  Confession: { bg: 'bg-pink-50', text: 'text-pink-500', dot: 'bg-pink-400' },
  Relationships: { bg: 'bg-rose-50', text: 'text-rose-500', dot: 'bg-rose-400' },
  Live: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-400' },
  Public: { bg: 'bg-brand-bright/5', text: 'text-brand-bright', dot: 'bg-brand-bright' },
};

const getCategoryStyle = (category: string) =>
  CATEGORY_STYLES[category] || { bg: 'bg-brand-deep/5', text: 'text-brand-deep/60', dot: 'bg-brand-deep/30' };

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const heroRef = React.useRef<HTMLDivElement>(null);

  const handleStartBlunt = () => {
    if (user.isGuest) {
      navigate('/auth');
    } else {
      navigate('/create');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Toggle "Real" reaction
  const handleReal = useCallback(async (itemId: string) => {
    if (user.isGuest) {
      navigate('/auth');
      return;
    }

    setFeedItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const wasReacted = item.hasReacted;
      return {
        ...item,
        hasReacted: !wasReacted,
        realCount: wasReacted ? item.realCount - 1 : item.realCount + 1
      };
    }));

    // Persist to DB
    try {
      const existing = feedItems.find(i => i.id === itemId);
      if (existing?.hasReacted) {
        // Un-react
        await supabase.from('reactions').delete().eq('blunt_id', itemId).eq('user_id', user.id);
      } else {
        // React
        await supabase.from('reactions').insert({ blunt_id: itemId, user_id: user.id });
      }
    } catch (e) {
      console.warn('Reaction failed:', e);
    }
  }, [feedItems, user, navigate]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyButton(!entry.isIntersecting);
      },
      { root: null, rootMargin: "-100px 0px 0px 0px" }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    return () => { if (heroRef.current) observer.unobserve(heroRef.current); };
  }, []);

  React.useEffect(() => {
    const loadFeed = async () => {
      try {
        const publicBlunts = await getPublicBlunts();

        // Get weekly blunt count
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const { count } = await supabase
          .from('blunts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgo);
        setWeeklyCount(count || 0);

        // Get reaction counts
        const bluntIds = publicBlunts.map(b => b.id);
        let reactionCounts: Record<string, number> = {};
        let userReactions: Set<string> = new Set();

        if (bluntIds.length > 0) {
          const { data: reactions } = await supabase
            .from('reactions')
            .select('blunt_id, user_id')
            .in('blunt_id', bluntIds);

          if (reactions) {
            reactions.forEach(r => {
              reactionCounts[r.blunt_id] = (reactionCounts[r.blunt_id] || 0) + 1;
              if (r.user_id === user.id) userReactions.add(r.blunt_id);
            });
          }
        }

        const userBlunts: FeedItem[] = publicBlunts.map(b => ({
          id: b.id,
          category: b.category || 'Personal',
          text: b.content,
          time: formatTime(b.createdAt),
          realCount: reactionCounts[b.id] || 0,
          hasReacted: userReactions.has(b.id)
        }));

        const mockMoments: FeedItem[] = [
          { id: 'm1', category: 'Workplace', text: "I finally reported the safety violations in the warehouse. I was terrified of losing my job, but they can't ignore it now.", time: '2h ago', realCount: 47, hasReacted: false },
          { id: 'm2', category: 'Personal', text: "I told my brother that I was the one who crashed his car years ago. It's been eating me alive.", time: '4h ago', realCount: 32, hasReacted: false },
          { id: 'm3', category: 'Safety', text: "Alerted HR about the manager who keeps making inappropriate comments to interns. Someone had to say it.", time: '6h ago', realCount: 89, hasReacted: false },
          { id: 'm4', category: 'Confession', text: "My parents still think I'm studying at university. I dropped out 3 months ago to start my own business.", time: '8h ago', realCount: 61, hasReacted: false },
          { id: 'm5', category: 'Workplace', text: "My boss takes credit for all my work. Today I casually mentioned 'my' project ideas to the CEO in the elevator.", time: '12h ago', realCount: 124, hasReacted: false },
          { id: 'm6', category: 'Relationships', text: "I'm planning to propose next week. She has no idea. I'm so nervous.", time: '1d ago', realCount: 203, hasReacted: false },
          { id: 'm7', category: 'Family', text: "Admitted to my partner that I'm not happy in this city anymore. We need to talk about moving.", time: '1d ago', realCount: 18, hasReacted: false },
          { id: 'm8', category: 'Confession', text: "I found a wallet with $500 in it. I returned the wallet, but I kept the cash. I needed it for rent.", time: '2d ago', realCount: 76, hasReacted: false },
          { id: 'm9', category: 'Safety', text: "Reported the neighbor who leaves their aggressive dog off-leash. It chased a kid yesterday.", time: '2d ago', realCount: 55, hasReacted: false },
          { id: 'm10', category: 'Personal', text: "I've been going to therapy for 6 months and haven't told anyone. Best decision I ever made.", time: '3d ago', realCount: 312, hasReacted: false },
        ];

        setFeedItems([...userBlunts, ...mockMoments]);
      } catch (e) {
        console.error("Failed to load feed", e);
      }
    };

    loadFeed();

    const channel = supabase.channel('public:blunts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'blunts', filter: 'post_to_feed=eq.true' },
        (payload) => {
          const newBlunt = payload.new;
          const newItem: FeedItem = {
            id: newBlunt.id,
            category: 'Live',
            text: newBlunt.content,
            time: 'Just now',
            realCount: 0,
            hasReacted: false
          };
          setFeedItems(prev => [newItem, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredItems = feedItems.filter(moment => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return moment.category.toLowerCase().includes(query) || moment.text.toLowerCase().includes(query);
  });

  return (
    <Layout onSearch={handleSearch}>
      <div className="flex flex-col gap-10 pb-24 relative">

        {/* Hero Section */}
        <section ref={heroRef} className="flex flex-col gap-6 pt-8 px-2">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-brand-deep tracking-tighter leading-[1.3]">
              Your voice.<br />
              <span className="text-brand-bright">Safely delivered.</span>
            </h1>
            <p className="mt-4 text-brand-deep/60 font-medium max-w-xs leading-relaxed">
              Say what needs to be said. Anonymous, encrypted, and impactful.
            </p>
          </div>

          <Button
            fullWidth
            onClick={handleStartBlunt}
            className="h-14 text-lg bg-brand-deep shadow-xl hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            Start Blunt <ArrowRight size={20} />
          </Button>
        </section>

        {/* Impact Stats */}
        <section className="bg-white rounded-3xl p-6 shadow-soft flex flex-col gap-4 mx-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-4xl font-black text-brand-deep">{weeklyCount}</span>
              <span className="text-sm font-bold text-brand-deep/60">blunts sent this week</span>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-surface flex items-center justify-center text-brand-deep/40" title="encrypted">
                <Lock size={14} strokeWidth={2.5} />
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-surface flex items-center justify-center text-brand-deep/40" title="anonymous">
                <Shield size={14} strokeWidth={2.5} />
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-brand-surface rounded-full overflow-hidden">
            <div className="h-full bg-brand-bright rounded-full transition-all duration-1000" style={{ width: `${Math.min((weeklyCount / 100) * 100, 100)}%` }}></div>
          </div>
        </section>

        {/* Moments of Truth Feed */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-brand-orange" />
              <h2 className="font-black text-sm tracking-widest uppercase text-brand-deep">Moments of Truth</h2>
            </div>
            <span className="text-[10px] font-bold text-brand-deep/30 uppercase tracking-wider">
              {filteredItems.length} truths
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {filteredItems.map((moment) => {
              const style = getCategoryStyle(moment.category);
              return (
                <div
                  key={moment.id}
                  className="bg-white rounded-2xl shadow-sm border border-transparent hover:border-brand-deep/5 transition-all overflow-hidden"
                >
                  {/* Card Content */}
                  <div className="p-5 pb-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1.5 ${style.bg} ${style.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {moment.category}
                      </span>
                      <span className="text-[10px] text-brand-deep/30 font-medium">{moment.time}</span>
                    </div>
                    <p className="text-brand-deep leading-relaxed font-medium text-[15px]">
                      "{moment.text}"
                    </p>
                  </div>

                  {/* Interaction Bar */}
                  <div className="px-5 py-3 border-t border-brand-deep/5 flex items-center justify-between">
                    <button
                      onClick={() => handleReal(moment.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        moment.hasReacted
                          ? 'bg-brand-orange/10 text-brand-orange'
                          : 'bg-brand-deep/[0.03] text-brand-deep/40 hover:bg-brand-deep/[0.06] hover:text-brand-deep/60'
                      }`}
                    >
                      <Flame size={16} className={`transition-transform ${moment.hasReacted ? 'scale-110 fill-brand-orange' : ''}`} />
                      Real
                      {moment.realCount > 0 && (
                        <span className={`ml-0.5 tabular-nums ${moment.hasReacted ? 'text-brand-orange' : 'text-brand-deep/30'}`}>
                          {moment.realCount}
                        </span>
                      )}
                    </button>

                    <div className="flex items-center gap-1 text-brand-deep/20">
                      <Shield size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Anonymous</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center py-8">
            <p className="text-brand-deep/30 text-xs font-medium">Feed is anonymized and moderated.</p>
          </div>
        </section>

        {/* Sticky Compose Button */}
        <button
          onClick={handleStartBlunt}
          className={`fixed bottom-32 right-6 w-14 h-14 bg-brand-deep text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 z-50 hover:scale-110 ${showStickyButton ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
        >
          <span className="sr-only">Compose Blunt</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

      </div>
    </Layout>
  );
};
