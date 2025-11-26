'use client';

import { useState } from 'react';
import { Calendar, Plus, DollarSign, TrendingUp, Users, Video, X } from 'lucide-react';

export default function CreatorDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    seriesName: '',
    plannedPublishDate: '',
    description: '',
    adSlots: [] as Array<{
      slotType: string;
      reservePrice: string;
      duration?: string;
      position?: string;
    }>,
  });

  const stats = {
    totalEarnings: 12450,
    activeBids: 8,
    upcomingContent: 5,
    avgEngagement: 4.2,
  };

  const contentListings = [
    {
      id: '1',
      title: 'Complete React Tutorial 2024',
      topic: 'Web Development',
      plannedDate: '2024-12-15',
      bids: 3,
      highestBid: 500,
      status: 'active',
    },
    {
      id: '2',
      title: 'My Morning Routine as a Developer',
      topic: 'Lifestyle',
      plannedDate: '2024-12-18',
      bids: 5,
      highestBid: 750,
      status: 'active',
    },
  ];

  const adSlotTypes = [
    { value: 'IN_VIDEO_INTEGRATION', label: 'In-Video Integration' },
    { value: 'LIVE_MENTION', label: 'Live Mention' },
    { value: 'STORY', label: 'Story' },
    { value: 'SHOUTOUT', label: 'Shoutout' },
    { value: 'DESCRIPTION_LINK', label: 'Description Link' },
  ];

  const addAdSlot = () => {
    setFormData({
      ...formData,
      adSlots: [
        ...formData.adSlots,
        { slotType: 'IN_VIDEO_INTEGRATION', reservePrice: '', duration: '60', position: 'middle' },
      ],
    });
  };

  const removeAdSlot = (index: number) => {
    setFormData({
      ...formData,
      adSlots: formData.adSlots.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    console.log('Creating content listing:', formData);
    setShowCreateModal(false);
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
              <a href="#" className="text-white font-medium">Dashboard</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Bids</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Deals</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Analytics</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              JD
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, Creator!</h1>
            <p className="text-gray-300">Manage your content and track your earnings</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            New Content
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">${stats.totalEarnings.toLocaleString()}</div>
            <div className="text-sm text-green-400 mt-1">+12% this month</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Active Bids</span>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.activeBids}</div>
            <div className="text-sm text-gray-400 mt-1">Across {stats.upcomingContent} listings</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Upcoming Content</span>
              <Video className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.upcomingContent}</div>
            <div className="text-sm text-gray-400 mt-1">Next: Dec 15</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Avg Engagement</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{stats.avgEngagement}%</div>
            <div className="text-sm text-gray-400 mt-1">Last 30 days</div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          <h2 className="text-2xl font-bold text-white mb-6">Your Content Listings</h2>
          <div className="space-y-4">
            {contentListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-slate-700/50 rounded-lg p-6 border border-purple-500/10 hover:border-purple-500/30 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{listing.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(listing.plannedDate).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        {listing.topic}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white mb-1">
                      ${listing.highestBid}
                    </div>
                    <div className="text-sm text-gray-400">{listing.bids} bids</div>
                    <button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition">
                      View Bids
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20">
            <div className="sticky top-0 bg-slate-800 border-b border-purple-500/20 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Create Content Listing</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Complete React Tutorial 2024"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Topic *
                    </label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder="e.g., Web Development"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Series Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.seriesName}
                      onChange={(e) => setFormData({ ...formData, seriesName: e.target.value })}
                      className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder="e.g., React Fundamentals"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Planned Publish Date *
                  </label>
                  <input
                    type="date"
                    value={formData.plannedPublishDate}
                    onChange={(e) => setFormData({ ...formData, plannedPublishDate: e.target.value })}
                    className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    rows={3}
                    placeholder="Brief description of your content..."
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Ad Slots</h3>
                  <button
                    onClick={addAdSlot}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Slot
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.adSlots.map((slot, index) => (
                    <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Slot Type
                            </label>
                            <select
                              value={slot.slotType}
                              onChange={(e) => {
                                const newSlots = [...formData.adSlots];
                                newSlots[index].slotType = e.target.value;
                                setFormData({ ...formData, adSlots: newSlots });
                              }}
                              className="w-full bg-slate-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            >
                              {adSlotTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Reserve Price ($)
                            </label>
                            <input
                              type="number"
                              value={slot.reservePrice}
                              onChange={(e) => {
                                const newSlots = [...formData.adSlots];
                                newSlots[index].reservePrice = e.target.value;
                                setFormData({ ...formData, adSlots: newSlots });
                              }}
                              className="w-full bg-slate-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                              placeholder="250"
                              min="0"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => removeAdSlot(index)}
                          className="text-red-400 hover:text-red-300 transition mt-8"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {formData.adSlots.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No ad slots added yet. Click "Add Slot" to create your first ad slot.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-purple-500/20">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Create Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
