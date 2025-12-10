'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Calendar,
  Video,
  MessageSquare,
  Filter,
  TrendingUp,
  X,
} from 'lucide-react';

interface Bid {
  id: string;
  bidAmount: string;
  message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'OUTBID';
  createdAt: string;
  brand: {
    companyName: string;
    website: string | null;
    logo: string | null;
    user: {
      name: string;
      email: string;
    };
  };
  contentListing: {
    id: string;
    title: string;
    topic: string;
    plannedPublishDate: string;
  };
  adSlot: {
    id: string;
    slotType: string;
    reservePrice: string;
  };
}

export default function CreatorBids() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Bid[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingBid, setProcessingBid] = useState(false);
  const [paymentTiming, setPaymentTiming] = useState<'UPFRONT' | 'AFTER_DELIVERY'>('AFTER_DELIVERY');
  const [rejectReason, setRejectReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBids();
    }
  }, [status]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bids');
      if (response.ok) {
        const data = await response.json();
        setBids(data);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async () => {
    if (!selectedBid) return;

    try {
      setProcessingBid(true);
      setErrorMessage('');

      const response = await fetch(`/api/bids/${selectedBid.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentTiming }),
      });

      if (response.ok) {
        setSuccessMessage('Bid accepted! A deal has been created.');
        setShowAcceptModal(false);
        setSelectedBid(null);
        fetchBids();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Failed to accept bid');
      }
    } catch (error) {
      setErrorMessage('Failed to accept bid');
    } finally {
      setProcessingBid(false);
    }
  };

  const handleRejectBid = async () => {
    if (!selectedBid) return;

    try {
      setProcessingBid(true);
      setErrorMessage('');

      const response = await fetch(`/api/bids/${selectedBid.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (response.ok) {
        setSuccessMessage('Bid rejected.');
        setShowRejectModal(false);
        setSelectedBid(null);
        setRejectReason('');
        fetchBids();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Failed to reject bid');
      }
    } catch (error) {
      setErrorMessage('Failed to reject bid');
    } finally {
      setProcessingBid(false);
    }
  };

  const formatSlotType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: React.ReactNode }> = {
      PENDING: { color: 'bg-yellow-500/20 text-yellow-400', icon: <Clock className="w-4 h-4" /> },
      ACCEPTED: { color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-4 h-4" /> },
      REJECTED: { color: 'bg-red-500/20 text-red-400', icon: <XCircle className="w-4 h-4" /> },
      EXPIRED: { color: 'bg-gray-500/20 text-gray-400', icon: <Clock className="w-4 h-4" /> },
      OUTBID: { color: 'bg-orange-500/20 text-orange-400', icon: <TrendingUp className="w-4 h-4" /> },
    };
    return badges[status] || badges.PENDING;
  };

  const filteredBids = bids.filter((bid) => {
    if (filter === 'all') return true;
    return bid.status === filter;
  });

  const pendingBidsCount = bids.filter((b) => b.status === 'PENDING').length;
  const totalBidValue = bids
    .filter((b) => b.status === 'PENDING')
    .reduce((sum, b) => sum + parseFloat(b.bidAmount), 0);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
              <span className="text-xl font-bold text-white">AdStream</span>
            </div>
            <div className="flex gap-4">
              <a href="/creator/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</a>
              <a href="/creator/bids" className="text-white font-medium">Bids</a>
              <a href="/creator/deals" className="text-gray-400 hover:text-white transition">Deals</a>
              <a href="/creator/earnings" className="text-gray-400 hover:text-white transition">Earnings</a>
              <a href="/creator/analytics" className="text-gray-400 hover:text-white transition">Analytics</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/creator/profile" className="text-gray-400 hover:text-white transition">Profile</a>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Incoming Bids</h1>
            <p className="text-gray-300">Review and respond to brand sponsorship offers</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {errorMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Pending Bids</span>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">{pendingBidsCount}</div>
            <div className="text-sm text-gray-400 mt-1">Awaiting your response</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Bid Value</span>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">${totalBidValue.toFixed(2)}</div>
            <div className="text-sm text-gray-400 mt-1">From pending bids</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Bids</span>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{bids.length}</div>
            <div className="text-sm text-gray-400 mt-1">All time</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'PENDING', 'ACCEPTED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Bids' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Bids List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          {filteredBids.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No bids found</p>
              <p className="text-gray-500 text-sm">
                {filter === 'all'
                  ? "When brands place bids on your content, they'll appear here"
                  : `No ${filter.toLowerCase()} bids`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBids.map((bid) => {
                const statusBadge = getStatusBadge(bid.status);
                return (
                  <div
                    key={bid.id}
                    className="bg-slate-700/50 rounded-lg p-6 border border-purple-500/10 hover:border-purple-500/30 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                            {bid.brand.companyName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{bid.brand.companyName}</h3>
                            <p className="text-sm text-gray-400">{bid.brand.user.email}</p>
                          </div>
                          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                            {statusBadge.icon}
                            {bid.status}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                              <Video className="w-4 h-4" />
                              Content
                            </div>
                            <p className="text-white font-medium">{bid.contentListing.title}</p>
                            <p className="text-gray-400 text-sm">{bid.contentListing.topic}</p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                              <Calendar className="w-4 h-4" />
                              Ad Slot
                            </div>
                            <p className="text-white font-medium">{formatSlotType(bid.adSlot.slotType)}</p>
                            <p className="text-gray-400 text-sm">
                              Reserve: ${parseFloat(bid.adSlot.reservePrice).toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                              <DollarSign className="w-4 h-4" />
                              Bid Amount
                            </div>
                            <p className="text-2xl font-bold text-green-400">
                              ${parseFloat(bid.bidAmount).toFixed(2)}
                            </p>
                            <p className="text-gray-400 text-sm">
                              You receive: ${(parseFloat(bid.bidAmount) * 0.8).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {bid.message && (
                          <div className="bg-slate-600/30 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-400 mb-1">Message from brand:</p>
                            <p className="text-gray-200">{bid.message}</p>
                          </div>
                        )}

                        <div className="text-sm text-gray-400">
                          Received: {new Date(bid.createdAt).toLocaleDateString()} at{' '}
                          {new Date(bid.createdAt).toLocaleTimeString()}
                        </div>
                      </div>

                      {bid.status === 'PENDING' && (
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedBid(bid);
                              setShowAcceptModal(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBid(bid);
                              setShowRejectModal(true);
                            }}
                            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Accept Modal */}
      {showAcceptModal && selectedBid && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-purple-500/20">
            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Accept Bid</h2>
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  setSelectedBid(null);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Bid Amount</span>
                  <span className="text-xl font-bold text-white">
                    ${parseFloat(selectedBid.bidAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Platform Fee (20%)</span>
                  <span className="text-red-400">
                    -${(parseFloat(selectedBid.bidAmount) * 0.2).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
                  <span className="text-gray-300 font-medium">Your Payout</span>
                  <span className="text-xl font-bold text-green-400">
                    ${(parseFloat(selectedBid.bidAmount) * 0.8).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Timing
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                    <input
                      type="radio"
                      name="paymentTiming"
                      value="AFTER_DELIVERY"
                      checked={paymentTiming === 'AFTER_DELIVERY'}
                      onChange={(e) => setPaymentTiming(e.target.value as 'UPFRONT' | 'AFTER_DELIVERY')}
                      className="mr-3"
                    />
                    <div>
                      <p className="text-white font-medium">After Content Delivery</p>
                      <p className="text-sm text-gray-400">Receive payment after content is verified</p>
                    </div>
                  </label>
                  <label className="flex items-center p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                    <input
                      type="radio"
                      name="paymentTiming"
                      value="UPFRONT"
                      checked={paymentTiming === 'UPFRONT'}
                      onChange={(e) => setPaymentTiming(e.target.value as 'UPFRONT' | 'AFTER_DELIVERY')}
                      className="mr-3"
                    />
                    <div>
                      <p className="text-white font-medium">Upfront Payment</p>
                      <p className="text-sm text-gray-400">Receive payment immediately after brand pays</p>
                    </div>
                  </label>
                </div>
              </div>

              <p className="text-sm text-gray-400">
                By accepting this bid, you agree to feature the brand in your content as specified.
                A deal will be created and the brand will be notified.
              </p>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowAcceptModal(false);
                    setSelectedBid(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptBid}
                  disabled={processingBid}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {processingBid ? 'Processing...' : 'Confirm Accept'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedBid && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-purple-500/20">
            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Reject Bid</h2>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedBid(null);
                  setRejectReason('');
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-white font-medium">{selectedBid.brand.companyName}</p>
                <p className="text-gray-400 text-sm">
                  Bid: ${parseFloat(selectedBid.bidAmount).toFixed(2)} for{' '}
                  {formatSlotType(selectedBid.adSlot.slotType)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  rows={3}
                  placeholder="Let the brand know why you're rejecting this bid..."
                />
              </div>

              <p className="text-sm text-gray-400">
                The brand will be notified that their bid was rejected.
              </p>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedBid(null);
                    setRejectReason('');
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectBid}
                  disabled={processingBid}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {processingBid ? 'Processing...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
