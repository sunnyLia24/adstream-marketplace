'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
  Video,
  ExternalLink,
  Upload,
  X,
  FileCheck,
  Hourglass,
  XCircle,
  Filter,
} from 'lucide-react';

interface Deal {
  id: string;
  dealAmount: string;
  platformFee: string;
  creatorPayout: string;
  paymentTiming: 'UPFRONT' | 'AFTER_DELIVERY';
  paymentStatus: 'PENDING' | 'PAID' | 'PROCESSING' | 'FAILED' | 'REFUNDED';
  contentDelivered: boolean;
  contentUrl: string | null;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPUTED';
  verificationNotes: string | null;
  createdAt: string;
  completedAt: string | null;
  brand: {
    companyName: string;
    website: string | null;
    logo: string | null;
    user: {
      name: string;
      email: string;
    };
  };
  bid: {
    bidAmount: string;
    message: string | null;
    contentListing: {
      id: string;
      title: string;
      topic: string;
      plannedPublishDate: string;
    };
  };
  adSlot: {
    id: string;
    slotType: string;
    reservePrice: string;
  };
}

export default function CreatorDeals() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [processingDelivery, setProcessingDelivery] = useState(false);
  const [contentUrl, setContentUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDeals();
    }
  }, [status]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/deals');
      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitContent = async () => {
    if (!selectedDeal || !contentUrl) return;

    try {
      setProcessingDelivery(true);
      setErrorMessage('');

      const response = await fetch(`/api/deals/${selectedDeal.id}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentUrl }),
      });

      if (response.ok) {
        setSuccessMessage('Content submitted for verification!');
        setShowDeliverModal(false);
        setSelectedDeal(null);
        setContentUrl('');
        fetchDeals();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Failed to submit content');
      }
    } catch (error) {
      setErrorMessage('Failed to submit content');
    } finally {
      setProcessingDelivery(false);
    }
  };

  const formatSlotType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Payment Pending' },
      PAID: { color: 'bg-green-500/20 text-green-400', text: 'Paid' },
      PROCESSING: { color: 'bg-blue-500/20 text-blue-400', text: 'Processing' },
      FAILED: { color: 'bg-red-500/20 text-red-400', text: 'Payment Failed' },
      REFUNDED: { color: 'bg-gray-500/20 text-gray-400', text: 'Refunded' },
    };
    return badges[status] || badges.PENDING;
  };

  const getVerificationStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      PENDING: { color: 'bg-yellow-500/20 text-yellow-400', icon: <Hourglass className="w-4 h-4" />, text: 'Pending Review' },
      APPROVED: { color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-4 h-4" />, text: 'Approved' },
      REJECTED: { color: 'bg-red-500/20 text-red-400', icon: <XCircle className="w-4 h-4" />, text: 'Rejected' },
      DISPUTED: { color: 'bg-orange-500/20 text-orange-400', icon: <AlertCircle className="w-4 h-4" />, text: 'Disputed' },
    };
    return badges[status] || badges.PENDING;
  };

  const filteredDeals = deals.filter((deal) => {
    if (filter === 'all') return true;
    if (filter === 'active') return deal.verificationStatus === 'PENDING' && !deal.contentDelivered;
    if (filter === 'pending') return deal.contentDelivered && deal.verificationStatus === 'PENDING';
    if (filter === 'completed') return deal.verificationStatus === 'APPROVED';
    return true;
  });

  const activeDealsCount = deals.filter((d) => d.verificationStatus === 'PENDING' && !d.contentDelivered).length;
  const pendingVerificationCount = deals.filter((d) => d.contentDelivered && d.verificationStatus === 'PENDING').length;
  const completedDealsCount = deals.filter((d) => d.verificationStatus === 'APPROVED').length;
  const totalEarnings = deals
    .filter((d) => d.verificationStatus === 'APPROVED')
    .reduce((sum, d) => sum + parseFloat(d.creatorPayout), 0);

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
              <a href="/creator/bids" className="text-gray-400 hover:text-white transition">Bids</a>
              <a href="/creator/deals" className="text-white font-medium">Deals</a>
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
            <h1 className="text-4xl font-bold text-white mb-2">My Deals</h1>
            <p className="text-gray-300">Track your sponsorship deals and deliverables</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Active Deals</span>
              <Video className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{activeDealsCount}</div>
            <div className="text-sm text-gray-400 mt-1">Awaiting delivery</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Pending Verification</span>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">{pendingVerificationCount}</div>
            <div className="text-sm text-gray-400 mt-1">Under review</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Completed Deals</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">{completedDealsCount}</div>
            <div className="text-sm text-gray-400 mt-1">Successfully delivered</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Earned</span>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">${totalEarnings.toFixed(2)}</div>
            <div className="text-sm text-gray-400 mt-1">From completed deals</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All Deals' },
            { key: 'active', label: 'Active' },
            { key: 'pending', label: 'Pending Verification' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Deals List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          {filteredDeals.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No deals found</p>
              <p className="text-gray-500 text-sm">
                {filter === 'all'
                  ? 'When you accept bids, deals will appear here'
                  : `No ${filter} deals`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeals.map((deal) => {
                const paymentBadge = getPaymentStatusBadge(deal.paymentStatus);
                const verificationBadge = getVerificationStatusBadge(deal.verificationStatus);
                const needsDelivery = !deal.contentDelivered && deal.verificationStatus === 'PENDING';

                return (
                  <div
                    key={deal.id}
                    className="bg-slate-700/50 rounded-lg p-6 border border-purple-500/10 hover:border-purple-500/30 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                            {deal.brand.companyName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{deal.brand.companyName}</h3>
                            <p className="text-sm text-gray-400">{deal.bid.contentListing.title}</p>
                          </div>
                          <div className="flex gap-2 ml-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentBadge.color}`}>
                              {paymentBadge.text}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${verificationBadge.color}`}>
                              {verificationBadge.icon}
                              {verificationBadge.text}
                            </span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                              <Video className="w-4 h-4" />
                              Ad Slot
                            </div>
                            <p className="text-white font-medium">{formatSlotType(deal.adSlot.slotType)}</p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                              <Calendar className="w-4 h-4" />
                              Publish Date
                            </div>
                            <p className="text-white font-medium">
                              {new Date(deal.bid.contentListing.plannedPublishDate).toLocaleDateString()}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                              <DollarSign className="w-4 h-4" />
                              Deal Amount
                            </div>
                            <p className="text-white font-medium">
                              ${parseFloat(deal.dealAmount).toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                              <DollarSign className="w-4 h-4" />
                              Your Payout
                            </div>
                            <p className="text-xl font-bold text-green-400">
                              ${parseFloat(deal.creatorPayout).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {deal.contentUrl && (
                          <div className="bg-slate-600/30 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-400 mb-1">Content URL:</p>
                            <a
                              href={deal.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            >
                              {deal.contentUrl}
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        )}

                        {deal.verificationNotes && (
                          <div className={`rounded-lg p-3 mb-4 ${
                            deal.verificationStatus === 'REJECTED'
                              ? 'bg-red-500/10 border border-red-500/30'
                              : 'bg-slate-600/30'
                          }`}>
                            <p className="text-sm text-gray-400 mb-1">Verification Notes:</p>
                            <p className={deal.verificationStatus === 'REJECTED' ? 'text-red-300' : 'text-gray-200'}>
                              {deal.verificationNotes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Deal created: {new Date(deal.createdAt).toLocaleDateString()}</span>
                          <span>Payment: {deal.paymentTiming === 'UPFRONT' ? 'Upfront' : 'After Delivery'}</span>
                          {deal.completedAt && (
                            <span>Completed: {new Date(deal.completedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      {needsDelivery && (
                        <div className="ml-4">
                          <button
                            onClick={() => {
                              setSelectedDeal(deal);
                              setShowDeliverModal(true);
                            }}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Submit Content
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

      {/* Deliver Content Modal */}
      {showDeliverModal && selectedDeal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-purple-500/20">
            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Submit Content</h2>
              <button
                onClick={() => {
                  setShowDeliverModal(false);
                  setSelectedDeal(null);
                  setContentUrl('');
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-white font-medium">{selectedDeal.brand.companyName}</p>
                <p className="text-gray-400 text-sm">
                  {formatSlotType(selectedDeal.adSlot.slotType)} for {selectedDeal.bid.contentListing.title}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content URL *
                </label>
                <input
                  type="url"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Provide the URL to your published content
                </p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-sm text-purple-300">
                  <strong>What happens next:</strong>
                </p>
                <ul className="text-sm text-gray-400 mt-2 space-y-1">
                  <li>• The brand will review your content</li>
                  <li>• Once approved, your payment will be processed</li>
                  <li>• You&apos;ll receive ${parseFloat(selectedDeal.creatorPayout).toFixed(2)} after verification</li>
                </ul>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowDeliverModal(false);
                    setSelectedDeal(null);
                    setContentUrl('');
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitContent}
                  disabled={processingDelivery || !contentUrl}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {processingDelivery ? 'Submitting...' : 'Submit Content'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
