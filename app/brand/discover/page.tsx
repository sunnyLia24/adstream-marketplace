'use client';

import { useState } from 'react';
import { Search, Filter, Users, TrendingUp, Calendar, DollarSign, Eye, Target, X, Send } from 'lucide-react';

export default function BrandDiscovery() {
  const [showFilters, setShowFilters] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  
  const [filters, setFilters] = useState({
    searchQuery: '',
    niches: [] as string[],
    minAudienceSize: 0,
    maxAudienceSize: 10000000,
    minEngagement: 0,
  });

  const niches = [
    'Technology', 'Gaming', 'Beauty', 'Fitness', 'Cooking', 
    'Travel', 'Finance', 'Education', 'Entertainment', 'Lifestyle'
  ];

  const contentListings = [
    {
      id: '1',
      creator: {
        name: 'TechWithJohn',
        avatar: 'JD',
        subscribers: 250000,
        avgViews: 45000,
        engagementRate: 4.8,
      },
      title: 'Complete React Tutorial 2024',
      topic: 'Technology',
      plannedDate: '2024-12-15',
      adSlots: [
        { type: 'In-Video Integration', reservePrice: 500, duration: 60 },
        { type: 'Description Link', reservePrice: 100 },
      ],
      demographics: {
        age: '18-34',
        gender: '65% Male',
        topLocations: ['US', 'UK', 'Canada'],
      },
      expectedViews: 50000,
    },
    {
      id: '2',
      creator: {
        name: 'FitnessQueen',
        avatar: 'FQ',
        subscribers: 500000,
        avgViews: 120000,
        engagementRate: 6.2,
      },
      title: '30-Day Home Workout Challenge',
      topic: 'Fitness',
      plannedDate: '2024-12-18',
      adSlots: [
        { type: 'In-Video Integration', reservePrice: 800, duration: 90 },
        { type: 'Live Mention', reservePrice: 400 },
      ],
      demographics: {
        age: '25-44',
        gender: '75% Female',
        topLocations: ['US', 'Australia', 'UK'],
      },
      expectedViews: 150000,
    },
  ];

  const openBidModal = (content: any, slot: any) => {
    setSelectedContent({ ...content, selectedSlot: slot });
    setBidAmount(slot.reservePrice.toString());
    setShowBidModal(true);
  };

  const handleSubmitBid = () => {
    console.log('Submitting bid:', {
      contentId: selectedContent.id,
      slotType: selectedContent.selectedSlot.type,
      amount: bidAmount,
      message: bidMessage,
    });
    setShowBidModal(false);
    setBidAmount('');
    setBidMessage('');
  };

  const toggleNiche = (niche: string) => {
    setFilters({
      ...filters,
      niches: filters.niches.includes(niche)
        ? filters.niches.filter(n => n !== niche)
        : [...filters.niches, niche],
    });
  };

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
              <a href="#" className="text-white font-medium">Discover</a>
              <a href="#" className="text-gray-400 hover:text-white transition">My Bids</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Active Deals</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Analytics</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
              B
            </div>
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
            {filters.niches.length > 0 && (
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                {filters.niches.length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Niche</h3>
                <div className="flex flex-wrap gap-2">
                  {niches.map((niche) => (
                    <button
                      key={niche}
                      onClick={() => toggleNiche(niche)}
                      className={`px-4 py-2 rounded-lg text-sm transition ${
                        filters.niches.includes(niche)
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {niche}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Audience Size</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Minimum: {filters.minAudienceSize.toLocaleString()} subscribers
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="10000"
                      value={filters.minAudienceSize}
                      onChange={(e) => setFilters({ ...filters, minAudienceSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Min Engagement Rate</h3>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    {filters.minEngagement}% and above
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={filters.minEngagement}
                    onChange={(e) => setFilters({ ...filters, minEngagement: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6 pt-6 border-t border-purple-500/20">
              <button
                onClick={() => setFilters({
                  searchQuery: '',
                  niches: [],
                  minAudienceSize: 0,
                  maxAudienceSize: 10000000,
                  minEngagement: 0,
                })}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {contentListings.map((content) => (
            <div
              key={content.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition"
            >
              <div className="flex gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {content.creator.avatar}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{content.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="font-medium text-purple-300">{content.creator.name}</span>
                        <span>•</span>
                        <span>{content.creator.subscribers.toLocaleString()} subscribers</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(content.plannedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {content.topic}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Eye className="w-4 h-4" />
                        Expected Views
                      </div>
                      <div className="text-xl font-semibold text-white">
                        {content.expectedViews.toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <TrendingUp className="w-4 h-4" />
                        Engagement
                      </div>
                      <div className="text-xl font-semibold text-white">
                        {content.creator.engagementRate}%
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-gray-400 text-sm mb-1">Demographics</div>
                      <div className="text-sm font-medium text-white">
                        {content.demographics.age}
                      </div>
                      <div className="text-xs text-gray-400">{content.demographics.gender}</div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-gray-400 text-sm mb-1">Top Locations</div>
                      <div className="text-sm font-medium text-white">
                        {content.demographics.topLocations.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Available Ad Slots</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {content.adSlots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-700/30 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-white mb-1">{slot.type}</div>
                            <div className="text-sm text-gray-400">
                              Reserve: ${slot.reservePrice}
                              {slot.duration && ` • ${slot.duration}s`}
                            </div>
                          </div>
                          <button
                            onClick={() => openBidModal(content, slot)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                          >
                            <Target className="w-4 h-4" />
                            Place Bid
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showBidModal && selectedContent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full border border-purple-500/20">
            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Place Your Bid</h2>
              <button
                onClick={() => setShowBidModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">{selectedContent.title}</h3>
                <div className="text-sm text-gray-400">
                  {selectedContent.creator.name} • {selectedContent.selectedSlot.type}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bid Amount ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full bg-slate-700/50 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    placeholder={selectedContent.selectedSlot.reservePrice}
                    min={selectedContent.selectedSlot.reservePrice}
                  />
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Reserve price: ${selectedContent.selectedSlot.reservePrice} • 
                  Platform fee (20%): ${(parseFloat(bidAmount || '0') * 0.2).toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message to Creator (Optional)
                </label>
                <textarea
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  rows={4}
                  placeholder="Tell the creator about your brand and how you'd like to collaborate..."
                />
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between text-white mb-2">
                  <span>Bid Amount</span>
                  <span className="font-semibold">${bidAmount || '0'}</span>
                </div>
                <div className="flex items-center justify-between text-white mb-2">
                  <span>Platform Fee (20%)</span>
                  <span className="font-semibold">${(parseFloat(bidAmount || '0') * 0.2).toFixed(2)}</span>
                </div>
                <div className="border-t border-purple-500/30 pt-2 mt-2 flex items-center justify-between text-white font-bold text-lg">
                  <span>Total Cost</span>
                  <span>${(parseFloat(bidAmount || '0') * 1.2).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowBidModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitBid}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-5 h-5" />
                  Submit Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
