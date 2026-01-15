import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { BluntMessage } from '../types';
import { Clock, CheckCircle, Eye, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStoredBlunts } from '../services/storageService';

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [blunts, setBlunts] = useState<BluntMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlunts = async () => {
            try {
                const allBlunts = await getStoredBlunts();
                setBlunts(allBlunts);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchBlunts();
    }, [user]);

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between px-2">
                    <h1 className="text-2xl font-black text-brand-deep tracking-tight">Activity</h1>
                    <Link to="/create">
                        <Button className="py-2 px-5 text-xs h-9 bg-[#0067f5] hover:bg-[#0067f5]/90 shadow-none flex items-center justify-center text-white">New +</Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-brand-deep/40 text-sm font-medium animate-pulse">Loading...</div>
                ) : blunts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl shadow-soft">
                        <p className="text-brand-deep/40 font-bold mb-4">No activity yet</p>
                        <Link to="/create">
                            <span className="text-brand-bright font-bold hover:underline">Start your first blunt</span>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {blunts.map((blunt) => {
                            const isScheduled = blunt.scheduledFor > Date.now();
                            return (
                                <Link key={blunt.id} to={`/share/${blunt.id}`}>
                                    <div className="bg-white p-5 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-between group">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-brand-deep">{blunt.recipientName}</h3>
                                                <span className="text-[10px] text-brand-deep/40 font-medium bg-brand-cream px-2 py-0.5 rounded-full">
                                                    {new Date(blunt.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-brand-deep/60 text-xs line-clamp-1 max-w-[200px]">{blunt.content}</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {isScheduled ? (
                                                <Clock size={16} className="text-brand-orange" />
                                            ) : blunt.acknowledged ? (
                                                <CheckCircle size={16} className="text-green-500" />
                                            ) : (
                                                <Eye size={16} className="text-brand-bright" />
                                            )}
                                            <ChevronRight size={16} className="text-brand-deep/20 group-hover:text-brand-deep/40 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};
