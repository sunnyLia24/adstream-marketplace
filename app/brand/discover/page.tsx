'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Users, TrendingUp, Calendar, DollarSign, Eye, Target, X, Send } from 'lucide-react';

export default function BrandDiscovery() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [contentListings, setContentListings] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    searchQuery: '',
    niches: [] as string[],
    minAudienceSize: 0,
    minEngagement: 0,
  });

  const niches = [
    'Technology', 'Gaming', 'Beauty', 'Fitness', 'Cooking', 
    'Travel', 'Finance', 'Education', 'Entertainment', 'Lifestyle'
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch listings
  useEffect(() => {
    if (status === 'authenticated') {
      fetchListings();
    }
  }, [status, filters]);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.searchQuery) params.append('search', filters.searchQuery);
      if (filters.niches.length > 0) params.append('niches', filters.niches.join(','));
      if (filters.minAudienceSize > 0) params.append('minAudienceSize', filters.minAudienceSize.toString());
      if (filters.minEngagement > 0) params.append('minEngagement', filters.minEngagement.toString());

      const response = await fetch(`/api/brands/discover?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContentListings(data);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const openBidModal = (content: any, slot: any) => {
    setSelectedContent({ ...content, selectedSlot: slot });
    setBidAmount(slot.reservePrice.toString());
    setShowBidModal(true);
  };

  const handleSubmitBid = async () => {
    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentListingId: selectedContent.id,
          adSlotId: selectedContent.selectedSlot.id,
          bidAmount,
          message: bidMessage,
        }),
      });

      if (response.ok) {
        alert('Bid placed successfully!');
        setShowBidModal(false);
        setBidAmount('');
        setBidMessage('');
        fetchListings(); // Refresh listings
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to place bid');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('Failed to place bid');
    }
  };

  const toggleNiche = (niche: string) => {
    setFilters({
      ...filters,
      niches: filters.niches.includes(niche)
        ? filters.niches.filter(n => n !== niche)
        : [...filters.niches, niche],
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
              <span className="text-xl font-bold text-white">AdStream</span>
            </div>
            <div className="flex gap-4">
              <a href="/brand/discover" className="text-white font-medium">Discover</a>
              <a href="/brand/bids" className="text-gray-400 hover:text-white transition">My Bids</a>
              <a href="/brand/deals" className="text-gray-400 hover:text-white transition">Active Deals</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{session?.user?.name}</span>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="text-gray-400 hover:text-white transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Discover Creators</h1>
          <p className="text-gray-300">Find the perfect creators for your next campaign</p>
        </div>

        <div className="flex gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full bg-slate-800/50 border border-purple-500/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="Search by creator, topic, or content..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-purple-500/20 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <Filter className="w-5 h-5" />
            Filters
            {filters.niche
