import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Shield, Lock, ArrowRight, Quote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { getPublicBlunts } from '../services/storageService';
import { BluntMessage } from '../types';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedItems, setFeedItems] = useState<any[]>([]);
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

  React.useEffect(() => {
    // Observer for Sticky Button
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show button when hero is NOT visible (scrolled past)
        setShowStickyButton(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0, // Trigger as soon as even 1 pixel is out of view? No, usually when completely out. 
        // We want it to show when we scroll PAST the main button. 
        // Let's observe the hero section itself.
        rootMargin: "-100px 0px 0px 0px" // Offset slightly
      }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current);
    };
  }, []);

  React.useEffect(() => {
    // Load public blunts from local storage
    const userBlunts = getPublicBlunts().map(b => ({
      id: b.id,
      category: 'Public', // Default category for user posts
      text: b.content,
      time: 'Just now'
    }));

    const mockMoments = [
      {
        id: 1,
        category: 'Workplace',
        text: "I finally reported the safety violations in the warehouse. I was terrified of losing my job, but they can't ignore it now.",
        time: '2h ago'
      },
      {
        id: 2,
        category: 'Personal',
        text: "I told my brother that I was the one who crashed his car years ago. It's been eating me alive.",
        time: '4h ago'
      },
      {
        id: 3,
        category: 'Safety',
        text: "Alerted HR about the manager who keeps making inappropriate comments to interns. Someone had to say it.",
        time: '6h ago'
      },
      {
        id: 4,
        category: 'Personal',
        text: "Admitted to my partner that I'm not happy in this city anymore. We need to talk about moving.",
        time: '8h ago'
      },
      {
        id: 5,
        category: 'Workplace',
        text: "Submitted the anonymous feedback about the toxic crunch culture. Hopefully, next sprint is better.",
        time: '12h ago'
      },
      {
        id: 6,
        category: 'Family',
        text: "My parents still think I'm studying at university. I dropped out 3 months ago to start my own business.",
        time: '1d ago'
      },
      {
        id: 7,
        category: 'Confession',
        text: "I found a wallet with $500 in it. I returned the wallet, but I kept the cash. I needed it for rent.",
        time: '1d ago'
      },
      {
        id: 8,
        category: 'Workplace',
        text: "My boss takes credit for all my work. Today I casually mentioned 'my' project ideas to the CEO in the elevator.",
        time: '2d ago'
      },
      {
        id: 9,
        category: 'Relationships',
        text: "I'm planning to propose next week. She has no idea. I'm so nervous.",
        time: '2d ago'
      },
      {
        id: 10,
        category: 'Safety',
        text: "Reported the neighbor who leaves their aggressive dog off-leash. It chased a kid yesterday.",
        time: '3d ago'
      }
    ];

    setFeedItems([...userBlunts, ...mockMoments]);
  }, []);

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
              <span className="block text-4xl font-black text-brand-deep">184</span>
              <span className="text-sm font-bold text-brand-deep/60">people spoke up this week</span>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-surface flex items-center justify-center text-brand-deep/40" title=" encrypted">
                <Lock size={14} strokeWidth={2.5} />
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-surface flex items-center justify-center text-brand-deep/40" title="anonymous">
                <Shield size={14} strokeWidth={2.5} />
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-brand-surface rounded-full overflow-hidden">
            <div className="h-full w-[70%] bg-brand-bright rounded-full animate-pulse"></div>
          </div>
        </section>

        {/* Moments of Truth Feed */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-2">
            <Quote size={16} className="text-brand-deep" fill="currentColor" />
            <h2 className="font-bold text-sm tracking-widest uppercase text-brand-deep">Moments of Truth</h2>
          </div>

          <div className="flex flex-col gap-3">
            {feedItems
              .filter(moment => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  moment.category.toLowerCase().includes(query) ||
                  moment.text.toLowerCase().includes(query)
                );
              })
              .map((moment) => (
                <div key={moment.id} className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:border-brand-deep/5 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-bright bg-brand-bright/5 px-2 py-1 rounded-md">
                      {moment.category}
                    </span>
                    <span className="text-[10px] text-brand-deep/40 font-medium">{moment.time}</span>
                  </div>
                  <p className="text-brand-deep leading-relaxed font-medium">
                    "{moment.text}"
                  </p>
                </div>
              ))}
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
